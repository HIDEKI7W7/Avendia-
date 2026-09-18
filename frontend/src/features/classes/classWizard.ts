/**
 * Lógica del asistente "Crear mi clase": estado del formulario corto, armado de los
 * campos que recibe la IA para la sesión y el instrumento, y lectura de la sesión
 * generada para encadenar las etapas siguientes. Sin dependencias de React.
 */
import { areasByLevel, competenciesByArea, gradesByLevel } from "../../config/education";
import { tools } from "../../config/tools";
import { getWorkflow, workflowModalities, type WorkflowDefinition } from "../../config/workflows";
import type { ReferenceMode } from "../../lib/curricularReference";
import type { SessionUser } from "../../lib/session";
import { readSessionContent } from "../tools/docx/sessionContent";
import type { WorkflowArtifact } from "../tools/exportWorkflowDocx";

export const CLASS_STAGES = ["sesion", "instrumento", "materiales"] as const;
export type ClassStage = (typeof CLASS_STAGES)[number];

export const WIZARD_STEPS = [
  { id: "datos", title: "Datos", description: "Nivel, grado, área y tema de la clase." },
  { id: "competencias", title: "Competencias", description: "Marca hasta dos competencias; la IA redacta el resto." },
  { id: "enfoques", title: "Enfoques", description: "Elige dos enfoques transversales." },
  { id: "evaluacion", title: "Evaluación", description: "Duración, instrumento y lista de estudiantes." },
] as const;

export const APPROACH_OPTIONS = ["Derechos", "Inclusivo", "Intercultural", "Igualdad de género", "Ambiental", "Bien común", "Excelencia"];
export const DURATION_OPTIONS: Array<[string, string]> = [["45", "45 min (1 hora pedagógica)"], ["90", "90 min (2 horas pedagógicas)"], ["135", "135 min (3 horas pedagógicas)"], ["180", "180 min (4 horas pedagógicas)"]];
export const INSTRUMENT_OPTIONS = ["Guía de observación", "Lista de cotejo", "Rúbrica", "Escala de estimación"] as const;
export type InstrumentOption = (typeof INSTRUMENT_OPTIONS)[number];

/** Modo del asistente: la clase completa encadenada o solo una sesión suelta. */
export type WizardMode = "clase" | "sesion";

/**
 * Campos largos de la herramienta suelta de sesión. En "Crear mi clase" no se piden:
 * la IA los redacta. En la sesión suelta quedan plegados bajo "Opciones avanzadas" y
 * solo se envían cuando el docente escribe algo.
 */
export const ADVANCED_FIELDS: Array<{ id: string; label: string; placeholder?: string }> = [
  { id: "unit_purpose", label: "Propósito de la unidad" },
  { id: "purpose", label: "Propósito de aprendizaje de la sesión" },
  { id: "performance", label: "Desempeño precisado" },
  { id: "evidence", label: "Evidencia esperada" },
  { id: "transversal_competency", label: "Competencia transversal" },
  { id: "opening", label: "Inicio: motivación, saberes previos y conflicto cognitivo" },
  { id: "development", label: "Desarrollo: mediación y actividades" },
  { id: "closure", label: "Cierre: metacognición y compromiso" },
  { id: "criteria", label: "Criterios de evaluación", placeholder: "Uno por línea" },
  { id: "feedback", label: "Estrategia de retroalimentación" },
  { id: "materials", label: "Materiales concretos" },
  { id: "digital_resources", label: "Recursos digitales" },
  { id: "bibliography", label: "Bibliografía y referencias" },
  { id: "dua_adjustments", label: "Ajustes DUA y barreras del grupo" },
];

export type ClassWizardValues = {
  level: string;
  grade: string;
  curricular_area: string;
  session_topic: string;
  unit_title: string;
  session_title: string;
  competencies: string[];
  ai_competency: boolean;
  transversal_approaches: string[];
  duration_minutes: string;
  instrument: InstrumentOption;
  roster_id: string;
  student_names: string;
  student_context: string;
  source_content: string;
  academic_period: string;
  /** Origen de la secuencia curricular: nada, el plan anual o una unidad. */
  reference_mode: ReferenceMode;
  /** Plan anual elegido, o el que acota la lista de unidades en cascada. */
  plan_document_id: string;
  /** Unidad guardada con la que se alinea la sesión (id del documento) y su título. */
  unit_document_id: string;
  /** Campos de "Opciones avanzadas" (solo sesión suelta), por id de campo. */
  advanced: Record<string, string>;
};

