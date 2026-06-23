from typing import AsyncGenerator
from datetime import datetime, timedelta
import random
import uuid
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.config.settings import settings

# Importar todos los modelos para asegurar su registro en SQLModel.metadata
from src.models.user import User, UserRole
from src.models.document import Document
from src.models.vector_knowledge import LegalEmbedding
from src.models.ai_log import AILog
from src.models.payment_transaction import PaymentTransaction, PaymentStatus, PaymentMethod
from src.models.plan_anual import PlanAnual
from src.models.unidad import Unidad
from src.models.sesion import Sesion
from src.models.ficha_aprendizaje import FichaAprendizaje
from src.auth.security import hash_password

import ssl

# Asegurar esquema asyncpg
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Configurar SSL para bases de datos remotas en producción (ej. Render)
connect_args = {}
if "localhost" not in db_url and "127.0.0.1" not in db_url and "db_prod" not in db_url:
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ssl_context

# Creamos el motor asíncrono
engine = create_async_engine(
    db_url,
    echo=True,
    future=True,
    connect_args=connect_args
)

# Factoría para generar sesiones asíncronas
async_session_maker = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def init_db() -> None:
    """
    Inicializa la base de datos asegurando la extensión pgvector
    y compilando las tablas del esquema SQLModel.
    Sembrará un dataset administrativo realista.
    """
    async with engine.begin() as conn:
        # Habilitar la extensión de pgvector en Postgres de forma asíncrona
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        # Limpiar base de datos para recrear con los nuevos campos
        await conn.run_sync(SQLModel.metadata.drop_all)
        # Crear todas las tablas registradas en la metadata de SQLModel
        await conn.run_sync(SQLModel.metadata.create_all)

    # Sembrar usuarios de prueba y datos de telemetría si no existen
    async with async_session_maker() as session:
        # Verificar si ya tenemos usuarios sembrados
        res_users = await session.execute(select(User).limit(1))
        if res_users.scalar_one_or_none() is not None:
            # Ya existen datos, omitimos el sembrado
            await session.commit()
            return

        print("[INFO] Sembrando base de datos con dataset realista para administración...")
        
        # 1. Crear Administrador
        admin_user = User(
            email="admin@avendia.edu",
            password_hash=hash_password("password123"),
            full_name="Administrador AVENDIA",
            role=UserRole.ADMIN,
            plan_tier="PREMIUM",
            credits=999999,
            credits_total=999999,
            status="activo",
            phone="999888777",
            created_by="sistema",
            areas=10,
            last_access=datetime.utcnow()
        )
        session.add(admin_user)

        # 2. Crear Docentes Realistas (Basados en mockup de la Imagen 1 e Imagen 2)
        docentes_data = [
            ("docente@avendia.edu", "María Gómez", 1000, 1000, "activo", "987654321", "digitalizadodocente", 5),
            ("fredy@avendia.edu", "Fredy Suca", 1800, 1800, "activo", "951523456", "digitalizadodocente", 5),
            ("flor@avendia.edu", "Flor", 150, 1000, "activo", "987543210", "dgabgabriel20", 90),
            ("arojasanchillo@avendia.edu", "Arojasanchillo", 1796, 1800, "activo", "972430875", "digitalizadodocente", 5),
            ("hepilo@avendia.edu", "Hepilo", 1762, 1800, "activo", "983500570", "digitalizadodocente", 5),
            ("msusana@avendia.edu", "Msusana", 31378, 31380, "activo", "949827364", "digitalizadodocente", 5),
            ("mariaenedina@avendia.edu", "Mariaenedinaguevaracerdan", 31378, 31380, "activo", "938472615", "digitalizadodocente", 5),
            ("wilber@avendia.edu", "Wilber", 31380, 31380, "activo", "928374625", "digitalizadodocente", 5),
            ("inactivo@avendia.edu", "Docente Inactivo", 0, 1000, "suspendido", "912345678", "sistema", 3),
            ("critico@avendia.edu", "Docente Consumo Crítico", 120, 1000, "activo", "981273948", "digitalizadodocente", 8),
            ("auxiliar@avendia.edu", "Auxiliar Pedro", 500, 1000, "activo", "948372615", "digitalizadodocente", 2)
        ]

        docentes_db = []
        now = datetime.utcnow()
        for idx, (email, name, creds, creds_tot, status, phone, creator, areas) in enumerate(docentes_data):
            # Escalonar fechas de registro de forma realista
            reg_date = now - timedelta(days=random.randint(5, 30))
            last_acc = now - timedelta(hours=random.randint(1, 48)) if status == "activo" else None
            
            docente = User(
                email=email,
                password_hash=hash_password("password123"),
                full_name=name,
                role=UserRole.DOCENTE if "Auxiliar" not in name else UserRole.AUXILIAR,
                plan_tier="PREMIUM" if creds > 7 else "FREE",
                credits=creds,
                credits_total=creds_tot,
                status=status,
                phone=phone,
                created_by=creator,
                areas=areas,
                last_access=last_acc,
                created_at=reg_date
            )
            session.add(docente)
            docentes_db.append(docente)

        # Confirmar inserciones de usuarios para poder referenciar sus IDs
        await session.flush()

        # 3. Sembrar Transacciones de Pago Ficticias
        # Queremos un total recaudado bonito y realista
        metodos = [PaymentMethod.YAPE, PaymentMethod.PLIN, PaymentMethod.TRANSFERENCIA, PaymentMethod.SIN_ESPECIFICAR]
        
        # Insertar pagos directos
        for docente in docentes_db:
            if docente.email == "inactivo@avendia.edu":
                continue
                
            # Cada docente activo tiene entre 1 y 3 compras de créditos
            num_pagos = random.randint(1, 3)
            for p_idx in range(num_pagos):
                amount = random.choice([29.90, 30.00, 39.90, 50.00])
                method = random.choice(metodos)
                status = PaymentStatus.COMPLETED
                
                # Simular un pago pendiente para un usuario aleatorio
                if p_idx == 0 and random.random() < 0.15:
                    status = PaymentStatus.PENDING
                    
                pay_date = now - timedelta(days=random.randint(1, 15), hours=random.randint(1, 23))
                
                trans = PaymentTransaction(
                    user_id=docente.id,
                    amount=amount,
                    payment_method=method,
                    status=status,
                    created_at=pay_date
                )
                session.add(trans)

        # 4. Sembrar Documentos e Historial de IA (ai_logs)
        # Queremos llenar los últimos 7 días con actividad de IA para que funcione el filtro "Consumo Crítico"
        doc_types = ["Sesión de Aprendizaje", "Unidad Didáctica", "Informe Pedagógico", "Acta de Reunión"]
        for docente in docentes_db:
            if docente.email == "inactivo@avendia.edu":
                continue
                
            # Generar documentos ficticios
            num_docs = random.randint(2, 6) if docente.email != "critico@avendia.edu" else 15
            for d_idx in range(num_docs):
                doc_date = now - timedelta(days=random.randint(0, 10), hours=random.randint(1, 23))
                
                # Insertar en documentos
                doc_title = f"{random.choice(doc_types)} - {docente.full_name}"
                db_doc = Document(
                    user_id=docente.id,
                    title=doc_title,
                    document_type=random.choice(doc_types),
                    content_data={"seccion": "A", "grado": "3ro", "datos": "Sembrado automático de prueba"},
                    file_path=f"documents/{doc_title.lower().replace(' ', '_')}.docx",
                    created_at=doc_date
                )
                session.add(db_doc)

                # Insertar log de IA
                # El usuario critico@avendia.edu consume muchos tokens
                scale = 4.0 if docente.email == "critico@avendia.edu" else 1.0
                prompt_tokens = int(random.randint(800, 2500) * scale)
                comp_tokens = int(random.randint(500, 1500) * scale)
                tot_tokens = prompt_tokens + comp_tokens
                
                # Precio estimado
                cost_usd = (prompt_tokens * 0.000000075) + (comp_tokens * 0.00000030)
                cost_sol = cost_usd * 3.80
                
                ai_log = AILog(
                    user_id=docente.id,
                    model_name="gemini-3.5-flash",
                    prompt_tokens=prompt_tokens,
                    completion_tokens=comp_tokens,
                    total_tokens=tot_tokens,
                    cost_usd=cost_usd,
                    cost_soles=cost_sol,
                    created_at=doc_date
                )
                session.add(ai_log)

        # 5. Sembrar Jerarquía Curricular en Cascada para docente@avendia.edu
        res_doc = await session.execute(select(User).where(User.email == "docente@avendia.edu"))
        doc_user = res_doc.scalar_one_or_none()
        if doc_user:
            # Crear Plan Anual
            mock_plan = PlanAnual(
                docente_id=doc_user.id,
                grado="3ro",
                seccion="A",
                area_curricular="Matemática",
                dre="SAN MARTÍN",
                ugel="LAMAS",
                institucion_educativa="IE N° 00536 - Francisco Izquierdo",
                ciclo="Ciclo VII",
                turno="Mañana",
                descripcion_estudiante="Los estudiantes del tercer grado se encuentran en un proceso de transición física y emocional, con intereses diversos en actividades lúdicas y tecnológicas.",
                descripcion_contexto_local="La comunidad se dedica principalmente a la agricultura y el comercio local. La institución cuenta con conectividad a internet limitada.",
                organizacion_tiempo={
                    "I Bimestre": {"inicio": "2026-03-16", "fin": "2026-05-15"},
                    "II Bimestre": {"inicio": "2026-05-18", "fin": "2026-07-24"},
                    "III Bimestre": {"inicio": "2026-08-10", "fin": "2026-10-09"},
                    "IV Bimestre": {"inicio": "2026-10-12", "fin": "2026-12-18"}
                },
                enfoques_transversales={
                    "lista": ["Enfoque de Derechos", "Enfoque Intercultural", "Enfoque Ambiental"]
                },
                competencias_anuales=[
                    {
                        "competencia_id": "C1",
                        "nombre": "Resuelve problemas de cantidad",
                        "capacidades": [
                            "Traduce cantidades a expresiones numéricas",
                            "Comunica su comprensión sobre los números y las operaciones",
                            "Usa estrategias y procedimientos de estimación y cálculo",
                            "Argumenta afirmaciones sobre las relaciones numéricas y las operaciones"
                        ],
                        "desempeños_priorizados": [
                            "Establece relaciones entre datos y acciones de comparar, igualar e incorporar cantidades, y las transforma a expresiones numéricas.",
                            "Expresa con diversas representaciones y lenguaje numérico su comprensión de la fracción como parte-todo."
                        ]
                    },
                    {
                        "competencia_id": "C2",
                        "nombre": "Resuelve problemas de regularidad, equivalencia y cambio",
                        "capacidades": [
                            "Traduce datos y condiciones a expresiones algebraicas y gráficas",
                            "Comunica su comprensión sobre las relaciones algebraicas",
                            "Usa estrategias y procedimientos para encontrar equivalencias y reglas generales",
                            "Argumenta afirmaciones sobre relaciones de cambio y equivalencia"
                        ],
                        "desempeños_priorizados": [
                            "Establece relaciones entre datos, valores desconocidos, regularidades y condiciones de equivalencia, y las transforma a ecuaciones lineales."
                        ]
                    }
                ]
            )
            session.add(mock_plan)
            await session.flush()

            # Crear Unidades de Aprendizaje (2 unidades)
            unidades_data = [
                (1, "Nos conocemos y organizamos nuestra aula para aprender matemáticas jugando", "Los estudiantes del tercer grado se encuentran en un proceso de transición y necesitan organizarse. El reto es diseñar juegos matemáticos que promuevan la convivencia.", 4),
                (2, "Investigamos sobre el consumo saludable y aplicamos fracciones y estadísticas", "En la escuela se observa desnutrición. Los alumnos deben investigar los nutrientes de los alimentos locales y elaborar estadísticas de consumo.", 4)
            ]

            for num_u, title_u, sit_u, dur_u in unidades_data:
                mock_unidad = Unidad(
                    plan_anual_id=mock_plan.id,
                    numero_unidad=num_u,
                    titulo=title_u,
                    situacion_significativa=sit_u,
                    duracion_semanas=dur_u,
                    competencias_especificas={
                        "competencias": [
                            "Resuelve problemas de cantidad",
                            "Resuelve problemas de regularidad, equivalencia y cambio"
                        ]
                    }
                )
                session.add(mock_unidad)
                await session.flush()

                # Crear Sesiones (3 sesiones por cada unidad)
                for num_s in range(1, 4):
                    mock_sesion = Sesion(
                        unidad_id=mock_unidad.id,
                        numero_sesion=num_s,
                        titulo_sesion=f"Sesión {num_s}: Resolviendo retos numéricos en grupo para la Unidad {num_u}",
                        proposito_aprendizaje=f"Hoy aprenderemos a resolver problemas matemáticos de la vida diaria utilizando estrategias didácticas divertidas de la Unidad {num_u}.",
                        criterios_evaluacion={
                            "criterios": [
                                "Representa números de hasta tres cifras usando material concreto.",
                                "Explica el proceso de resolución de problemas aditivos."
                            ]
                        },
                        secuencia_didactica={
                            "inicio": "El docente da la bienvenida, presenta una situación problemática y recoge los saberes previos mediante preguntas.",
                            "desarrollo": "Los estudiantes se organizan en grupos, manipulan el material base de diez y representan gráficamente sus soluciones.",
                            "cierre": "Metacognición: ¿Qué aprendimos hoy? ¿Cómo lo aprendimos? Reflexión final sobre el trabajo grupal."
                        }
                    )
                    session.add(mock_sesion)
                    await session.flush()

                    # Crear Ficha de Aprendizaje (1 por sesión)
                    mock_ficha = FichaAprendizaje(
                        sesion_id=mock_sesion.id,
                        contenido_markdown=(
                            f"# Ficha de Trabajo: Reto Matemático {num_s}\n\n"
                            f"**Propósito:** {mock_sesion.proposito_aprendizaje}\n\n"
                            "## Actividad Principal\n"
                            "Lee atentamente la situación problemática y responde utilizando tus propias estrategias:\n\n"
                            "*Juan tiene 150 canicas de colores y regala 45 canicas a su hermano Pedro.* En base a esto, realiza:\n"
                            "1. Representa gráficamente la cantidad inicial de canicas.\n"
                            "2. Calcula cuántas canicas le quedan a Juan utilizando el tablero de valor posicional.\n"
                        ),
                        actividades={
                            "preguntas": [
                                "¿Qué datos tenemos en el problema?",
                                "¿Qué operación debes realizar para resolver la situación?",
                                "Redacta tu respuesta formal."
                            ]
                        }
                    )
                    session.add(mock_ficha)

        print("[SUCCESS] Base de datos inicializada y sembrada con éxito.")
        await session.commit()

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependencia asíncrona para inyectar sesiones en los endpoints de FastAPI.
    """
    async with async_session_maker() as session:
        yield session
        await session.commit()

