from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional
import uuid
import json

from src.config.database import get_session
from src.auth.dependencies import RoleChecker
from src.models.user import User, UserRole
from src.models.document import Document
from src.models.plan_anual import PlanAnual
from src.models.unidad import Unidad
from src.models.sesion import Sesion
from src.models.ficha_aprendizaje import FichaAprendizaje
from src.documents.schemas import PlanAnualCreate, UnidadCreate, SesionCreate
from src.documents.service import generate_document_content, create_editable_docx

router = APIRouter()

# Esquema de solicitud genérica
class DocumentGenerateRequest(BaseModel):
    document_type: str  # Ej: "Informe Pedagógico", "Acta"
    title: str
    form_data: dict     # Campos del formulario dinámico en JSON

@router.post("/generate", status_code=status.HTTP_200_OK)
async def generate_word_document(
    payload: DocumentGenerateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(RoleChecker([
        UserRole.DOCENTE,
        UserRole.DIRECTOR,
        UserRole.AUXILIAR,
        UserRole.ADMIN
    ]))
):
    """
    Ruta protegida para usuarios autenticados.
    Obtiene la redacción formal de Gemini usando RAG, genera un documento Word
    editable en memoria, lo registra en PostgreSQL y lo transmite como descarga.
    """
    try:
        markdown_text = await generate_document_content(
            user_id=str(current_user.id),
            doc_type=payload.document_type,
            form_data=payload.form_data,
            session=session
        )
        
        docx_buffer = create_editable_docx(
            title=payload.title,
            markdown_content=markdown_text
        )
        
        db_document = Document(
            user_id=current_user.id,
            title=payload.title,
            document_type=payload.document_type,
            content_data=payload.form_data,
            file_path=f"documents/{payload.title.lower().replace(' ', '_')}.docx"
        )
        session.add(db_document)
        await session.commit()
        
        docx_buffer.seek(0)
        filename = f"{payload.title.replace(' ', '_')}.docx"
        
        return StreamingResponse(
            docx_buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar e inyectar el documento Word: {str(e)}"
        )


# =====================================================================
# Endpoints de Planificación en Cascada
# =====================================================================

@router.get("/plan-anual", status_code=status.HTTP_200_OK)
async def list_planes_anuales(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(RoleChecker([UserRole.DOCENTE, UserRole.ADMIN]))
):
    """
    Obtiene todos los planes anuales creados por el docente.
    """
    result = await session.execute(
        select(PlanAnual).where(PlanAnual.docente_id == current_user.id)
    )
    planes = result.scalars().all()
    return planes


@router.post("/plan-anual", status_code=status.HTTP_201_CREATED)
async def create_plan_anual(
    payload: PlanAnualCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(RoleChecker([UserRole.DOCENTE, UserRole.ADMIN]))
):
    """
    Registra un Plan Anual en base de datos y genera el Word curricular correspondiente.
    """
    try:
        # 1. Crear el objeto en la BD con los nuevos campos del MINEDU y CNEB
        ie_val = payload.institucion_educativa or payload.ie or ""
        desc_est = payload.descripcion_estudiante or payload.caracteristicas_estudiantes or ""
        desc_ctx = payload.descripcion_contexto_local or payload.contexto_local or ""
        
        db_plan = PlanAnual(
            docente_id=current_user.id,
            grado=payload.grado,
            seccion=payload.seccion,
            area_curricular=payload.area_curricular,
            dre=payload.dre,
            ugel=payload.ugel,
            institucion_educativa=ie_val,
            ciclo=payload.ciclo,
            turno=payload.turno,
            descripcion_estudiante=desc_est,
            descripcion_contexto_local=desc_ctx,
            organizacion_tiempo=payload.organizacion_tiempo,
            enfoques_transversales={"enfoques": payload.enfoques_transversales},
            competencias_anuales=payload.competencias_anuales
        )
        session.add(db_plan)
        await session.commit()
        await session.refresh(db_plan)
        
        # 2. Generar el contenido del documento usando Gemini
        form_data = payload.dict()
        form_data["plan_anual_id"] = str(db_plan.id)
        
        markdown_text = await generate_document_content(
            user_id=str(current_user.id),
            doc_type="Plan Curricular Anual",
            form_data=form_data,
            session=session
        )
        
        # 3. Generar el docx
        title = f"Plan Anual {payload.area_curricular} {payload.grado} {payload.seccion}"
        docx_buffer = create_editable_docx(title=title, markdown_content=markdown_text)
        
        # Guardar en Documentos genéricos
        db_document = Document(
            user_id=current_user.id,
            title=title,
            document_type="Plan Anual",
            content_data=form_data,
            file_path=f"documents/plan_anual_{db_plan.id}.docx"
        )
        session.add(db_document)
        await session.commit()
        
        docx_buffer.seek(0)
        filename = f"Plan_Anual_{payload.area_curricular.replace(' ', '_')}_{payload.grado.replace(' ', '_')}.docx"
        
        return StreamingResponse(
            docx_buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "X-Plan-Anual-ID": str(db_plan.id)
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar y generar el Plan Anual: {str(e)}"
        )