export type ClassDraft = {
  version: 1;
  step: number;
  stage: ClassStage;
  values: ClassWizardValues;
  session: WorkflowArtifact | null;
  instrument: WorkflowArtifact | null;
  documentIds: Partial<Record<ClassStage, string>>;
  updatedAt: string;
};

export const draftStorageKey = (scope: string, mode: WizardMode = "clase") => mode === "clase"
  ? `avendia.draft.crear-clase.v1.${scope}`
  : `avendia.draft.sesion-suelta.v1.${scope}`;

export function defaultValues(user: Partial<SessionUser> = {}): ClassWizardValues {
  const level = user.education_level && gradesByLevel[user.education_level] ? user.education_level : "Primaria";
  return {
    level,
    grade: user.grade && gradesByLevel[level]?.includes(user.grade) ? user.grade : "",
    curricular_area: user.curricular_area && areasByLevel[level]?.includes(user.curricular_area) ? user.curricular_area : "",
    session_topic: "",
    unit_title: "",
    session_title: "",
    competencies: [],
    ai_competency: false,
    transversal_approaches: [],
    duration_minutes: "90",
    instrument: "Guía de observación",
    roster_id: "",
    student_names: "",
    student_context: "",
    source_content: "",
    academic_period: "",
    reference_mode: "",
    plan_document_id: "",
    unit_document_id: "",
    advanced: {},
  };
}

export function emptyDraft(user: Partial<SessionUser> = {}): ClassDraft {
  return { version: 1, step: 0, stage: "sesion", values: defaultValues(user), session: null, instrument: null, documentIds: {}, updatedAt: "" };
}

export function readDraft(storageKey: string, user: Partial<SessionUser> = {}): ClassDraft {
  const fallback = emptyDraft(user);
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const saved = JSON.parse(raw) as Partial<ClassDraft>;
    if (saved.version !== 1 || !saved.values) return fallback;
    return { ...fallback, ...saved, values: { ...fallback.values, ...saved.values, advanced: { ...(saved.values.advanced ?? {}) } }, documentIds: saved.documentIds ?? {} };
  } catch {
    return fallback;
  }
}

function stringField(record: Record<string, unknown> | undefined, key: string): string {
  const value = record?.[key];
  return typeof value === "string" ? value : Array.isArray(value) ? value.join(", ") : "";
}

/** Valores del asistente a partir de los campos guardados de una sesión (para reabrir una clase). */
export function valuesFromSessionFields(fields: Record<string, unknown>, user: Partial<SessionUser> = {}): ClassWizardValues {
  const base = defaultValues(user);
  const text = (key: string) => stringField(fields, key);
  const competencies = text("competencies").split("\n").map((line) => line.replace(/^Competencia (principal|de apoyo):\s*/i, "").trim()).filter((line) => line && !/^Selecciona la competencia/i.test(line));
  const instrument = INSTRUMENT_OPTIONS.find((option) => option === text("instrument")) ?? base.instrument;
  const advanced = Object.fromEntries(ADVANCED_FIELDS.map((field) => [field.id, text(field.id)]).filter(([, value]) => value));
  return {
    ...base,
    level: text("level") || base.level,
    grade: text("grade") || base.grade,
    curricular_area: text("curricular_area") || base.curricular_area,
    session_topic: text("session_topic"),
    unit_title: text("unit_title"),
    session_title: text("session_title"),
    competencies,
    ai_competency: !competencies.length,
    transversal_approaches: text("transversal_approaches").split(",").map((item) => item.trim()).filter(Boolean),
    duration_minutes: text("duration_minutes") || base.duration_minutes,
    instrument,
    student_names: text("student_names"),
    student_context: text("student_context"),
    source_content: text("source_content"),
    academic_period: text("academic_period"),
    reference_mode: text("unit_document_id") ? "unidad" : text("plan_document_id") ? "plan" : "",
    plan_document_id: text("plan_document_id"),
    unit_document_id: text("unit_document_id"),
    advanced,
  };
}

export function levelOptions(): string[] {
  return Object.keys(gradesByLevel).filter((level) => ["Inicial", "Primaria", "Secundaria"].includes(level));
}

