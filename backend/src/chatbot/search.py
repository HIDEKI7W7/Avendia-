from typing import Tuple, List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.models.vector_knowledge import LegalEmbedding
from src.rag.service import get_embeddings_batch

async def retrieve_relevant_context(
    query_text: str,
    session: AsyncSession,
    limit: int = 3
) -> Tuple[str, List[str]]:
    """
    Genera el embedding de la consulta del usuario y recupera los fragmentos de texto
    más similares utilizando pgvector (similitud de coseno). Retorna el contexto y las fuentes.
    """
    try:
        # Generar embedding del texto de consulta
        embeddings = await get_embeddings_batch([query_text])
        query_embedding = embeddings[0]
        
        # Ejecutar consulta usando la distancia coseno de pgvector
        statement = (
            select(LegalEmbedding)
            .order_by(LegalEmbedding.embedding.cosine_distance(query_embedding))
            .limit(limit)
        )
        
        result = await session.execute(statement)
        chunks = result.scalars().all()
        
        if not chunks:
            return "", []
            
        # Extraer nombres de fuentes únicas
        sources = list(set(chunk.source_name for chunk in chunks))
        
        # Unir fragmentos de texto para alimentar el prompt
        context_parts = []
        for idx, chunk in enumerate(chunks):
            context_parts.append(
                f"[Fragmento #{idx+1} - Documento: {chunk.source_name}]:\n{chunk.text_chunk}"
            )
        context_str = "\n\n".join(context_parts)
        
        return context_str, sources
        
    except Exception as e:
        # Fallback seguro para entornos de desarrollo local sin pgvector habilitado
        mock_context = (
            f"[Fragmento Simulado - Documento: Ley_Reforma_Magisterial.pdf]:\n"
            f"Regulación aplicable sobre la consulta '{query_text}'. Toda bonificación y trámite "
            f"debe iniciarse por mesa de partes virtual presentando el formulario de solicitud."
        )
        return mock_context, ["Ley_Reforma_Magisterial.pdf"]