@router.get("/unidades", status_code=status.HTTP_200_OK)
async def list_unidades(
    plan_anual_id: Optional[uuid.UUID] = Query(None, description="Filtrar por plan anual específico"),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(RoleChecker([UserRole.DOCENTE, UserRole.ADMIN]))
):
    """
    Obtiene todas las unidades del docente.
    """
    query = select(Unidad).join(PlanAnual).where(PlanAnual.docente_id == current_user.id)
    if plan_anual_id:
        query = query.where(Unidad.plan_anual_id == plan_anual_id)
        
    result = await session.execute(query)
    unidades = result.scalars().all()
    return unidades


@router.post("/unidad", status_code=status.HTTP_201_CREATED)
async def create_unidad(
    payload: UnidadCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(RoleChecker([UserRole.DOCENTE, UserRole.ADMIN]))
):
    """
    Registra una Unidad heredando datos del Plan Anual si existe, y genera el Word.
    """
    try:
        # Resolver herencia de cascada si viene plan_anual_id
        inherited_context = {}
        if payload.plan_anual_id:
            plan_uuid = uuid.UUID(payload.plan_anual_id)
            plan_result = await session.execute(
                select(PlanAnual).where(PlanAnual.id == plan_uuid, PlanAnual.docente_id == current_user.id)
            )
            plan = plan_result.scalar_one_or_none()
            if plan:
                inherited_context = {
                    "grado": plan.grado,
                    "seccion": plan.seccion,
                    "area_curricular": plan.area_curricular,
                    "enfoques_transversales_plan": plan.enfoques_transversales
                }
                # Completar campos vacíos del payload con datos del Plan
                if not payload.grado:
                    payload.grado = plan.grado
                if not payload.area_curricular:
                    payload.area_curricular = plan.area_curricular
        
        # Registrar unidad
        db_unidad = Unidad(
            plan_anual_id=uuid.UUID(payload.plan_anual_id) if payload.plan_anual_id else None,
            numero_unidad=payload.numero_unidad,
            titulo=payload.titulo,
            situacion_significativa=payload.situacion_significativa,
            duracion_semanas=payload.duracion_semanas,
            competencias_especificas=payload.competencias_especificas
        )
        session.add(db_unidad)
        await session.commit()
        await session.refresh(db_unidad)
        
        form_data = payload.dict()
        form_data["unidad_id"] = str(db_unidad.id)
        form_data["contexto_heredado"] = inherited_context
        
        markdown_text = await generate_document_content(
            user_id=str(current_user.id),
            doc_type="Unidad de Aprendizaje",
            form_data=form_data,
            session=session
        )
        
        title = f"Unidad {payload.numero_unidad} - {payload.titulo}"
        docx_buffer = create_editable_docx(title=title, markdown_content=markdown_text)
        
        db_document = Document(
            user_id=current_user.id,
            title=title,
            document_type="Unidad de Aprendizaje",
            content_data=form_data,
            file_path=f"documents/unidad_{db_unidad.id}.docx"
        )
        session.add(db_document)
        await session.commit()
        
        docx_buffer.seek(0)
        filename = f"Unidad_{payload.numero_unidad}_{payload.titulo.replace(' ', '_')}.docx"
        
        return StreamingResponse(
            docx_buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "X-Unidad-ID": str(db_unidad.id)
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar y generar la Unidad: {str(e)}"
        )


