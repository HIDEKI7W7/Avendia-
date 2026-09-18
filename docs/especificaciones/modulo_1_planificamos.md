# ESPECIFICACIÓN DETALLADA — MÓDULO 1: PLANIFICAMOS (8 HERRAMIENTAS)

Esta especificación detalla la homologación completa de los formularios, generación IA y formato Word de cada una de las 8 herramientas del módulo **Planificamos**, replicando exactamente los cuadros, opciones y notas de `C:\Users\PC\Desktop\Avendia` con el diseño y paleta oficial de Avend Escala 3.0.

---

## 1. PLAN CURRICULAR ANUAL (PCA) (`/dashboard/planificamos/plan-curricular-anual`)

### A. Campos y Cuadros de Entrada (9 Pasos)
- **Paso 1: DATOS INFORMATIVOS Y ESTRUCTURA**
  * **Bloque 1: 1. DATOS INFORMATIVOS (DRE / UGEL / I.E.)** (Grid 3 columnas)
    - DRE *: Input texto | Placeholder: "Ej: SAN MARTÍN"
    - UGEL *: Input texto | Placeholder: "Ej: LAMAS"
    - Institución Educativa *: Input texto | Placeholder: "Ej: MARTÍN DE LA RIVA Y HERRERA"
  * **Bloque 2: 2. ESTRUCTURA Y MODALIDAD CURRICULAR** (Grid 3 columnas)
    - Modelo de Servicio Educativo (MSE): Select con 6 opciones:
      ["JER (Jornada Escolar Regular)", "JEC (Jornada Escolar Completa)", "MSR (Modelo de Servicio en Secundaria Rural)", "SRE (Secundaria con Residencia Estudiantil)", "ST (Secundaria Tutorial)", "EIB (Educación Intercultural Bilingüe)"]
    - Modalidad: Select con ["EBR (Educación Básica Regular)", "EBA (Educación Básica Alternativa)", "EBE (Educación Básica Especial)"]
    - Nivel Académico: Select con ["Inicial", "Primaria", "Secundaria"]
    - Generar PCA por: Radio buttons (•) Grado | ( ) Ciclo
    - Grado Académico / Ciclo: Select dinámico según el nivel y radio seleccionado.
    - Secciones: Input texto | Placeholder: "Ej: A, B, C, D"
    - Tiempo de Ejecución: Input texto | Placeholder: "Ej: Del 16 de marzo al 18 de diciembre"
    - Año Lectivo: Input numérico con valor predeterminado "2026"
  * **Bloque 3: 3. SELECCIÓN DE ÁREAS CURRICULARES**
    - Multi-select con chips interactivos de áreas CNEB del nivel.
  * **Bloque 4: 4. RESPONSABLES Y ENFOQUE DEL DOCUMENTO**
    - Docente responsable *, Director(a) *, Subdirector(a) (opcional).
    - Enfoque pedagógico: Select ["Constructivista / sociocognitivo", "ABP", "Aula invertida", "STEM"]
    - Tono de redacción: Select ["Técnico y formal", "Práctico y sencillo", "Innovador y tecnológico"]
    - Enfoque de evaluación: Select ["Evaluación formativa (continua)", "Sumativa", "Autoevaluación y coevaluación"]
- **Paso 2: DESCRIPCIÓN Y DIAGNÓSTICO**
  * 4 Textareas con botón Sugerir / Pulir con IA: Justificación, Perfil de egreso, Características de los estudiantes y Contexto territorial.
- **Paso 3: CALENDARIZACIÓN DEL AÑO ESCOLAR**
  * Subtítulo: "SUBA LA IMAGEN DE SU CALENDARIZACIÓN DEL AÑO ESCOLAR (OPCIONAL). SI NO LA SUBE, EN EL DOCUMENTO WORD APARECERÁ UN ESPACIO PARA QUE LA PEGUE DESPUÉS."
  * Dropzone interactivo de imagen (PNG, JPG, máx. 5MB) con previsualización y botón de quitar.
  * Consejo metodológico rotulado con icono de bombilla.
- **Paso 4: DEMANDAS Y MATRIZ DE PROBLEMAS**
  * Selector: Bimestral (4 unidades) o Trimestral (3 unidades).
  * Matriz de problemas priorizados: Lista dinámica de filas con botón + Añadir problema y modal para pegar problemas en lote.
  * Prioridades institucionales 1, 2 y 3.
- **Paso 5: COMPETENCIAS, ENFOQUES Y TUTORÍA**
  * Selección de competencias CNEB priorizadas.
  * Enfoques transversales multicheck (Derechos, Inclusivo, Intercultural, Género, Ambiental, Bien común, Excelencia).
  * Dimensiones de tutoría (Personal, Social, Aprendizaje) y actividades vinculadas.
