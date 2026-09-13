/**
 * Lectura del artefacto de una Sesión de Aprendizaje en la forma que necesita el
 * formato de referencia. Localiza cada matriz y sección por su título (no por su
 * posición) y cae a los datos del formulario o a líneas de llenado cuando la IA no
 * devolvió un bloque. Lo comparten el Word y la vista previa.
 */
import { isPlaceholder, stripNumbering } from "../documentFormat";
import type { WorkflowArtifact, WorkflowArtifactTable } from "../exportWorkflowDocx";

export type SessionMoment = { name: string; minutes: string; teacher: string; student: string; evidence: string };
export type SessionCompetencyRow = { competency: string; performances: string; criteria: string };
export type SessionApproach = { approach: string; value: string; attitude: string };
export type SessionCriterion = { number: string; criterion: string; evidence: string; scale: string };
export type SessionWorksheetItem = { number: string; prompt: string; type: string; options: string[]; expected: string };
export type SessionMindBranch = { title: string; items: string[] };
export type SessionTheoryBlock = { title: string; narrative: string; points: string[] };

export type SessionContent = {
  title: string;
  sessionNumber: string;
  info: Array<[string, string]>;
  competencies: SessionCompetencyRow[];
  alignment: { purpose: string; challenge: string; evidence: string; product: string; standard: string };
  needs: string;
  instrument: string;
  approaches: SessionApproach[];
  duaContext: string;
  dua: string;
  peerWork: string;
  moments: SessionMoment[];
  feedback: string;
  sources: { references: string; resources: string; materials: string };
  extraSections: SessionTheoryBlock[];
  theory: SessionTheoryBlock[];
  criteria: SessionCriterion[];
  competencyLine: string;
  students: string[];
  worksheet: SessionWorksheetItem[];
  selfAssessment: string[];
  mindMap: { center: string; branches: SessionMindBranch[] };
  includeTheory: boolean;
  includeWorksheet: boolean;
  signers: Array<{ name: string; role: string }>;
  headerLine: string;
};

export function text(values: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const raw = values[key];
    const value = (Array.isArray(raw) ? raw.filter(Boolean).join(", ") : String(raw ?? "")).replace(/\*+/g, "").trim();
    if (value && !isPlaceholder(value)) return value;
  }
  return "";
}

export function norm(value: string): string {
  return String(value ?? "")
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]+/g, " ")
    .trim();
}

function findTable(tables: WorkflowArtifactTable[], ...prefixes: string[]): WorkflowArtifactTable | undefined {
  return tables.find((table) => prefixes.some((prefix) => norm(stripNumbering(table.title)).startsWith(prefix)));
}

function findSection(artifact: WorkflowArtifact, used: Set<number>, ...needles: string[]) {
  const index = artifact.sections.findIndex((section, position) => !used.has(position) && needles.some((needle) => norm(section.title).includes(needle)));
  if (index < 0) return null;
  used.add(index);
  return artifact.sections[index];
}

function sectionText(section: { narrative: string; key_points: string[] } | null | undefined): string {
  if (!section) return "";
  const points = section.key_points.map((point) => `• ${point}`).join("\n");
  return [section.narrative, points].filter(Boolean).join("\n");
}

function splitList(value: string, separator: RegExp = /\s*[|;]\s*/): string[] {
  return String(value ?? "").split(separator).map((item) => item.trim()).filter(Boolean);
}

function todayLabel(): string {
  try {
    return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
  } catch {
    return new Date().toLocaleDateString();
  }
}

/** Número de sesión escrito en el título ("Sesión N° 04") o en el formulario. */
function sessionNumberFrom(values: Record<string, unknown>, title: string): string {
  const fromValues = text(values, "session_number");
  if (fromValues) return fromValues.replace(/^n[°º]?\s*/i, "");
  const match = title.match(/n[°º]?\s*(\d{1,3})/i);
  return match ? match[1] : "";
}

