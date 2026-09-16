# Plan: flujo "Crear mi clase" y ajustes al formato de sesión

## Estado de ejecución

Implementado en la rama (ver sección 7 para el detalle):

- Word de sesión: bloque IV Competencias transversales (dos filas fijas), exactamente
  dos enfoques, filas Estándar (amarillo), Producto (verde) y DUA (salmón) resaltadas,
  numeración como la referencia. Vista previa alineada.
- Herramientas: etiquetas "Necesario para crear / Puedes completarlo después"
  sustituidas por asterisco y "Opcional"; panel "Control de calidad" plegado bajo
  "Detalle técnico de la generación"; el bloque "Crear desde cero o continuar una
  secuencia" pasa a llamarse "Reutilizar datos de un documento guardado (opcional)";
  zoom de la vista previa ampliado hasta 240 %.
- Portada: bloque "Crea tu clase completa" con la línea de tres etapas y un solo botón
  "Crear mi clase". Entrada "Crear mi clase" en el menú lateral.
- Asistente `/dashboard/crear-clase`: cuatro pasos (Datos, Competencias, Enfoques,
  Evaluación), datos del perfil precargados, competencias del CNEB por área con máximo
  dos, "Dejar que la IA sugiera la competencia", enfoques como chips (elige 2),
  "Sugerir con IA" para el título, duración en horas pedagógicas, instrumento y nómina
  desde las listas guardadas. Sin panel de calidad ni diálogos por campo.
- Cadena: la sesión generada alimenta el instrumento (lista de cotejo, guía de
  observación, rúbrica o escala) con sus criterios, evidencia y nómina; los materiales
  (teoría, ficha, mapa mental) se entregan como Word propio. Los tres documentos se
  guardan en el historial y quedan relacionados entre sí.

Pendiente: ilustraciones generadas por tema, prueba con Gemini real y las preguntas
abiertas de las secciones 4 y 5.5. El lema del año ya se configura desde administración
(ver `plan-formato-sesion-y-pca.md`).

Fuente: audio y video del cliente (WhatsApp, 11/09/2026, 3 min 52 s) donde muestra
la pantalla de inicio de Avendia, el asistente "Nueva Clase" de nitia.ai y el Word de
referencia `Sesion-Fenómeno_El_Niño`. Este documento solo planifica; no se ha
implementado nada de lo que sigue.

## 1. Lo que pide el cliente

### 1.1 "Crear mi clase" es una cadena, no tres botones

- En el inicio, el bloque **"Crea tu clase completa"** muestra tres chips: *Sesión de
  aprendizaje*, *Instrumento de evaluación* y *Materiales*. Hoy parecen botones y
  llevan a cada herramienta por separado. El cliente no quiere eso.
- Los tres textos deben ser **enunciados de los pasos** (no clicables) y un único
  botón **"Crear mi clase"** arranca la cadena:
  1. Genera la **sesión**.
  2. Con "Siguiente", genera el **instrumento de evaluación** a partir de esa sesión
     (lista de cotejo, rúbrica, ficha de observación, escala; el docente elige).
  3. Con "Siguiente", genera los **materiales** a partir de la sesión y el instrumento.
- Cada paso usa lo generado en el anterior como insumo; el material debe ser el de
  esa sesión, no un recurso genérico.
- Referencia de experiencia: nitia.ai. En el video se ve su asistente "Nueva Clase":
  pasos numerados (1 Datos, 2 Propósitos, ...), campos Tema, Nivel, Grado, Área,
  Duración ("2 horas pedagógicas (90 min)") y dos opcionales plegados: "Agregar
  situación significativa" y "Agregar material de referencia". Pocos campos
  obligatorios y el resto opcional.
- Debajo de la cadena sigue el bloque "Herramientas más utilizadas", como nitia.

### 1.2 Qué es "Materiales" y qué es "Instrumento" dentro de la cadena

- **Materiales** = teoría del tema + ficha de trabajo (+ mapa mental) derivados de la
  sesión. En el Word de referencia van como anexos después de las firmas.
- **Instrumento** = la guía o lista que se aplica al evaluar (guía de observación,
  lista de cotejo, rúbrica...). En el Word de referencia es el anexo "Instrumento de
  evaluación".

### 1.3 Formato del Word de sesión (validado contra el video)

El cliente recorre el Word de referencia y confirma el orden. Diferencias con lo que
ya está implementado en la rama:

