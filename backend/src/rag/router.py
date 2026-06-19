from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlmodel.ext.asyncio.session import AsyncSession
from src.config.database import get_session
from src.auth.dependencies import RoleChecker
from src.models.user import UserRole
from src.models.vector_knowledge import LegalEmbedding
from src.rag.service import extract_text_from_pdf_async, chunk_text, get_embeddings_batch

router = APIRouter()

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
    _current_user = Depends(RoleChecker([UserRole.ADMIN]))
):
    """
    Endpoint protegido para Administradores.
    Sube un archivo PDF, extrae su texto en segundo plano, genera embeddings y
    los almacena en pgvector de forma transaccional.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de archivo no soportado. Debe ser un archivo .pdf"
        )
        
    try:
        # Leer los bytes del archivo subido
        pdf_bytes = await file.read()
        
        # Extraer texto de forma asíncrona
        text = await extract_text_from_pdf_async(pdf_bytes)
        if not text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El PDF cargado no posee texto legible para indexar."
            )
            
        # Dividir texto en fragmentos (chunks)
        chunks = chunk_text(text)
        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo está vacío o no se pudieron generar fragmentos."
            )
            
        # Generar embeddings en lote (batch)
        embeddings = await get_embeddings_batch(chunks)
        
        # Guardar registros en la base de datos
        for chunk, embedding in zip(chunks, embeddings):
            db_embedding = LegalEmbedding(
                source_name=file.filename,
                page_number=1,  # Por simplificación mapeado a 1
                text_chunk=chunk,
                embedding=embedding
            )
            session.add(db_embedding)
            
        await session.commit()
        
        return {
            "status": "success",
            "filename": file.filename,
            "chunks_indexed": len(chunks)
        }
        
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno durante la indexación: {str(e)}"
        )
