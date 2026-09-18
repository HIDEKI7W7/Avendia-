# Motor de herramientas: arquitectura por capas

`WorkflowTool` es el motor del que salen las 57 herramientas. Concentraba en un
solo archivo el estado del borrador, la persistencia en el navegador, las
llamadas HTTP, las reglas de validación y el render. Eso hacía imposible probar
una regla sin montar el componente entero, y ahí se concentraron cuatro de los
siete defectos que encontró la revisión de depuración.

Estas carpetas separan esas responsabilidades. El comportamiento es el mismo: el
refactor se hizo con las pruebas existentes como red, sin modificarlas.

## Capas

```
workflow/
  domain/      Reglas del negocio. Sin React, sin fetch, sin localStorage.
  ports/       Lo que el caso de uso necesita del exterior, como interfaces.
  adapters/    Implementación de esos puertos contra la API y el navegador.
```

La dependencia va siempre hacia dentro: los adaptadores conocen los puertos, los
puertos conocen el dominio, y el dominio no conoce a nadie. Por eso una regla se
puede probar con una llamada a función, sin `render()` ni servidor simulado.

### `domain/`

| Archivo | Responsabilidad |
| --- | --- |
| `fieldValue.ts` | Valor de un campo y su forma como texto. |
| `validation.ts` | Cuándo un campo impide continuar y qué decirle al docente. |
| `draft.ts` | El borrador: qué lleva escrito, qué se generó y de dónde vino cada dato. |
| `curricularOrigin.ts` | De qué plan o unidad procede el documento, qué hereda y qué ocurre al cambiarlo. |

`curricularOrigin.ts` es el que más rentabilidad da: las cuatro reglas que ahí
viven (heredar la modalidad junto al nivel, soltar lo heredado al cambiar de
origen, ignorar un origen borrado y resolver el documento del que se cuelga)
eran antes condiciones sueltas dentro de un manejador de eventos.

### `ports/`

`draftStorage.ts` declara leer y escribir el borrador. `workflowGateway.ts` y
`assistanceGateway.ts` declaran lo que se necesita del servidor: guardar el
documento, vincularlo con su origen, generar el artefacto, listar planes y
unidades, y la asistencia con IA.

Son dos gateways y no uno porque son capacidades distintas: una redacta el
documento y la otra ayuda a rellenar el formulario. Un consumidor puede
necesitar una sin la otra.

### `adapters/`

`localDraftStorage.ts` guarda en `localStorage`, con la tolerancia a borradores
ilegibles que ya tenía. `httpWorkflowGateway.ts` y `httpAssistanceGateway.ts`
son el único punto del motor que conoce rutas y cabeceras.

## Qué ganó el componente

| | Antes | Ahora |
| --- | --- | --- |
| Líneas | 1451 | 1304 |
| `apiRequest` | 13 | 0 |
| `localStorage` | 5 | 0 |
| Endpoints que conoce | 8 | 0 |

El componente ya no sabe que existe un servidor: pide los puertos por parámetro
y orquesta. Sigue siendo grande porque conserva el render de las 57
herramientas, que es el siguiente candidato a separar.

## Cómo seguir

1. Extraer los `render*` a componentes de presentación en `ui/`.
2. Mover la orquestación (generar, guardar, descargar) a `application/`, de modo
   que el componente quede solo con el estado de la pantalla.
3. Repetir el corte en `CreateClassPage`, que comparte el dominio curricular.