| Bloque en la referencia (video) | Estado en la rama | Ajuste pendiente |
| --- | --- | --- |
| Logo del Ministerio + lema del año en cada página | Hecho | — |
| I. Datos informativos (docente, director, IE, nivel, grado, área, tema, fecha, duración, unidad) | Hecho | — |
| II. Propósitos de aprendizaje del CNEB: competencia principal y capacidades, desempeños, criterios; fila "Competencia de apoyo / Capacidades"; fila **Estándar del ciclo** resaltada en amarillo | Hecho (estándar sin resaltar) | Resaltar la fila del estándar (amarillo en la referencia; en nuestra paleta, `FFF7EC`) |
| III. Alineamiento pedagógico: propósito (¿qué?, ¿cómo?, ¿para qué?), reto y situación significativa, evidencia; fila **Producto** en verde claro | Hecho (producto sin color) | Fila Producto en verde claro |
| Necesidades de aprendizaje / Instrumento de evaluación | Hecho | — |
| **IV. Competencias transversales**: tabla Competencias y capacidades / Estándar / Desempeños / Criterios, **siempre dos filas** ("Se desenvuelve en entornos virtuales generados por las TIC" y "Gestiona su aprendizaje de manera autónoma") | **No existe** | Bloque nuevo: dos competencias transversales fijas con sus capacidades, estándar, desempeño y criterio; la IA las contextualiza al tema |
| **V. Enfoques transversales / Atención a la diversidad / DUA**: tabla Enfoque / Valores / Actitud, **dos enfoques** (los que marcó el docente); filas DUA y "DUA según contexto" en color salmón | Hecho parcialmente (acepta cualquier número de enfoques) | Exactamente dos enfoques; si el docente marcó más de dos, tomar los dos primeros; si no marcó, la IA propone dos. Filas DUA en `FFF7EC` |
| VI. Procesos pedagógicos: Inicio (imagen a la izquierda), Desarrollo (imagen a la derecha), Cierre (imagen a la izquierda), con "✓ Motivación", "✓ Saberes previos", etc. | Hecho | — |
| VIII. Soporte pedagógico: referencias, recursos, materiales | Hecho | — |
| Firmas: DOCENTE DEL ÁREA / DIRECTOR-COORDINADOR | Hecho | — |
| Teoría del tema (introducción, conceptos, características, procedimientos, ejemplos, ideas fuerza) | Hecho | — |
| Instrumento (guía de observación con nómina) | Hecho | — |
| Ficha de trabajo con ilustraciones y consignas numeradas | Hecho | — |
| Mapa mental | Hecho | — |

Nota: en la referencia la numeración salta de VI a VIII (no hay VII). Mantener
nuestro VII "Evaluación de los aprendizajes" salvo que el cliente pida quitarlo.

### 1.4 Observaciones sobre la interfaz

- Lo que el cliente vio al generar una sesión (video, minuto 3:20) es el formato
  **anterior**: títulos planos "X. CIERRE", "XI. EVALUACIÓN Y RETROALIMENTACIÓN".
  El formato nuevo ya está en la rama pero no desplegado.
- "¿Qué rol cumple este botoncito?": en la página de la herramienta aparece el
  bloque **"Empezar de cero o continuar una secuencia"** con un stepper
  (Curso ✓, Competencias ✓, Enfoques ✓). El cliente no entiende para qué sirve.
  Hay que ocultarlo o explicarlo con una frase.
- El **zoom de la vista previa** (botones menos / más) no permite agrandar lo
  suficiente. Subir el máximo y permitir ajustar al ancho.
- El audio se corta en "cuando estoy en sesión..."; queda una observación
  pendiente de pedir.

## 2. Diseño propuesto del flujo "Crear mi clase"

### 2.1 Pantalla de inicio

- Bloque "Crea tu clase completa" con los tres pasos dibujados como una línea de
  proceso (1 Sesión → 2 Instrumento → 3 Materiales), sin comportamiento de botón.
- Un solo botón primario **"Crear mi clase"** que abre el asistente.
- El resto de la portada (herramientas más utilizadas, módulos) no cambia.

### 2.2 Asistente "Nueva clase" (ruta `/dashboard/crear-clase`)

Pasos del formulario, tomando de nitia solo lo esencial y reutilizando los campos
que ya existen en `sesion-aprendizaje`:

1. **Datos**: tema (obligatorio), nivel, grado, área, duración (selector de horas
   pedagógicas: 1 = 45 min, 2 = 90 min, 3 = 135 min), fecha, unidad. Datos
   institucionales precargados desde el perfil del docente.