/** Título sin el prefijo "Sesión de aprendizaje N° x:". */
function cleanTitle(title: string): string {
  return String(title ?? "")
    .replace(/^\s*sesi[oó]n\s+(de\s+aprendizaje\s+)?(n[°º]?\s*\d+\s*)?[:\-–—]?\s*/i, "")
    .replace(/^["“”']+|["“”']+$/g, "")
    .trim();
}

export function readSessionContent(artifact: WorkflowArtifact, values: Record<string, unknown> = {}): SessionContent {
  const tables = artifact.tables ?? [];
  const used = new Set<number>();
  const title = cleanTitle(artifact.document_title) || text(values, "session_title", "session_topic") || "Sesión de aprendizaje";
  const level = text(values, "level");
  const grade = text(values, "grade");
  const section = text(values, "section");
  const area = text(values, "curricular_area", "area");
  const institution = text(values, "institution");
  const teacher = text(values, "teacher_name");
  const director = text(values, "director_name");
  const duration = text(values, "duration_minutes");

  // I. Datos informativos
  const info: Array<[string, string]> = [
    ["Docente", teacher],
    ["Director(a)", director],
    ["Institución educativa", institution],
    ["Nivel", level],
    ["Grado", [grade, section ? `"${section}"` : ""].filter(Boolean).join(" ")],
    ["Área", area],
    ["Tema", text(values, "session_topic", "session_title") || title],
    ["Fecha", text(values, "session_date") || todayLabel()],
    ["Duración", duration ? `${duration} minutos` : ""],
    ["Unidad", text(values, "unit_title")],
    ["Periodo", [text(values, "academic_period"), text(values, "shift") ? `Turno ${text(values, "shift").toLocaleLowerCase("es")}` : ""].filter(Boolean).join(" · ")],
  ].map(([label, value]) => [label, value || "________________________"] as [string, string]);

  // II. Propósitos
  const purposesTable = findTable(tables, "propositos de aprendizaje", "propositos");
  const competencies: SessionCompetencyRow[] = purposesTable
    ? purposesTable.rows.map((row) => ({ competency: row[0] ?? "", performances: row[1] ?? "", criteria: row[2] ?? "" }))
    : [{ competency: text(values, "competencies"), performances: text(values, "performance"), criteria: text(values, "criteria") }];
  if (!purposesTable && text(values, "transversal_competency")) {
    competencies.push({ competency: text(values, "transversal_competency"), performances: "", criteria: "" });
  }

  // III. Alineamiento
  const alignmentTable = findTable(tables, "alineamiento");
  const alignmentRow = alignmentTable?.rows[0] ?? [];
  const standardSection = findSection(artifact, used, "estandar");
  const purposeSection = alignmentRow[0] ? null : findSection(artifact, used, "proposito");
  const alignment = {
    purpose: alignmentRow[0] || sectionText(purposeSection) || text(values, "purpose"),
    challenge: alignmentRow[1] || text(values, "unit_purpose", "student_context"),
    evidence: alignmentRow[2] || text(values, "evidence"),
    product: alignmentRow[3] || "",
    standard: alignmentRow[4] || sectionText(standardSection),
  };

  // IV. Necesidades e instrumento
  const needsSection = findSection(artifact, used, "necesidades");
  const needs = sectionText(needsSection);
  const instrument = text(values, "instrument") || "Guía de observación";

  // V. Enfoques, DUA, pares
  const approachesTable = findTable(tables, "enfoques");
  const approaches: SessionApproach[] = approachesTable
    ? approachesTable.rows.map((row) => ({ approach: row[0] ?? "", value: row[1] ?? "", attitude: row[2] ?? "" }))
    : splitList(text(values, "transversal_approaches"), /\s*,\s*/).map((approach) => ({ approach: `Enfoque ${approach}`, value: "", attitude: "" }));
  const duaSection = findSection(artifact, used, "dua", "diversidad", "inclusi");
  const peerSection = findSection(artifact, used, "pares", "colaborativo");
  const duaContext = text(values, "student_context", "dua_adjustments");
  const dua = sectionText(duaSection) || text(values, "dua_adjustments");
  const peerWork = sectionText(peerSection);

  // VI. Momentos
  const sequence = findTable(tables, "secuencia") ?? tables.find((table) => table.columns.length >= 3 && /momento/i.test(table.columns[0] ?? ""));
  const fallbackMoments: SessionMoment[] = [
    { name: "Inicio", minutes: "", teacher: text(values, "opening"), student: "", evidence: "" },
    { name: "Desarrollo", minutes: "", teacher: text(values, "development"), student: "", evidence: "" },
    { name: "Cierre", minutes: "", teacher: text(values, "closure"), student: "", evidence: "" },
  ];
  const moments: SessionMoment[] = sequence
    ? sequence.rows.map((row) => ({ name: row[0] ?? "", minutes: row[1] ?? "", teacher: row[2] ?? "", student: row[3] ?? "", evidence: row[4] ?? "" }))
    : fallbackMoments;

  // VII. Evaluación
  const feedbackSection = findSection(artifact, used, "retroalimentacion", "evaluacion");
  const feedback = sectionText(feedbackSection) || text(values, "feedback");

  // VIII. Fuentes
  const sources = {
    references: text(values, "bibliography", "state_book"),
    resources: text(values, "digital_resources"),
    materials: text(values, "materials"),
  };

  // Anexos
  const theory: SessionTheoryBlock[] = [];
  artifact.sections.forEach((item, index) => {
    if (used.has(index)) return;
    if (/teor|ideas fuerza|concept|caracter|procedim|ejemplo/i.test(norm(item.title))) {
      used.add(index);
      const title = stripNumbering(item.title).replace(/^teor[ií]a del tema\s*[:\-–—]\s*/i, "");
      theory.push({ title: title.charAt(0).toLocaleUpperCase("es") + title.slice(1), narrative: item.narrative, points: item.key_points });
    }
  });
  const extraSections: SessionTheoryBlock[] = artifact.sections
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => !used.has(index))
    .map(({ item }) => ({ title: stripNumbering(item.title), narrative: item.narrative, points: item.key_points }));

  const instrumentTable = findTable(tables, "instrumento");
  const criteria: SessionCriterion[] = instrumentTable
    ? instrumentTable.rows.map((row, index) => ({ number: row[0] || String(index + 1), criterion: row[1] ?? "", evidence: row[2] ?? "", scale: row[3] ?? "" }))
    : splitList(competencies[0]?.criteria ?? text(values, "criteria"), /\s*\n\s*|\s*•\s*|\s*✓\s*/).map((criterion, index) => ({ number: String(index + 1), criterion: criterion.replace(/^[-•✓]\s*/, ""), evidence: "", scale: "" }));
  const competencyLine = competencies.map((row) => row.competency.split(/\n|•|✓/)[0]?.trim()).filter(Boolean).join(" / ");
  const students = splitList(text(values, "student_names"), /\s*\n\s*|\s*;\s*/);

  const worksheetTable = findTable(tables, "ficha");
  const worksheet: SessionWorksheetItem[] = (worksheetTable?.rows ?? []).map((row, index) => {
    const type = (row[2] ?? "").trim();
    const isChoice = /opci/i.test(type);
    return {
      number: row[0] || String(index + 1),
      prompt: row[1] ?? "",
      type,
      options: isChoice ? splitList(row[3] ?? "", /\s*\|\s*|\s*;\s*/) : [],
      expected: isChoice ? "" : row[3] ?? "",
    };
  });
  const selfAssessment = criteria.slice(0, 5).map((item) => firstPersonize(item.criterion)).filter(Boolean);
  if (!selfAssessment.length) selfAssessment.push("Expliqué el tema con mis propias palabras.", "Usé la información de la teoría para responder.", "Participé en el trabajo con mis compañeros.");

  const mindTable = findTable(tables, "mapa");
  const mindMap = {
    center: text(values, "session_topic") || title,
    branches: (mindTable?.rows ?? []).map((row) => ({ title: row[0] ?? "", items: splitList(row[1] ?? "", /\s*;\s*|\s*\|\s*/) })),
  };

  const includeTheory = text(values, "include_theory") !== "No" && theory.length > 0;
  const includeWorksheet = text(values, "include_worksheet") !== "No" && worksheet.length > 0;
  const signers = [
    { name: teacher, role: "Docente del área" },
    { name: director, role: "Director/Coordinador" },
  ];
  const headerLine = [institution, area, grade].filter(Boolean).join(" · ");

  return {
    title,
    sessionNumber: sessionNumberFrom(values, artifact.document_title),
    info,
    competencies,
    alignment,
    needs,
    instrument,
    approaches,
    duaContext,
    dua,
    peerWork,
    moments,
    feedback,
    sources,
    extraSections,
    theory,
    criteria,
    competencyLine,
    students,
    worksheet,
    selfAssessment,
    mindMap,
    includeTheory,
    includeWorksheet,
    signers,
    headerLine,
  };
}

/** "Reconoce el impacto..." → "Reconocí el impacto..." para la autoevaluación del estudiante. */
function firstPersonize(criterion: string): string {
  const clean = criterion.replace(/^[-•✓\d.)\s]+/, "").trim();
  if (!clean) return "";
  const [verb, ...rest] = clean.split(/\s+/);
  const lower = verb.toLocaleLowerCase("es");
  let past = verb;
  if (/[^aeiou]e$/.test(lower) || /ce$/.test(lower)) past = `${lower.slice(0, -1)}í`;
  else if (/a$/.test(lower)) past = `${lower.slice(0, -1)}é`;
  else if (/ye$/.test(lower)) past = `${lower.slice(0, -2)}í`;
  const first = past.charAt(0).toLocaleUpperCase("es") + past.slice(1);
  return [first, ...rest].join(" ");
}
