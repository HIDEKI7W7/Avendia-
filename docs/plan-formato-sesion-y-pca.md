# Plan: nuevo formato de Sesión de Aprendizaje y Plan Curricular Anual

Referencia de diseño: `Sesion-Fenómeno_El_Niño_¿Cómo_nos_afecta_y_cómo_nos_preparamos.docx`
(enviado por AVEND DOCENTE, 11/09/2026). El objetivo es que Avendia genere Word con
**ese mismo diseño** (cabeceras de color, tablas con bandas, ilustraciones por momento,
anexos con fichas), pero **funcional**: el contenido lo produce la IA con los datos del
docente y el documento ocupa las hojas que necesite. Nada de plantillas estáticas de
3 páginas con texto recortado.

## Estado

Implementado en esta rama:

- Sistema de diseño compartido en `frontend/src/features/tools/docx/` (`theme.ts`,
  `chrome.ts`, `blocks.ts`, `images.ts`, `assets.ts`) y aplicado a todos los
  exportadores de `exportWorkflowDocx.ts` (cabecera con logo y lema, pie, bandas,
  cabeceras de tabla, firmas).
- Sesión de Aprendizaje: `buildSessionDocx.ts` + `sessionContent.ts` con los bloques
  I–VIII, ilustraciones por momento y anexos; contrato de la IA ampliado en el backend
  (siete matrices, secciones de teoría, control `session_annexes`).
- PCA: `exportPlanAnualDocx.ts` sobre el sistema compartido, con cuadrícula de periodos
  y color por familia de matriz.
- Vistas previas: `SessionDocumentPreview.tsx` nueva, `PlanAnualDocumentPreview.tsx`
  con cabecera y cuadrícula, y paleta de `word-preview.css` alineada con el Word.

Pendiente (fase 3 del plan): generación opcional de ilustraciones por tema con IA y lema
del año configurable desde administración. Hoy las ilustraciones son el set base
incrustado y el lema es el del año en curso.

## 1. Diagnóstico del estado actual

| Aspecto | Hoy | Referencia |
| --- | --- | --- |
| Dónde se arma el Word | `frontend/src/features/tools/exportWorkflowDocx.ts` (`buildDocumentDocx`, genérico para 20+ herramientas) y `exportPlanAnualDocx.ts` | Documento diseñado a mano en Word |
| Estructura de la sesión | Portada + I. Información general + II. Propósito + tablas de la IA + secciones libres | 8 apartados fijos (I–VIII) + Teoría del tema + Instrumento + Ficha de trabajo + Mapa mental |
| Datos que devuelve la IA | `GeneratedWorkflowArtifact` genérico: `sections[]`, `tables[]`, `key_points[]` (backend `app/modules/ai/schemas.py`) | Campos precisos: competencia, capacidades, desempeños, criterios, estándar, propósito ¿qué/cómo/para qué?, reto, evidencia, producto, enfoques, DUA, momentos con procesos didácticos, referencias, teoría, instrumento, ficha |
| Colores | Azul MINEDU `1F4D78` / `2E74B5` / `BDD7EE`, zebra `F8FAFC` | Paleta por bloque: `2D7DD2`, `2E75B6`, `0F4761`, `1B4F72`, `0B769F` en cabeceras; `DAE9F7`, `EBF5FB` en bandas; acentos `EE964B`, `3FA34D`, `17A398`, `7B6CD9` |
| Tipografía | Calibri | Calibri cuerpo, Bahnschrift SemiBold en títulos de bloque, Segoe UI en emojis |
| Imágenes | Ninguna | Logo MINEDU en cabecera, 3 ilustraciones (Inicio / Desarrollo / Cierre) ancladas a la derecha/izquierda del texto, 5 ilustraciones en la ficha |
| Encabezado de página | Texto plano | Lema del año (“Año de la Esperanza y el Fortalecimiento de la Democracia”) + logo MINEDU alineado a la izquierda |
| Firmas | Tabla | Líneas `DOCENTE DEL ÁREA` / `DIRECTOR/COORDINADOR` |
| Ficha del estudiante | No existe en la sesión (solo en `ficha-aprendizaje`) | Ficha con datos, 5 reactivos variados (opción múltiple, V/F, completar, desarrollo), espacio para organizador y autoevaluación |