export function gradeOptions(level: string): string[] {
  return gradesByLevel[level] ?? [];
}

export function areaOptions(level: string): string[] {
  return areasByLevel[level] ?? [];
}

export function competencyOptions(area: string): string[] {
  return competenciesByArea[area] ?? [];
}

/** Errores del paso actual; vacío cuando se puede avanzar. */
export function stepErrors(step: number, values: ClassWizardValues): string[] {
  const errors: string[] = [];
  if (step === 0) {
    if (!values.level) errors.push("Elige el nivel.");
    if (!values.grade) errors.push("Elige el grado.");
    if (!values.curricular_area) errors.push("Elige el área curricular.");
    if (!values.session_topic.trim()) errors.push("Escribe el tema de la sesión.");
  }
  if (step === 1 && !values.ai_competency && !values.competencies.length) errors.push("Marca al menos una competencia o deja que la IA la sugiera.");
  if (step === 2 && values.transversal_approaches.length !== 2) errors.push("Elige exactamente dos enfoques transversales.");
  if (step === 3 && !values.duration_minutes) errors.push("Indica la duración.");
  return errors;
}

export function toggleLimited(list: string[], item: string, limit: number): string[] {
  if (list.includes(item)) return list.filter((entry) => entry !== item);
  if (list.length >= limit) return [...list.slice(1), item];
  return [...list, item];
}

function toolFor(module: string, toolId: string) {
  return tools.find((item) => item.module === module && item.id === toolId);
}

export function sessionWorkflow(): WorkflowDefinition | undefined {
  return getWorkflow(toolFor("planificamos", "sesion-aprendizaje"));
}

/** Datos institucionales del perfil, con la misma correspondencia que las herramientas. */
export function profileFields(user: Partial<SessionUser> = {}): Record<string, string> {
  const modality = String(user.education_modality ?? "EBR");
  return {
    dre: String(user.dre ?? ""),
    ugel: String(user.ugel ?? ""),
    institution: String(user.school_name ?? ""),
    teacher_name: String(user.full_name ?? ""),
    director_name: String(user.director_name ?? ""),
    section: String(user.section ?? ""),
    school_year: String(user.school_year ?? new Date().getFullYear()),
    modality: workflowModalities.find((item) => item.startsWith(modality)) ?? workflowModalities[0],
  };
}

/** Solo los campos avanzados con texto, ya recortados. */
export function advancedFields(values: ClassWizardValues): Record<string, string> {
  return Object.fromEntries(
    ADVANCED_FIELDS
      .map((field) => [field.id, String(values.advanced?.[field.id] ?? "").trim()] as const)
      .filter(([, value]) => value),
  );
}

/** Campos que recibe la IA para la sesión: el docente solo eligió; la IA redacta lo demás. */
export function sessionFields(values: ClassWizardValues, user: Partial<SessionUser> = {}): Record<string, string> {
  const competencies = values.ai_competency && !values.competencies.length
    ? "Selecciona la competencia del CNEB más pertinente al tema y al área; añade una competencia de apoyo."
    : values.competencies.map((item, index) => `${index === 0 ? "Competencia principal" : "Competencia de apoyo"}: ${item}`).join("\n");
  const advanced = advancedFields(values);
  const advancedRule = Object.keys(advanced).length
    ? " El docente escribió algunos apartados en opciones avanzadas: respétalos tal cual y completa el resto."
    : "";
  return {
    ...profileFields(user),
    level: values.level,
    grade: values.grade,
    curricular_area: values.curricular_area,
    source_mode: values.source_content.trim() ? "Apuntes o texto base" : "Tema libre",
    session_topic: values.session_topic.trim(),
    session_title: values.session_title.trim(),
    unit_title: values.unit_title.trim(),
    academic_period: values.academic_period,
    student_context: values.student_context.trim(),
    source_content: values.source_content.trim(),
    competencies,
    transversal_approaches: values.transversal_approaches.join(", "),
    duration_minutes: values.duration_minutes,
    instrument: values.instrument,
    student_names: values.student_names.trim(),
    include_theory: "Sí",
    include_worksheet: "Sí",
    include_nee: "Sí",
    ...(values.plan_document_id ? { plan_document_id: values.plan_document_id } : {}),
    ...(values.unit_document_id ? { unit_document_id: values.unit_document_id } : {}),
    ...advanced,
    planning_mode: `Crear mi clase: el docente seleccionó los datos mínimos; desarrolla capacidades, desempeños, criterios, propósito, secuencia, recursos y retroalimentación completos y contextualizados.${advancedRule}`,
  };
}