2. **Propósitos**: competencia principal (lista del CNEB por área y nivel), competencia
   de apoyo (opcional), enfoques transversales (elegir dos), instrumento de
   evaluación (select). Opcionales plegados: situación significativa, material de
   referencia (texto, libro del Estado o páginas), contexto del aula.
3. **Generar**: un botón. La IA produce la sesión y se muestra la vista previa con el
   formato de referencia.

Después de la sesión, barra de progreso superior con tres etapas y botón
"Siguiente: instrumento" → "Siguiente: materiales" → "Descargar clase completa".

### 2.3 Encadenamiento de datos

| Etapa | Entrada | Salida | Documento |
| --- | --- | --- | --- |
| 1 Sesión | Formulario | Artefacto de sesión (7 matrices + secciones) | `sesion-de-aprendizaje.docx` |
| 2 Instrumento | Criterios, evidencia, competencia y nómina de la sesión + tipo elegido | Artefacto del instrumento (`lista-cotejo`, `rubrica-evaluacion`, `ficha-observacion` o `escala-estimacion`, según elección) | `instrumento.docx` |
| 3 Materiales | Sesión + instrumento | Teoría del tema, ficha de trabajo, mapa mental (ya generados con la sesión) y, opcionalmente, presentación didáctica | `materiales.docx` (+ `.pptx`) |

- El backend recibe en la etapa 2 y 3 un campo `source_session_id` y añade al prompt
  las matrices de la sesión guardada, con la regla "usa exactamente estos criterios y
  esta evidencia".
- Se guarda un registro `class_bundle` (sesión, instrumento, materiales) para
  reabrir la clase completa y descargar los tres archivos en un ZIP.
- Ya existe `documents/relations` para vincular documentos; se reutiliza en lugar de
  crear otra tabla.

### 2.4 Cambios por capa

**Backend**
- `WorkflowGenerationRequest`: campo opcional `source_document_id`.
- `service.py`: si viene `source_document_id`, inyectar en el prompt las tablas del
  documento origen y la regla de coherencia; quality check nuevo
  `chained_consistency` (P0): los criterios del instrumento son los de la sesión.
- Contrato de sesión: matriz nueva "Competencias transversales" (dos filas fijas) y
  regla "exactamente dos enfoques".
- Endpoint `POST /api/v1/documents/bundle` que devuelve el ZIP de la clase.

**Frontend**
- `HomeDashboardContent.tsx`: rediseño del bloque "Crea tu clase completa" (línea de
  proceso + botón único).
- Página nueva `CreateClassPage.tsx` con el asistente de tres etapas; reutiliza
  `WorkflowTool` internamente pasando `workflowKey` y `sourceDocumentId`.
- `buildSessionDocx.ts` / `SessionDocumentPreview.tsx`: bloque IV Competencias
  transversales, colores de las filas Estándar, Producto y DUA, dos enfoques.
- Vista previa: ampliar el rango de zoom (hasta 200 %) y botón "Ajustar al ancho".
- Herramienta de sesión: ocultar "Empezar de cero o continuar una secuencia" cuando
  se entra desde "Crear mi clase"; en el resto de casos, añadir texto de ayuda.

## 3. Fases

| Fase | Entregable | Verificación |
| --- | --- | --- |
| 1. Ajustes al Word de sesión | Bloque IV, dos enfoques, colores de filas, zoom de vista previa, botón sin función | Render en LibreOffice comparado con el video; pruebas de `qaExport18` |
| 2. Portada y asistente | Bloque "Crea tu clase completa" rediseñado y página `crear-clase` que genera la sesión | Prueba de componente + navegación |
| 3. Encadenamiento | `source_document_id` en backend, instrumento y materiales derivados de la sesión, quality check de coherencia | Pytest con artefactos encadenados |
| 4. Clase completa | Registro del paquete, descarga ZIP, reapertura | Prueba de integración |
| 5. Prueba con el cliente | Despliegue de la rama y generación de 3 clases reales con Gemini | Revisión conjunta |

Orden: 1 → 2 → 3 → 4 → 5. La fase 1 se puede entregar sola para que el cliente valide
el formato mientras se construye la cadena.

## 4. Preguntas para el cliente

1. ¿El bloque VII "Evaluación de los aprendizajes" se mantiene o se sigue la
   referencia (que salta de VI a VIII)?
2. ¿Los materiales de la cadena son solo teoría + ficha + mapa, o también la
   presentación en PowerPoint?
3. ¿La descarga final es un solo Word con todo o tres archivos separados?
4. ¿Qué observación quedó pendiente cuando se cortó el audio en "cuando estoy en
   sesión..."?
5. ¿Enviará el nuevo modelo de Word que descargó, por si difiere del ya usado?

