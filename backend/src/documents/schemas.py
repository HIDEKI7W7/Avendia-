from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# =====================================================================
# Plan Anual Schemas
# =====================================================================

class PlanAnualCreate(BaseModel):
    # DRE, UGEL, IE
    dre: str = Field(..., description="Dirección Regional de Educación", example="SAN MARTÍN")
    ugel: str = Field(..., description="Unidad de Gestión Educativa Local", example="LAMAS")
    ie: str = Field(..., description="Institución Educativa", example="Mi Colegio Premium")
    
    # MSE, Modalidad, Nivel
    mse: str = Field("JER", description="Modelo de Servicio Educativo (JEC, JER, Otro)")
    modalidad: str = Field("EBR", description="Modalidad educativa (EBR, EBA, EBE)")
    nivel: str = Field("Secundaria", description="Nivel educativo (Inicial, Primaria, Secundaria, EBR unidocente)")
    
    # Área, Grado, Sección, Año
    area_curricular: str = Field(..., description="Área Curricular", example="Matemática")
    grado: str = Field(..., description="Grado de estudio", example="3er Grado")
    seccion: str = Field(..., description="Sección o secciones", example="A")
    ano_lectivo: int = Field(2026, description="Año escolar")
    tiempo: Optional[str] = Field("Del 16 de marzo al 18 de diciembre del 2026", description="Fechas del año lectivo")
    
    # Firma y directivos
    docente_responsable: str = Field(..., description="Docente a cargo")
    director: Optional[str] = Field(None, description="Nombre del director")
    subdirector: Optional[str] = Field(None, description="Nombre del subdirector")
    
    # Contexto local e IA
    contexto_local: Optional[str] = Field(None, description="Contexto local o realidad del centro")
    justificacion: Optional[str] = Field(None, description="Justificación o necesidades de aprendizaje")
    perfil_egreso: Optional[str] = Field(None, description="Perfil de egreso esperado")
    caracteristicas_estudiantes: Optional[str] = Field(None, description="Características de los estudiantes")
    caracteristicas_contexto: Optional[str] = Field(None, description="Características del contexto")
    
    # Enfoques y competencias (JSONB)
    enfoques_transversales: List[str] = Field(default_factory=list, description="Lista de enfoques transversales seleccionados")
    competencias_anuales: Dict[str, List[str]] = Field(default_factory=dict, description="Competencias y capacidades priorizadas")


# =====================================================================
# Unidad Schemas
# =====================================================================

class UnidadCreate(BaseModel):
    plan_anual_id: Optional[str] = Field(None, description="ID del Plan Anual padre (opcional si se crea directo)")
    numero_unidad: int = Field(..., description="Número ordinal de la unidad", example=1)
    titulo: str = Field(..., description="Título de la unidad", example="Unidad 1: Los números racionales en nuestra vida")
    
    # Fechas
    fecha_inicio: Optional[str] = Field(None, description="Fecha de inicio (YYYY-MM-DD o texto)")
    fecha_fin: Optional[str] = Field(None, description="Fecha de fin (YYYY-MM-DD o texto)")
    duracion_semanas: int = Field(4, description="Duración en semanas")
    
    # Contexto
    situacion_significativa: str = Field(..., description="Situación Significativa redactada o manual")
    situacion_source: str = Field("ia", description="Origen de la situación ('ia' o 'manual')")
    contexto_estudiantes: Optional[str] = Field(None, description="Contexto específico DUA 2026")
    
    # Campos didácticos
    producto: Optional[str] = Field(None, description="Productos esperados por área")
    campos_tematicos: Optional[str] = Field(None, description="Campos temáticos y conceptos clave")
    
    # Relación a área/grado heredada (para validación)
    docente: Optional[str] = Field(None, description="Nombre del docente")
    director: Optional[str] = Field(None, description="Nombre del director")
    ie: Optional[str] = Field(None, description="Institución Educativa")
    nivel: Optional[str] = Field(None, description="Nivel")
    grado: Optional[str] = Field(None, description="Grado")
    area_curricular: Optional[str] = Field(None, description="Área")
    periodo: Optional[str] = Field("I Bimestre", description="Bimestre/Trimestre")
    num_estudiantes: Optional[int] = Field(25, description="Número de alumnos")
    turno: Optional[str] = Field("Mañana", description="Turno")
    
    # Enfoques transversales de la unidad
    enfoques_transversales: List[str] = Field(default_factory=list, description="Enfoques específicos de la unidad")
    competencias_especificas: Dict[str, Any] = Field(default_factory=dict, description="Competencias, capacidades y criterios")


# =====================================================================
# Sesión Schemas
# =====================================================================

class SesionCreate(BaseModel):
    unidad_id: Optional[str] = Field(None, description="ID de la Unidad padre (opcional)")
    numero_sesion: int = Field(..., description="Número de sesión", example=1)
    tema: str = Field(..., description="Tema específico de la sesión", example="Ecuaciones lineales en el mercado")
    titulo_sesion: str = Field(..., description="Título de la sesión", example="Resolvemos ecuaciones lineales")
    
    # Contexto e información heredada de la unidad/plan
    docente: Optional[str] = Field(None, description="Nombre del docente")
    colegio: Optional[str] = Field(None, description="I.E.")
    director: Optional[str] = Field(None, description="Director")
    contexto_estudiantes: Optional[str] = Field(None, description="Contexto DUA 2026")
    nivel: Optional[str] = Field(None, description="Nivel")
    grado: Optional[str] = Field(None, description="Grado")
    area_curricular: Optional[str] = Field(None, description="Área")
    titulo_unidad: Optional[str] = Field(None, description="Título de la unidad de referencia")
    proposito_unidad: Optional[str] = Field(None, description="Propósito heredado de la unidad")
    
    # Configuración de la sesión
    competencia_transversal: Optional[str] = Field(None, description="Competencia transversal (TIC o autonomía)")
    enfoques_transversales: List[str] = Field(default_factory=list, description="Enfoques de la sesión")
    referencias: Optional[str] = Field(None, description="Referencias bibliográficas")
    recursos: Optional[str] = Field(None, description="Recursos digitales")
    materiales: Optional[str] = Field(None, description="Materiales de clase")
    duracion_minutos: int = Field(90, description="Duración en minutos (45, 90, 135, 180, etc.)")
    
    # Evaluación y estudiantes
    instrumento_evaluacion: str = Field("lista_cotejo", description="Instrumento (lista_cotejo, rubrica, guia_observacion)")
    lista_alumnos: Optional[str] = Field(None, description="Nombres de alumnos uno por línea")
    incluir_habilidades_especiales: bool = Field(False, description="Incluir adaptaciones NEE")
    
    # Generación adicional
    generar_ficha: bool = Field(True, description="Si genera una ficha de aplicación asociada")
    num_preguntas_ficha: int = Field(5, description="Número de preguntas de la ficha")
    incluir_solucionario: bool = Field(True, description="Si incluye solucionario en la ficha")