- **Paso 6: MATERIALES Y RECURSOS**
  * Listas dinámicas de recursos del docente, del estudiante y catálogo de textos MINEDU.
- **Paso 7: REFERENCIAS NORMATIVAS**
  * Resoluciones RVM MINEDU vigentes y marco curricular CNEB.
- **Paso 8: BIBLIOGRAFÍA**
  * Bibliografía APA para docente y estudiante + libros propios del docente.
- **Paso 9: CIERRE, VALIDACIÓN Y EXPORTACIÓN**
  * Vista previa integral del PCA y botón de descarga en formato Word (.docx).

### B. Generación con IA
- Rol: Asesor Pedagógico y Metodólogo del MINEDU especialista en el CNEB.
- Parámetros: Inyecta DRE, UGEL, I.E., MSE, Nivel, Grado, Áreas y Enfoques.
- Salida: Textos técnicos en tercera persona por campo y matriz anual completa en formato tabular.

### C. Formato Word Generado (.docx)
- Sistema de diseño compartido (`frontend/src/features/tools/docx/`): cabecera con logo
  del Ministerio y lema del año, pie con "Página X de Y", bandas de título en azul
  `2D7DD2`, cabeceras de tabla en `2E75B6` con texto blanco y filas alternas `EBF5FB`.
- Portada, índice, I. Datos informativos, II. Síntesis, III. Calendarización por
  periodos (cuadrícula construida desde la matriz de calendarización), IV. Matrices
  anuales con color por familia (diagnóstico, currículo, evaluación, recursos),
  V. Recomendaciones y VI. Validación con líneas de firma.
- Orientación horizontal; las filas no se cortan entre páginas y las cabeceras se repiten.

## 2. SESIÓN DE APRENDIZAJE (`/dashboard/sesiones`)

### A. Contrato con la IA
- Secciones: Necesidades de aprendizaje, DUA según contexto, Trabajo entre pares,
  Evaluación y retroalimentación, Teoría del tema (tres subsecciones) e Ideas fuerza.
- Matrices (`_TABLE_BLUEPRINTS["sesion-aprendizaje"]`): Secuencia didáctica, Propósitos
  de aprendizaje, Alineamiento pedagógico (propósito ¿qué/cómo/para qué?, reto, evidencia,
  producto, estándar del ciclo), Enfoques transversales, Instrumento de evaluación, Ficha
  de trabajo (5 a 8 consignas de tipos variados) y Mapa mental.
- Controles de calidad: `session_sequence` (P0: tres momentos, suma de minutos, acciones
  observables) y `session_annexes` (P1: ficha y mapa completos).

### B. Formato Word Generado (.docx)
- Reproduce el formato de referencia del docente: título "SESIÓN DE APRENDIZAJE N° __",
  bloques I a VIII con bandas de color, ilustración por momento (Inicio, Desarrollo,
  Cierre) alternando lado, firmas del docente y del director.
- Anexos en página nueva: Teoría del tema, Instrumento de evaluación (guía con la nómina
  aportada o diez filas en blanco), Ficha de trabajo (tarjetas por consigna, espacio para
  el producto y autoevaluación) y Mapa mental.
- El contenido lo produce la IA y el documento ocupa las hojas que necesite; si falta un
  bloque se usan los datos del formulario o líneas de llenado, nunca "No registrado".
- Las ilustraciones y el logo van incrustados (`docx/assets.ts`), sin descargas externas.
- La vista previa (`SessionDocumentPreview.tsx`) usa los mismos datos y colores que el Word.

## 3. CREAR MI CLASE (`/dashboard/crear-clase`)

Ruta principal para el docente: un asistente de cuatro pasos (Datos, Competencias,
Enfoques, Evaluación) genera la Sesión de Aprendizaje con el formato de referencia y,
con "Siguiente", encadena el Instrumento de evaluación (lista de cotejo, guía de
observación, rúbrica o escala) y los Materiales (teoría, ficha de trabajo y mapa
mental). Cada etapa se guarda como documento en el historial y queda relacionada con la
sesión de origen (`/documents/relations`). La lógica vive en
`frontend/src/features/classes/classWizard.ts` y la página en `CreateClassPage.tsx`.

- Datos institucionales precargados desde el perfil; competencias del CNEB por área
  (máximo dos) o sugeridas por la IA; exactamente dos enfoques; título sugerido con IA.
- No se muestran el panel de control de calidad ni los diálogos de sugerencia por campo.
- La herramienta suelta "Sesión de Aprendizaje" sigue disponible para sesiones no
  ligadas a instrumento ni materiales.