## 5. Segundo video: el formulario debe ser corto y guiado (referencia "Caicedo")

Fuente: segundo video del cliente (3 min 53 s). Compara el formulario actual de
Avendia con un generador externo (`.../generadores/ebr-secundaria.html`, al que llama
"Caicedo") y pide que el nuestro sea igual de rápido.

### 5.1 Reglas que fija el cliente

- **"Crear mi clase" es la ruta principal.** Sesión → Siguiente → Instrumento →
  Siguiente → Materiales. La herramienta "Sesión de aprendizaje" del catálogo queda
  solo para quien quiera una sesión suelta, no ligada a instrumento ni materiales.
- **Al maestro no le interesa la información técnica.** Señala como ruido: el panel
  "Control de calidad de la generación" (Contrato 2026.09, Estructura completa P0,
  Apartados propios P0, Columnas propias P0, Tema y contexto P1...), el texto
  "Contexto coherente", el stepper "Empezar de cero o continuar una secuencia" y las
  etiquetas "Necesario para crear / Puedes completarlo después / Escrito por ti".
  Nada de eso debe verse en la ruta principal.
- **Pocos campos, seleccionables, en bloques.** "Paso uno, paso dos, selecciona pam,
  pam, pam". Prefiere bloques de color numerados que guían, no una página larga con
  cajas de texto grandes ("espacio por aquí, espacio por allá").
- **La IA sugiere, el docente elige.** Sugerencia de título con un clic, sugerencia
  de competencia (o checkbox "Dejar que la IA sugiera la competencia"), máximo dos
  competencias marcadas y "la IA redacta el resto".
- **El diálogo "Sugerencia contextual"** (el que se abre en "Propósito de la unidad"
  con nivel de ayuda, preguntas y sugerencias de un solo clic) no tiene sentido para
  el docente en este flujo: "¿por qué entraría el maestro aquí?". Se elimina de la
  ruta principal; el propósito lo genera la IA.
- **Datos institucionales ya definidos.** Aparecen precargados desde el perfil y el
  docente puede cambiarlos, pero no los vuelve a escribir.
- Detalle menor: cambiar el rótulo "Curso" del paso por otro nombre; se decide después.

### 5.2 Pasos del generador de referencia (lo que hay que igualar)

| Paso | Campos que muestra | Comportamiento |
| --- | --- | --- |
| 1 Datos | Nivel, grado, área (selects), tema específico, título de la unidad, título de la sesión con botón **"Sugerir con IA"** (si se deja vacío se usa el tema) | Bloque "Con tu unidad (opcional)" plegado para pegar el propósito de una unidad ya creada |
| 2 Curso / tema | (se fusiona con el paso 1 en la referencia) | — |
| 3 Competencias | Lista de competencias del área según el CNEB, **máximo 2 marcadas**, checkbox "Dejar que la IA sugiera la competencia" | La lista cambia con el área elegida; la IA redacta capacidades, desempeños y criterios |
| 4 Enfoques | Enfoques transversales (elige 2) | Igual patrón de selección |
| 5 Evaluación | Duración ("90 min (2 h clase)"), instrumento (select: guía de observación, lista de cotejo, rúbrica...), **lista de alumnos opcional** con "Seleccionar lista guardada" o pegar nombres | La nómina alimenta la tabla del instrumento |
| Generar | Un botón | Resultado: Competencia 1 principal, Competencia 2 complementaria, teoría del tema, etc. |

Elementos visuales de la referencia: barra de progreso verde con círculos numerados
y marcas de listo, cada paso con un cuadro numerado y subtítulo de una línea, bandas
de color como título de cada bloque, botón "Atrás".

### 5.3 Comparación con el formulario actual de Avendia

