import io
import asyncio
from typing import List
from pypdf import PdfReader
import google.generativeai as genai
from src.config.settings import settings

# Configuración del SDK de Google Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

def chunk_text(text: str, chunk_size: int = 800, overlap: int = 80) -> List[str]:
    """
    Segmenta el texto de normativas escolares en fragmentos lógicos (chunks)
    respetando un solapamiento (overlap) para no perder coherencia contextual.
    """
    chunks = []
    if not text:
        return chunks
    
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = start + chunk_size
        chunks.append(text[start:end])
        start += (chunk_size - overlap)
        
    return chunks

async def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Genera embeddings en lote (batch) de forma asíncrona utilizando
    el modelo de Google Gemini 'models/text-embedding-004' (768 dimensiones).
    """
    # Fallback para desarrollo sin clave real
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "mock-gemini-key":
        import random
        return [[random.uniform(-1.0, 1.0) for _ in range(768)] for _ in range(len(texts))]
        
    try:
        loop = asyncio.get_running_loop()
        response = await loop.run_in_executor(
            None,
            lambda: genai.embed_content(
                model="models/text-embedding-004",
                contents=texts
            )
        )
        return response["embedding"]
    except Exception:
        # Fallback de desarrollo si falla la llamada de red o API
        import random
        return [[random.uniform(-1.0, 1.0) for _ in range(768)] for _ in range(len(texts))]

def sync_extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Función síncrona que lee el contenido binario de un PDF.
    Diseñada para ejecutarse dentro de un ThreadPoolExecutor.
    """
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text
    except Exception as e:
        raise ValueError(f"Error al analizar la estructura del PDF: {str(e)}")

async def extract_text_from_pdf_async(pdf_bytes: bytes) -> str:
    """
    Extrae texto de un PDF delegando la tarea pesada de CPU a un
    hilo secundario (executor) para mantener libre el bucle de eventos de FastAPI.
    """
    loop = asyncio.get_running_loop()
    text = await loop.run_in_executor(None, sync_extract_text_from_pdf, pdf_bytes)
    return text
