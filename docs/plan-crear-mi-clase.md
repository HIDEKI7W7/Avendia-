# Plan: flujo "Crear mi clase" y ajustes al formato de sesión

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