| Avendia hoy | Problema señalado | Cambio |
| --- | --- | --- |
| Pasos: Datos institucionales, Fuente, Propósito, Secuencia, Evaluación, Recursos (6 pasos, ~30 campos) | Demasiados campos y cajas de texto largas (contexto real, propósito de la unidad, inicio, desarrollo, cierre, criterios, retroalimentación, materiales, bibliografía, DUA) | Ruta "Crear mi clase" con 4 pasos y unos 10 campos; todo lo demás lo redacta la IA o queda en un desplegable "Opciones avanzadas" |
| Panel "Control de calidad de la generación" visible al generar | Ruido técnico | Ocultarlo en la ruta principal; dejar solo un aviso corto si la generación está bloqueada. El detalle sigue disponible en el panel de administración |
| Stepper "Empezar de cero o continuar una secuencia" (Datos, Curso, Competencias, Enfoques) | El cliente no entiende su función | Quitarlo de la ruta principal; en la herramienta suelta, reemplazarlo por un solo enlace "Continuar desde una unidad guardada" |
| Diálogo "Sugerencia contextual" por campo | Innecesario para el docente | Sustituirlo por botones "Sugerir con IA" junto a título y competencia, que rellenan el campo sin abrir diálogos |
| Etiquetas "Necesario para crear / Puedes completarlo después / Escrito por ti" | Ruido | Quitar; los obligatorios llevan asterisco y nada más |
| Competencias en caja de texto libre | El docente no debería escribir nombres del CNEB | Lista de competencias por área y nivel (ya existe el catálogo de educación en el backend, `education_catalog`); máximo 2 + opción "que la IA sugiera" |
| Lista de estudiantes en un textarea | — | Selector de nóminas guardadas (`rosters`) + pegar nombres |

### 5.4 Ajuste al plan de fases

- La **fase 2 (Portada y asistente)** absorbe lo anterior: el asistente tendrá 4
  pasos (Datos, Competencias, Enfoques, Evaluación) con la estética de bloques de
  color, campos precargados, botones "Sugerir con IA" y sin panel de calidad.
- Se añade una **fase 2b: limpieza de la herramienta suelta** de sesión: mismos
  cuatro pasos, "Opciones avanzadas" plegado con los campos largos actuales, sin
  stepper de secuencia ni panel de calidad para el docente.
- El resto de fases (encadenamiento, paquete de clase, prueba con el cliente) no
  cambia.

### 5.5 Preguntas nuevas

6. ¿"Curso" se llama "Área y tema" o prefiere otro nombre?
7. ¿Los datos institucionales precargados se muestran en el paso 1 (editables) o
   solo en el perfil?
8. ¿La lista de alumnos se pide en la sesión o solo al generar el instrumento?

## 6. Tercer video: confirmaciones y detalles

Fuente: tercer video (1 min 48 s). No aporta pedidos nuevos; confirma con más detalle
los anteriores.

- Vuelve a mostrar el diálogo "Sugerencia contextual" (en "Propósito de la unidad" y
  "Título de la sesión") como ejemplo de lo que sobra. En el asistente nuevo no existe:
  la sugerencia de título es un botón que rellena el campo.
- Muestra los enfoques transversales de Avendia como filas anchas con casillas; en la
  referencia son chips compactos "elige 1 o 2". El asistente usa chips y fija dos.
- En la referencia, el bloque "Recursos y materiales" tiene tres columnas (Recursos,
  Materiales, ...) cada una con "Sugerir con IA". En "Crear mi clase" los recursos y
  materiales los redacta la IA dentro de la sesión (bloque VIII) y no se piden al
  docente; en la herramienta suelta siguen disponibles bajo opciones avanzadas.
- La pantalla "Generación en progreso" con pasos numerados se cubre con la superposición
  de progreso existente (`GenerationProgressOverlay`).

## 7. Cómo quedó implementado

| Pieza | Archivo |
| --- | --- |
| Lógica del asistente (valores, validación, campos para la IA, encadenado) | `frontend/src/features/classes/classWizard.ts` |
| Página del asistente y cadena de tres etapas | `frontend/src/features/classes/CreateClassPage.tsx` |
| Estilos de pasos, bloques, chips y bloque de portada | `frontend/src/styles/class-wizard.css` |
| Bloque "Crea tu clase completa" | `frontend/src/features/dashboard/HomeDashboardContent.tsx` |
| Ruta `crear-clase` y entrada de menú | `frontend/src/app/App.tsx`, `frontend/src/config/tools.ts` |
| Bloque IV y colores del Word | `frontend/src/features/tools/docx/buildSessionDocx.ts`, `sessionContent.ts`, `theme.ts` |
| Materiales como Word propio | `buildSessionDocx(artifact, values, { part: "materials" })` |
| Matriz "Competencias transversales" pedida a la IA | `backend/app/modules/ai/service.py` (`_TABLE_BLUEPRINTS`) |

Decisiones tomadas sin confirmación del cliente (fáciles de revertir):

1. El bloque VII "Evaluación de los aprendizajes" se mantiene.
2. Los materiales son teoría + ficha + mapa mental; la presentación queda fuera.
3. La descarga es un Word por etapa (tres archivos), no un solo documento.
4. La lista de alumnos se pide en el paso Evaluación de la sesión y se hereda al
   instrumento.
5. El paso se llama "Datos" (no "Curso").