Conclusión: el problema no es solo estético. La IA hoy no devuelve los campos que el
formato necesita, así que el exportador rellena con genéricos. El plan ataca las dos
capas: **contrato de datos** y **motor de maquetación**.

## 2. Principios del nuevo formato

1. **El diseño es fijo, el contenido es variable.** Cada bloque (tabla o sección) crece
   con el texto. Las filas nunca se cortan entre páginas (`cantSplit`), las cabeceras
   se repiten (`tableHeader`) y no se fuerzan saltos de página salvo entre anexos.
2. **Sin celdas vacías inventadas.** Si el docente no aporta un dato se deja línea de
   llenado (`________`), regla ya vigente en el repo.
3. **Todo pasa por `/api/v1`.** Las ilustraciones se sirven desde el backend, nunca se
   descargan desde el navegador (regla de `CLAUDE.md` y `app/core/safe_http.py`).
4. **Un solo sistema de diseño** compartido entre Sesión, Unidad y PCA: mismos colores,
   misma cabecera, mismas firmas, mismo pie.

## 3. Estructura objetivo del Word de Sesión

Orden y diseño calcados de la referencia; el contenido viene de la IA.

| # | Bloque | Fuente del dato | Diseño |
| --- | --- | --- | --- |
| — | Título `SESIÓN DE APRENDIZAJE N° __ “TÍTULO”` | `document_title` + `session_number` | Centrado, Bahnschrift, azul `1F4D78` |
| I | Datos informativos | Formulario (docente, director, IE, nivel, grado, área, tema, fecha, duración, unidad) | Tabla 2 columnas, cabecera `2D7DD2`, etiquetas en `DAE9F7` |
| II | Propósitos de aprendizaje del CNEB | IA: competencia principal + capacidades, desempeños del grado, criterios; competencia de apoyo + capacidades; estándar del ciclo | Tabla 3 columnas con viñetas ✓ |
| III | Alineamiento pedagógico | IA: propósito (¿Qué? ¿Cómo? ¿Para qué?), reto y situación significativa, evidencia, producto | Tabla 3 columnas + fila de producto |
| IV | Necesidades de aprendizaje e instrumento | IA: lista de necesidades; formulario: instrumento elegido | Tabla 2 columnas |
| V | Enfoques transversales, DUA y trabajo entre pares | IA: enfoque + valor + actitud; DUA según contexto (usa el campo de contexto del formulario) | Tabla con subcabeceras `0B769F` |
| VI | Procesos pedagógicos y actividades | IA: Inicio / Desarrollo / Cierre con tiempo y sub-procesos (motivación, saberes previos, conflicto cognitivo, propósito, problematización, análisis, pausa activa, toma de decisiones, evaluación, metacognición) | Fila por momento; ilustración anclada alternando derecha/izquierda; texto fluye alrededor |
| VII | Evaluación (criterios ↔ evidencia ↔ instrumento) | IA | Tabla 3 columnas (la referencia lo salta de VI a VIII; se restituye) |
| VIII | Soporte pedagógico y fuentes | Formulario + IA: referencias, recursos, materiales | Tabla 3 columnas |
| — | Firmas | — | Dos líneas centradas |
| Anexo 1 | Teoría del tema | IA: introducción, conceptos, características, procedimientos, ejemplos contextualizados, ideas fuerza | Cabecera de banda + párrafos; extensión libre |
| Anexo 2 | Instrumento de evaluación | IA: criterios de II; nómina si hay `rosters` vinculado | Guía de observación / lista de cotejo según el instrumento elegido |
| Anexo 3 | Ficha de trabajo | IA: 5–8 reactivos (`response_type` ya existe en `WorkflowActivityItem`) + espacio para el producto + autoevaluación | Tarjetas con borde de color, ilustraciones pequeñas |
| Anexo 4 | Mapa mental / infografía | IA: nodo central + 4–6 ramas | Tabla de cajas con flechas ▼ |

Cada anexo empieza en página nueva. Todo lo demás fluye.

## 4. Estructura objetivo del PCA

Se conserva la orientación horizontal ya implementada (`exportPlanAnualDocx.ts`) y se
le aplica el mismo sistema de diseño:

- Portada con cabecera MINEDU, lema del año, título `PLAN CURRICULAR ANUAL – {año}`,
  datos institucionales y bloque de firmas.