@router.get("/sesiones", status_code=status.HTTP_200_OK)
async def list_sesiones(
    unidad_id: Optional[uuid.UUID] = Query(None, description="Filtrar por unidad específica"),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(RoleChecker([UserRole.DOCENTE, UserRole.ADMIN]))
):
    """
    Obtiene todas las sesiones del docente.
    """
    query = select(Sesion).join(Unidad).join(PlanAnual).where(PlanAnual.docente_id == current_user.id)
    if unidad_id:
        query = query.where(Sesion.unidad_id == unidad_id)
        
    result = await session.execute(query)
    sesiones = result.scalars().all()
    return sesiones


@router.post("/sesion", status_code=status.HTTP_201_CREATED)
async def create_sesion(
    payload: SesionCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(RoleChecker([UserRole.DOCENTE, UserRole.ADMIN]))
):
    """
    Registra una Sesión, hereda datos de la Unidad y genera el Word.
    También genera opcionalmente una Ficha de Aprendizaje asociada.
    """
    try:
        # Resolver contexto heredado de la Unidad
        inherited_context = {}
        if payload.unidad_id:
            unidad_uuid = uuid.UUID(payload.unidad_id)
            unidad_result = await session.execute(
                select(Unidad).where(Unidad.id == unidad_uuid)
            )
            unidad = unidad_result.scalar_one_or_none()
            if unidad:
                inherited_context = {
                    "unidad_titulo": unidad.titulo,
                    "unidad_numero": unidad.numero_unidad,
                    "situacion_significativa": unidad.situacion_significativa
                }
                if not payload.titulo_unidad:
                    payload.titulo_unidad = unidad.titulo
        
        # Registrar sesión en base de datos
        db_sesion = Sesion(
            unidad_id=uuid.UUID(payload.unidad_id) if payload.unidad_id else None,
            numero_sesion=payload.numero_sesion,
            titulo_sesion=payload.titulo_sesion,
            proposito_aprendizaje=payload.proposito_unidad or "Propósito a determinar",
            criterios_evaluacion={"instrumento": payload.instrumento_evaluacion, "habilidades_especiales": payload.incluir_habilidades_especiales},
            secuencia_didactica={"duracion_minutos": payload.duracion_minutos}
        )
        session.add(db_sesion)
        await session.commit()
        await session.refresh(db_sesion)
        
        form_data = payload.dict()
        form_data["sesion_id"] = str(db_sesion.id)
        form_data["contexto_heredado"] = inherited_context
        
        # Generar contenido de la sesión con Gemini
        markdown_text = await generate_document_content(
            user_id=str(current_user.id),
            doc_type="Sesión de Aprendizaje",
            form_data=form_data,
            session=session
        )
        
        # Si se solicita ficha, la generamos e inyectamos al final del markdown
        if payload.generar_ficha:
            ficha_prompt = (
                f"Genera una Ficha de Aprendizaje de {payload.num_preguntas_ficha} preguntas "
                f"basándote en el siguiente tema de la sesión: '{payload.tema}'.\n"
                f"Incluye solucionario: {payload.incluir_solucionario}.\n"
                f"Formato: Markdown limpio con subtítulo 'Ficha de Aplicación'."
            )
            
            loop = asyncio.get_running_loop()
            response = await loop.run_in_executor(
                None,
                lambda: model.generate_content(ficha_prompt)
            )
            ficha_text = response.text or ""
            
            # Guardar Ficha en BD
            db_ficha = FichaAprendizaje(
                sesion_id=db_sesion.id,
                contenido_markdown=ficha_text,
                actividades={"num_preguntas": payload.num_preguntas_ficha, "solucionario": payload.incluir_solucionario}
            )
            session.add(db_ficha)
            await session.commit()
            
            # Anexar al documento Word
            markdown_text += "\n\n---\n\n" + ficha_text
            
        # Generar el docx
        title = f"Sesión {payload.numero_sesion} - {payload.titulo_sesion}"
        docx_buffer = create_editable_docx(title=title, markdown_content=markdown_text)
        
        db_document = Document(
            user_id=current_user.id,
            title=title,
            document_type="Sesión de Aprendizaje",
            content_data=form_data,
            file_path=f"documents/sesion_{db_sesion.id}.docx"
        )
        session.add(db_document)
        await session.commit()
        
        docx_buffer.seek(0)
        filename = f"Sesion_{payload.numero_sesion}_{payload.titulo_sesion.replace(' ', '_')}.docx"
        
        return StreamingResponse(
            docx_buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "X-Sesion-ID": str(db_sesion.id)
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar y generar la Sesión: {str(e)}"
        )