export type InstrumentTarget = { toolId: "lista-cotejo" | "rubrica-evaluacion" | "escala-estimacion"; toolTitle: string; artifactType: "instrumento" };

export function instrumentTarget(instrument: InstrumentOption): InstrumentTarget {
  if (instrument === "Rúbrica") return { toolId: "rubrica-evaluacion", toolTitle: "Rúbrica de evaluación", artifactType: "instrumento" };
  if (instrument === "Escala de estimación") return { toolId: "escala-estimacion", toolTitle: "Escala de estimación", artifactType: "instrumento" };
  return { toolId: "lista-cotejo", toolTitle: instrument === "Guía de observación" ? "Guía de observación" : "Lista de cotejo", artifactType: "instrumento" };
}

export function instrumentWorkflow(instrument: InstrumentOption): WorkflowDefinition | undefined {
  return getWorkflow(toolFor("evaluamos", instrumentTarget(instrument).toolId));
}

/** Lo que la sesión generada aporta al instrumento: criterios, evidencia, competencia y nómina. */
export function sessionSummaryForChain(session: WorkflowArtifact, values: ClassWizardValues) {
  const content = readSessionContent(session, sessionFields(values));
  return {
    title: content.title,
    competency: content.competencyLine,
    criteria: content.criteria.map((item) => item.criterion).filter(Boolean),
    evidence: content.alignment.evidence,
    product: content.alignment.product,
    students: content.students,
  };
}

/** Campos del instrumento derivados de la sesión: usa exactamente sus criterios y evidencia. */
export function instrumentFields(values: ClassWizardValues, session: WorkflowArtifact, user: Partial<SessionUser> = {}): Record<string, string> {
  const summary = sessionSummaryForChain(session, values);
  const criteria = summary.criteria.length ? summary.criteria : ["Criterio por definir"];
  const target = instrumentTarget(values.instrument);
  const base = {
    ...profileFields(user),
    level: values.level,
    grade: values.grade,
    curricular_area: values.curricular_area,
    session_title: summary.title,
    source_session: `Sesión de aprendizaje "${summary.title}" · tema: ${values.session_topic}`,
    chained_rule: "Usa exactamente los criterios y la evidencia de la sesión de origen; no inventes otros.",
  };
  if (target.toolId === "rubrica-evaluacion") {
    return {
      ...base,
      competency: summary.competency,
      performance: criteria.join("\n"),
      product: summary.product || summary.evidence,
      criteria_count: String(Math.min(8, Math.max(2, criteria.length))),
      scale: "CNEB: AD/A/B/C",
      criteria_notes: criteria.join("\n"),
      pedagogical_context: values.student_context,
      rubric_type: "Analítica",
    };
  }
  if (target.toolId === "escala-estimacion") {
    return {
      ...base,
      activity: summary.product || summary.evidence,
      criteria_count: String(Math.min(10, Math.max(2, criteria.length))),
      scale_type: "Logrado / En proceso / Inicio",
      criteria_notes: criteria.join("\n"),
    };
  }
  return {
    ...base,
    activity: summary.product || summary.evidence,
    list_title: `${values.instrument}: ${summary.title}`,
    competency: [summary.competency, ...criteria].filter(Boolean).join("\n"),
    criteria_count: String(Math.min(15, Math.max(3, criteria.length))),
    additional_criteria: criteria.join("\n"),
    student_names: values.student_names.trim() || summary.students.join("\n"),
    response_scale: values.instrument === "Guía de observación" ? "Logrado / En proceso" : "Sí / No / Observaciones",
  };
}

/** Texto plano del artefacto para el campo `content` del documento guardado. */
export function artifactText(artifact: WorkflowArtifact): string {
  return [
    artifact.document_title,
    artifact.executive_summary,
    ...artifact.sections.flatMap((section) => [section.title, section.narrative, ...section.key_points]),
    ...(artifact.tables ?? []).flatMap((table) => [table.title, ...table.columns, ...table.rows.flat()]),
  ].filter(Boolean).join("\n\n");
}