- Índice (ya existe con `TableOfContents`).
- Las 17 matrices que ya devuelve la IA (`ai/service.py`, prompt `plan-curricular-anual`)
  se maquetan con cabecera de color por familia: diagnóstico y demandas en `0B769F`,
  calendarización y organización curricular en `2D7DD2`, evaluación y retroalimentación
  en `1B4F72`, recursos y compromisos en `0F4761`.
- La calendarización se muestra además como **cuadrícula de bimestres/trimestres**
  (columna por periodo, fila por unidad) generada desde la misma tabla.
- Firmas al final, no en la portada.

## 5. Cambios por capa

### 5.1 Backend: contrato de datos de la sesión

Archivos: `backend/app/modules/ai/schemas.py`, `tool_contracts.py`, `service.py`,
`docs/api-contract.md`.

1. Nuevo modelo `SessionPlanArtifact` (extiende `GeneratedWorkflowArtifact` con
   `session: SessionPlanDetail | None`):
   - `purposes`: competencia principal, capacidades, desempeños, criterios, competencia
     de apoyo, estándar del ciclo.
   - `alignment`: propósito (`what`, `how`, `why`), reto, situación significativa,
     evidencia, producto.
   - `needs`: lista; `instrument`: nombre.
   - `approaches`: lista de {enfoque, valor, actitud}; `dua_context`; `peer_work`.
   - `moments`: exactamente tres {name, minutes, steps: [{label, text}]}.
   - `sources`: referencias, recursos, materiales.
   - `theory`: {intro, concepts, characteristics, procedures, examples, key_ideas}.
   - `worksheet`: reutiliza `WorkflowActivity` (ya soporta `response_type`).
   - `mind_map`: {center, branches: [{title, items}]}.
2. Prompt de `sesion-aprendizaje` en `service.py`: pedir el JSON con esa forma;
   mantener las tablas actuales para no romper la vista previa hasta el corte.
3. `GenerationQualityCheck` nuevos: suma de minutos = duración, 3 momentos, cada
   momento con ≥ 3 pasos, ficha con ≥ 5 reactivos y tipos distintos, teoría con
   ≥ 4 subsecciones.
4. Compatibilidad: si la IA no devuelve `session`, el exportador cae al formato
   actual. Sin errores simulados.

### 5.2 Backend: ilustraciones

Archivos: `backend/app/modules/ai/presentation_images.py`, `router.py`, nuevo
`backend/app/assets/session/`.

1. Empaquetar un set base de ilustraciones libres (estilo caricatura escolar como la
   referencia): 3 por momento × 3 variantes (inicial, primaria, secundaria), 6 para
   fichas, logo MINEDU y logo Avendia. Se sirven en `GET /api/v1/ai/session-images/{id}`
   con el mismo mecanismo de `read_presentation_image` (autenticado, cache inmutable).
2. Opcional por configuración (`SESSION_IMAGES_AI=true`): generar una ilustración por
   momento con `_generate_gemini_image` a partir del tema, con fallback al set base.
   Siempre vía `safe_http`.
3. La respuesta de generación incluye `image_assets: {inicio, desarrollo, cierre, ficha[]}`
   con los ids a descargar. El frontend los pide al backend, nunca a terceros.

### 5.3 Frontend: motor de maquetación compartido

Nuevo directorio `frontend/src/features/tools/docx/`:

| Archivo | Contenido |
| --- | --- |
| `theme.ts` | Paleta de la referencia, fuentes, tamaños, márgenes A4 (`1417/1701` twips), helpers `bandHeader(color)`, `labelCell`, `bulletRuns("✓")` |
| `chrome.ts` | Cabecera con logo + lema del año, pie con número de página y `IE · Área · Grado`, bloque de firmas |
| `images.ts` | Carga de imágenes desde `/api/v1` a `ArrayBuffer`, `ImageRun` con anclaje flotante (`floating.wrap.type = SQUARE`, alternando `horizontalPosition.align` left/right) y tamaño fijo en EMU |
| `blocks.ts` | Bloques reutilizables: tabla de datos, tabla de propósitos, tabla de alineamiento, tabla de momentos con ilustración, banda de anexo, tarjeta de reactivo, autoevaluación, mapa mental |
| `buildSessionDocx.ts` | Compone la sesión en el orden de la sección 3 |
| `buildPlanAnualDocx.ts` | Reescritura de `exportPlanAnualDocx.ts` sobre `theme` + `chrome` + `blocks` |

