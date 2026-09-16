import { Check, LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STAGES_BY_FAMILY: Record<string, string[]> = {
  planificamos: [
    "Organizando el propósito y el contexto",
    "Relacionando competencias, actividades y evidencias",
    "Revisando la coherencia curricular del documento",
  ],
  evaluamos: [
    "Construyendo criterios e indicadores observables",
    "Ajustando el nivel cognitivo y la evidencia",
    "Preparando la clave y la retroalimentación docente",
  ],
  incluimos: [
    "Identificando barreras y fortalezas",
    "Proponiendo apoyos y alternativas DUA",
    "Organizando responsables, evidencias y seguimiento",
  ],
  reforzamos: [
    "Priorizando las necesidades de aprendizaje",
    "Diseñando una ruta breve y realizable",
    "Comprobando evidencias y próximos pasos",
  ],
  acompañamos: [
    "Cuidando el tono y los datos verificables",
    "Organizando acuerdos y responsabilidades",
    "Preparando el seguimiento y la comunicación final",
  ],
  tutoria: [
    "Cuidando el enfoque socioemocional",
    "Organizando acciones, acuerdos y protección",
    "Revisando el seguimiento y el lenguaje respetuoso",
  ],
  recursos: [
    "Creando consignas claras y apropiadas para el grado",
    "Diseñando la actividad y su interacción",
    "Preparando la comprobación y la guía docente",
  ],
  presentacion: [
    "Estructurando la secuencia de diapositivas",
    "Distribuyendo contenido, ejemplos e interacción",
    "Preparando el guion docente y la dirección visual",
  ],
};

/** Etapas con palabras del docente para las herramientas de la ruta principal. */
const STAGES_BY_TOOL: Record<string, string[]> = {
  "sesion-aprendizaje": [
    "Plantilla Word oficial y datos informativos",
    "Competencias, capacidades y criterios del CNEB",
    "Propósito, evidencia y situación significativa",
    "Inicio, desarrollo y cierre con sus tiempos",
    "Teoría del tema, ficha de trabajo y mapa mental",
    "Instrumento de evaluación y revisión final",
  ],
  "unidad-aprendizaje": [
    "Datos informativos y situación significativa",
    "Competencias, desempeños y propósitos",
    "Producto, evidencias y criterios",
    "Secuencia de sesiones y recursos",
    "Ajustes DUA y revisión final",
  ],
  "lista-cotejo": [
    "Leyendo los criterios de la sesión de origen",
    "Redactando indicadores observables",
    "Armando la tabla con la lista de estudiantes",
    "Revisando la coherencia con la sesión",
  ],
  "rubrica-evaluacion": [
    "Leyendo los criterios de la sesión de origen",
    "Describiendo los niveles de logro por criterio",
    "Preparando recomendaciones para avanzar",
    "Revisando la coherencia con la sesión",
  ],
  "escala-estimacion": [
    "Leyendo los criterios de la sesión de origen",
    "Redactando indicadores y niveles de valoración",
    "Revisando la coherencia con la sesión",
  ],
  "materiales-sesion": [
    "Reuniendo la teoría del tema",
    "Preparando la ficha de trabajo",
    "Dibujando el mapa mental",
  ],
};

type Props = {
  open: boolean;
  toolTitle: string;
  family: string;
  stages?: string[];
  /** Identificador de la herramienta; si tiene etapas propias se usan en lugar de las de la familia. */
  toolId?: string;
};

export function GenerationProgressOverlay({ open, toolTitle, family, stages, toolId }: Props) {
  const items = useMemo(
    () => stages?.length ? stages : (toolId && STAGES_BY_TOOL[toolId]) || STAGES_BY_FAMILY[family.toLowerCase()] || STAGES_BY_FAMILY.recursos,
    [family, stages, toolId],
  );
  if (!open) return null;
  return <GenerationProgressContent toolTitle={toolTitle} items={items} />;
}

function GenerationProgressContent({ toolTitle, items }: { toolTitle: string; items: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => Math.min(current + 1, items.length - 1));
    }, 1800);
    return () => window.clearInterval(timer);
  }, [items.length]);

  return (
    <div className="generation-progress-layer" role="status" aria-live="polite" aria-label={`Generando ${toolTitle}`}>
      <div className="generation-progress-card">
        <span className="generation-progress-card__mark"><Sparkles aria-hidden="true" /></span>
        <small>Avendia está preparando tu resultado</small>
        <h2>{toolTitle}</h2>
        <p>Puedes conservar tus datos: el resultado se guardará como contenido editable.</p>
        <ol>
          {items.map((item, index) => (
            <li className={index < active ? "is-complete" : index === active ? "is-active" : ""} key={item}>
              <span>{index < active ? <Check aria-hidden="true" /> : index === active ? <LoaderCircle className="is-spinning" aria-hidden="true" /> : index + 1}</span>
              <strong>{item}</strong>
            </li>
          ))}
        </ol>
        <div className="generation-progress-card__bar"><i style={{ width: `${((active + 1) / items.length) * 100}%` }} /></div>
        <em>No cierres esta ventana mientras termina la revisión.</em>
      </div>
    </div>
  );
}