Reglas de flujo: `cantSplit` en todas las filas, `tableHeader` en cabeceras, `keepNext`
entre título de bloque y su tabla, `pageBreakBefore` solo en anexos, sin alturas fijas
de fila. Las ilustraciones flotantes usan `behindDocument: false` y `allowOverlap: false`
para que Word/LibreOffice/Google Docs las respeten.

`exportWorkflowDocx.ts` enruta `planificamos/sesion-aprendizaje` a `buildSessionDocx`
cuando el artefacto trae `session`; el resto de herramientas no cambia.

### 5.4 Frontend: vista previa

`WordDocumentPreview.tsx` y `PlanAnualDocumentPreview.tsx` reproducen la misma jerarquía
(cabeceras de banda, tablas, ilustraciones) con CSS, reutilizando los tokens de
`theme.ts` para que lo que se ve coincida con lo que se descarga. Responsive según
`docs/archive/plan-responsive-todos-los-tamanos.md`.

### 5.5 Formulario de la sesión

`frontend/src/config/workflows.ts`: añadir `session_number`, `unit_title`,
`instrument` (select: guía de observación, lista de cotejo, rúbrica, escala),
`context_notes` (para DUA según contexto) y `include_annexes` (teoría, instrumento,
ficha, mapa mental; todos marcados por defecto). Los campos ya existentes de duración,
área, grado, fecha, docente y director se mantienen.

## 6. Fases y entregables

| Fase | Entregable | Verificación |
| --- | --- | --- |
| 1. Sistema de diseño | `theme.ts`, `chrome.ts`, `images.ts`, `blocks.ts` con pruebas unitarias de cada bloque | `npm run test`; Word abierto en LibreOffice sin advertencias |
| 2. Contrato de sesión | Schemas, prompt, quality checks, `api-contract.md` regenerado | `uv run pytest`; CI compara el contrato |
| 3. Ilustraciones | Endpoint `session-images`, set base empaquetado, fallback | Prueba de 404 y de cache; `ruff` |
| 4. Sesión nueva | `buildSessionDocx.ts` + `qaExport18SesionAprendizaje.test.ts` actualizado con un artefacto real de 4–6 páginas | Comparación visual contra el Word de referencia (mismo orden, colores, imágenes) |
| 5. PCA | `buildPlanAnualDocx.ts` sobre el sistema compartido, cuadrícula de periodos | `qaExport16PlanAnual.test.ts` |
| 6. Vista previa | Ambas previews con el diseño nuevo | Capturas en `docs/qa-evidence.md` |
| 7. Cierre | Documentación en `docs/especificaciones/modulo_1_planificamos.md`, formato institucional (`templates/branding.py`) compatible con la cabecera nueva | Revisión con el docente sobre 3 sesiones reales de distintas áreas |

Orden sugerido: 1 → 2 → 4 (ya se puede entregar la sesión con imágenes del set base)
→ 3 → 5 → 6 → 7. Fases 2 y 3 pueden avanzar en paralelo.

## 7. Riesgos y decisiones

- **Imágenes flotantes en Google Docs.** Docs respeta anclajes `SQUARE` pero no
  `TIGHT`; se usa `SQUARE` y márgenes de 0,2 cm. Se valida en Word, LibreOffice y Docs.
- **Longitud del JSON de la IA.** Con teoría + ficha + mapa el artefacto crece; subir
  `maxOutputTokens` de `sesion-aprendizaje` a 24 576 y permitir reparación parcial
  (`repair_attempted`) por bloque.
- **Formato institucional (`templates/branding.py`).** Sustituye cabecera y pie del
  Word generado; la cabecera nueva debe vivir en `header1.xml` estándar para que
  `apply_template_branding` la reemplace limpiamente.
- **Derechos de las ilustraciones.** Solo recursos con licencia libre o generados; se
  registra la fuente de cada archivo en `backend/app/assets/session/LICENSES.md`.
- **Lema del año.** Configurable en administración (`admin`), con valor por defecto
  del año en curso; no se codifica en el exportador.
