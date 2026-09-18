/**
 * "Crear mi clase": asistente corto de cuatro pasos (datos, competencias, enfoques,
 * evaluación) que genera la sesión con el formato de referencia y encadena, con un
 * solo botón "Siguiente", el instrumento de evaluación y los materiales del estudiante.
 *
 * En modo "sesion" es la herramienta suelta "Sesión de aprendizaje": mismos cuatro
 * pasos, sin cadena, con los campos largos plegados bajo "Opciones avanzadas".
 */
import { ArrowLeft, ArrowRight, Check, CirclePlay, Download, FileText, FolderArchive, LoaderCircle, Sparkles, WandSparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { CurricularReferencePicker } from "../../components/CurricularReferencePicker";
import { GenerationProgressOverlay } from "../../components/GenerationProgressOverlay";
import { ApiError, apiRequest, downloadApiBlob } from "../../lib/api";
import {
  type CurricularReference,
  type ReferenceSelection,
  referencesFromDocuments,
  resolveReference,
} from "../../lib/curricularReference";
import { readAccessToken, readSessionUser, sessionDraftScope } from "../../lib/session";
import { listRosters, listStudents } from "../rosters/rosterApi";
import type { Roster } from "../rosters/rosterTypes";
import { SessionDocumentPreview } from "../tools/SessionDocumentPreview";
import { WordDocumentPreview } from "../tools/WordDocumentPreview";
import type { WorkflowArtifact } from "../tools/exportWorkflowDocx";
import {
  ADVANCED_FIELDS,
  APPROACH_OPTIONS,
  CLASS_STAGES,
  DURATION_OPTIONS,
  INSTRUMENT_OPTIONS,
  WIZARD_STEPS,
  areaOptions,
  artifactText,
  competencyOptions,
  draftStorageKey,
  gradeOptions,
  instrumentFields,
  instrumentTarget,
  instrumentWorkflow,
  defaultValues as defaultValuesFor,
  levelOptions,
  profileFields,
  readDraft,
  sessionFields,
  sessionWorkflow,
  stepErrors,
  toggleLimited,
  valuesFromSessionFields,
  type ClassDraft,
  type ClassStage,
  type ClassWizardValues,
  type InstrumentOption,
  type WizardMode,
} from "./classWizard";
import "../../styles/class-wizard.css";

const STAGE_LABELS: Record<ClassStage, string> = { sesion: "Sesión de aprendizaje", instrumento: "Instrumento de evaluación", materiales: "Materiales" };

function authHeaders(): Record<string, string> | undefined {
  const token = readAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

async function withRetry<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 0) throw error;
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    return request();
  }
}

const SESSION_ROUTE = "/dashboard/planificamos/sesion-aprendizaje";
const TUTORIALS_ROUTE = "/dashboard/videos-tutorial";

type StoredDocument = { id: string; title: string; document_type: string; status?: string; metadata_json?: Record<string, unknown> };
type StoredRelation = { parent_document_id: string; child_document_id: string; relation_type: string };

function slug(value: string): string {
  return value.trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function CreateClassPage({ mode = "clase" }: { mode?: WizardMode } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const single = mode === "sesion";
  const user = useMemo(() => readSessionUser(), []);
  const storageKey = useMemo(() => draftStorageKey(sessionDraftScope(), mode), [mode]);
  const [draft, setDraft] = useState<ClassDraft>(() => {
    const saved = readDraft(storageKey, user);
    // Pedido escrito en la portada ("Necesito una sesión sobre…"): se usa como tema si no hay uno.
    const teacherNeed = (location.state as { teacherNeed?: string } | null)?.teacherNeed?.trim();
    if (teacherNeed && !saved.values.session_topic.trim() && !saved.session) {
      return { ...saved, values: { ...saved.values, session_topic: teacherNeed } };
    }
    return saved;
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<"" | "generating" | "suggesting" | "saving">("");
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [references, setReferences] = useState<CurricularReference[]>([]);
  const values = draft.values;
  const classToOpen = single ? "" : (searchParams.get("class") ?? "").trim();

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
  }, [draft, storageKey]);

  useEffect(() => {
    if (!readAccessToken()) return;
    const controller = new AbortController();
    void listRosters({ signal: controller.signal }).then(setRosters).catch(() => undefined);
    void apiRequest<StoredDocument[]>("/documents", { headers: authHeaders(), signal: controller.signal })
      .then((documents) => setReferences(referencesFromDocuments(documents)))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  // Reabrir una clase guardada desde el historial: ?class=<id de la sesión>.
  useEffect(() => {
    if (!classToOpen || draft.documentIds.sesion === classToOpen || !readAccessToken()) return;
    const controller = new AbortController();
    const headers = authHeaders();
    (async () => {
      try {
        const session = await apiRequest<StoredDocument>(`/documents/${classToOpen}`, { headers, signal: controller.signal });
        const metadata = session.metadata_json ?? {};
        const artifact = metadata.artifact as WorkflowArtifact | undefined;
        if (!artifact?.sections) throw new Error("La sesión guardada no tiene contenido generado.");
        const savedValues = metadata.wizard_values && typeof metadata.wizard_values === "object"
          ? { ...defaultValuesFor(user), ...(metadata.wizard_values as Partial<ClassWizardValues>) }
          : valuesFromSessionFields((metadata.fields as Record<string, unknown>) ?? {}, user);
        const relations = await apiRequest<StoredRelation[]>(`/documents/${classToOpen}/relations`, { headers, signal: controller.signal }).catch(() => [] as StoredRelation[]);
        const childIds = relations.filter((relation) => relation.parent_document_id === classToOpen).map((relation) => relation.child_document_id);
        const children = await Promise.all(childIds.map((id) => apiRequest<StoredDocument>(`/documents/${id}`, { headers, signal: controller.signal }).catch(() => null)));
        let instrument: WorkflowArtifact | null = null;
        const documentIds: ClassDraft["documentIds"] = { sesion: classToOpen };
        for (const child of children) {
          const childMeta = child?.metadata_json ?? {};
          if (!child || child.status === "archived") continue;
          if (childMeta.class_stage === "instrumento" && childMeta.artifact) { instrument = childMeta.artifact as WorkflowArtifact; documentIds.instrumento = child.id; }
          if (childMeta.class_stage === "materiales") documentIds.materiales = child.id;
        }
        const stage: ClassStage = documentIds.materiales ? "materiales" : instrument ? "instrumento" : "sesion";
        setDraft({ version: 1, step: WIZARD_STEPS.length - 1, stage, values: savedValues, session: artifact, instrument, documentIds, updatedAt: "" });
        setMessage("");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMessage(error instanceof Error ? error.message : "No se pudo reabrir la clase guardada.");
      }
    })();
    return () => controller.abort();
    // Solo al cambiar la clase pedida en la URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classToOpen]);

  const setValue = useCallback(<K extends keyof ClassWizardValues>(key: K, value: ClassWizardValues[K]) => {
    setDraft((current) => {
      const next = { ...current.values, [key]: value };
      if (key === "level") { next.grade = ""; next.curricular_area = ""; next.competencies = []; }
      if (key === "curricular_area") next.competencies = [];
      return { ...current, values: next };
    });
    setErrors([]);
  }, []);

  const goTo = (step: number) => {
    setErrors([]);
    setDraft((current) => ({ ...current, step: Math.max(0, Math.min(WIZARD_STEPS.length - 1, step)) }));
  };

  const next = () => {
    const stepProblems = stepErrors(draft.step, values);
    if (stepProblems.length) { setErrors(stepProblems); return; }
    if (draft.step < WIZARD_STEPS.length - 1) goTo(draft.step + 1);
    else void generateSession();
  };

  const suggestTitle = async () => {
    if (!values.session_topic.trim()) { setErrors(["Escribe primero el tema de la sesión."]); return; }
    setBusy("suggesting");
    try {
      const response = await withRetry(() => apiRequest<{ reply: string }>("/ai/tools/field-assist", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          tool_id: "sesion-aprendizaje",
          tool_title: "Sesión de Aprendizaje",
          module: "planificamos",
          field_id: "session_title",
          field_label: "Título de la sesión",
          question1: "¿Qué acción o pregunta motivadora debe expresar el título?",
          answer1: `Tema: ${values.session_topic}. Área: ${values.curricular_area}. Grado: ${values.grade}.`,
          question2: "¿Qué tono debe tener?",
          answer2: "Breve, motivador y comprensible para los estudiantes; una sola línea sin comillas.",
          selected_suggestions: [],
          custom_detail: "Devuelve solo el título, máximo 12 palabras.",
          current_value: values.session_title,
          form_values: sessionFields(values, user),
          pedagogical_context: { level: values.level, grade: values.grade, area: values.curricular_area, topic: values.session_topic },
          assistance_mode: "quick",
        }),
      }));
      const title = response.reply.split("\n").map((line) => line.replace(/^["“”'\s-]+|["“”'\s.]+$/g, "")).find(Boolean) ?? "";
      if (title) setValue("session_title", title);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo sugerir el título.");
    } finally {
      setBusy("");
    }
  };

  const generateArtifact = async (body: Record<string, unknown>) => withRetry(() => apiRequest<WorkflowArtifact>("/ai/tools/workflow/generate", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ request_id: crypto.randomUUID(), ...body }),
    timeoutMs: 120_000,
  }));

  const saveDocument = async (stage: ClassStage, artifact: WorkflowArtifact, documentType: string, fields: Record<string, string>, sourceRoute: string) => {
    const headers = authHeaders();
    if (!headers) return undefined;
    const existing = draft.documentIds[stage];
    const document = await apiRequest<{ id: string }>(existing ? `/documents/${existing}` : "/documents", {
      method: existing ? "PATCH" : "POST",
      headers,
      body: JSON.stringify({
        title: artifact.document_title,
        document_type: documentType,
        content: artifactText(artifact),
        metadata: {
          version: 1,
          fields,
          artifact,
          source_route: sourceRoute,
          class_flow: !single,
          class_stage: stage,
          class_session_id: stage === "sesion" ? existing ?? null : draft.documentIds.sesion ?? null,
          wizard_values: values,
        },
      }),
    });
    if (stage !== "sesion" && draft.documentIds.sesion && !existing) {
      await apiRequest("/documents/relations", {
        method: "POST",
        headers,
        body: JSON.stringify({
          parent_document_id: draft.documentIds.sesion,
          child_document_id: document.id,
          relation_type: stage === "instrumento" ? "assessment" : "resource",
          inherited_fields: ["session_title", "curricular_area", "grade", "level"],
          context: { class_flow: true },
          compatibility_status: "compatible",
          consent: true,
        }),
      }).catch(() => undefined);
    }
    return document.id;
  };

  /** Documento del que cuelga la sesión: la unidad si se eligió, si no el plan anual. */
  const referenceDocumentId = values.unit_document_id || values.plan_document_id;

  const generateSession = async () => {
    const workflow = sessionWorkflow();
    if (!workflow) return;
    setBusy("generating");
    setMessage("");
    try {
      const fields = sessionFields(values, user);
      const artifact = await generateArtifact({
        tool_id: "sesion-aprendizaje",
        module: "planificamos",
        tool_title: "Sesión de Aprendizaje",
        artifact_type: workflow.artifactType,
        fields,
        requested_sections: workflow.outputSections,
        ...(referenceDocumentId ? { source_document_id: referenceDocumentId } : {}),
      });
      const documentId = await saveDocument("sesion", artifact, workflow.key, fields, SESSION_ROUTE).catch(() => undefined);
      if (documentId && referenceDocumentId) {
        await apiRequest("/documents/relations", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            parent_document_id: referenceDocumentId,
            child_document_id: documentId,
            relation_type: "continuation",
            inherited_fields: ["unit_title", "unit_purpose", "curricular_area", "grade", "level"],
            context: { class_flow: !single, aligned_unit: Boolean(values.unit_document_id) },
            compatibility_status: "compatible",
            consent: true,
          }),
        }).catch(() => undefined);
      }
      setDraft((current) => ({ ...current, session: artifact, instrument: null, stage: "sesion", documentIds: { ...current.documentIds, sesion: documentId ?? current.documentIds.sesion } }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo generar la sesión.");
    } finally {
      setBusy("");
    }
  };

  const generateInstrument = async () => {
    if (!draft.session) return;
    const workflow = instrumentWorkflow(values.instrument);
    const target = instrumentTarget(values.instrument);
    if (!workflow) return;
    setBusy("generating");
    setMessage("");
    try {
      const fields = instrumentFields(values, draft.session, user);
      const artifact = await generateArtifact({
        tool_id: target.toolId,
        module: "evaluamos",
        tool_title: target.toolTitle,
        artifact_type: target.artifactType,
        fields,
        requested_sections: workflow.outputSections,
        // El servidor carga la sesión guardada, inyecta sus matrices y verifica la coherencia.
        ...(draft.documentIds.sesion ? { source_document_id: draft.documentIds.sesion } : {}),
      });
      const documentId = await saveDocument("instrumento", artifact, workflow.key, fields, `/dashboard/evaluamos/${target.toolId}`).catch(() => undefined);
      setDraft((current) => ({ ...current, instrument: artifact, stage: "instrumento", documentIds: { ...current.documentIds, instrumento: documentId ?? current.documentIds.instrumento } }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo generar el instrumento.");
    } finally {
      setBusy("");
    }
  };

  const goToMaterials = async () => {
    if (!draft.session) return;
    setBusy("saving");
    try {
      const fields = sessionFields(values, user);
      const documentId = await saveDocument("materiales", { ...draft.session, document_title: `Materiales: ${draft.session.document_title}` }, "planificamos/materiales-sesion", fields, "/dashboard/crear-clase").catch(() => undefined);
      setDraft((current) => ({ ...current, stage: "materiales", documentIds: { ...current.documentIds, materiales: documentId ?? current.documentIds.materiales } }));
    } finally {
      setBusy("");
    }
  };

  /** Word de una etapa, listo para descargar o para el paquete de la clase. */
  const buildStageFile = async (stage: ClassStage): Promise<{ blob: Blob; filename: string } | null> => {
    if (!draft.session) return null;
    const { buildWorkflowDocxBlob } = await import("../tools/exportWorkflowDocx");
    if (stage === "sesion") {
      const generated = await buildWorkflowDocxBlob(draft.session, { workflowKey: "planificamos/sesion-aprendizaje", values: sessionFields(values, user), toolTitle: "Sesión de Aprendizaje" });
      return { blob: generated.blob, filename: generated.fileName };
    }
    if (stage === "instrumento") {
      if (!draft.instrument) return null;
      const target = instrumentTarget(values.instrument);
      const generated = await buildWorkflowDocxBlob(draft.instrument, { workflowKey: `evaluamos/${target.toolId}`, values: instrumentFields(values, draft.session, user), toolTitle: target.toolTitle });
      return { blob: generated.blob, filename: generated.fileName };
    }
    const { Packer } = await import("docx");
    const { buildSessionDocx } = await import("../tools/docx/buildSessionDocx");
    const blob = await Packer.toBlob(buildSessionDocx(draft.session, sessionFields(values, user), { part: "materials" }));
    return { blob, filename: `materiales-${slug(values.session_topic) || "sesion"}.docx` };
  };

  const download = async (stage: ClassStage) => {
    const file = await buildStageFile(stage);
    if (file) downloadApiBlob(file);
  };

  /** Los tres Word de la clase en un solo ZIP. */
  const downloadBundle = async () => {
    setBusy("saving");
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const files = await Promise.all(CLASS_STAGES.map((stage) => buildStageFile(stage)));
      for (const file of files) if (file) zip.file(file.filename, file.blob);
      const blob = await zip.generateAsync({ type: "blob" });
      downloadApiBlob({ blob, filename: `clase-${slug(values.session_topic) || "completa"}.zip` });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo preparar el paquete de la clase.");
    } finally {
      setBusy("");
    }
  };

  /**
   * Guarda el origen elegido (plan anual o unidad) y hereda del documento
   * resuelto el título y el propósito, sin pisar lo que el docente ya escribió.
   */
  const pickReference = (selection: ReferenceSelection) => {
    const source = resolveReference(selection, references);
    setDraft((current) => ({
      ...current,
      values: {
        ...current.values,
        reference_mode: selection.mode,
        plan_document_id: selection.planId,
        unit_document_id: selection.unitId,
        unit_title: source?.kind === "unidad-aprendizaje" ? source.unitTitle : current.values.unit_title,
        advanced: source?.purpose
          ? { ...current.values.advanced, unit_purpose: source.purpose }
          : current.values.advanced,
      },
    }));
    setErrors([]);
  };

  const restart = () => {
    localStorage.removeItem(storageKey);
    setDraft(readDraft("__none__", user));
    setErrors([]);
    setMessage("");
  };

  /** Vuelve al formulario conservando lo elegido (sesión suelta). */
  const editData = () => {
    setDraft((current) => ({ ...current, session: null, instrument: null, stage: "sesion", step: WIZARD_STEPS.length - 1 }));
    setErrors([]);
    setMessage("");
  };

  const pickRoster = async (rosterId: string) => {
    setValue("roster_id", rosterId);
    if (!rosterId) return;
    try {
      const students = await listStudents(rosterId);
      setValue("student_names", students.map((student) => student.full_name).join("\n"));
    } catch {
      setMessage("No se pudo leer la nómina seleccionada.");
    }
  };

  const stageIndex = CLASS_STAGES.indexOf(draft.stage);
  const done: Record<ClassStage, boolean> = { sesion: Boolean(draft.session), instrumento: Boolean(draft.instrument), materiales: draft.stage === "materiales" };

  const chain = (
    <ol className="class-chain" aria-label="Etapas de la clase">
      {CLASS_STAGES.map((stage, index) => (
        <li key={stage} className={draft.stage === stage && draft.session ? "is-active" : done[stage] ? "is-done" : ""}>
          <span>{done[stage] ? <Check aria-hidden="true" /> : index + 1}</span>
          <strong>{STAGE_LABELS[stage]}</strong>
        </li>
      ))}
    </ol>
  );

  // ----- Resultado de la sesión suelta: vista previa, Word y vuelta al formulario
  if (draft.session && single) {
    return (
      <main className="workflow-page class-wizard">
        <div className="workflow-shell">
          <header className="class-wizard__header">
            <div><span className="home-eyebrow">Sesión de aprendizaje</span><h1>{draft.session.document_title}</h1><p>{draft.session.executive_summary}</p></div>
            <div className="class-wizard__header-actions">
              <Link className="secondary-button" to={TUTORIALS_ROUTE}><CirclePlay aria-hidden="true" /> Ver tutorial</Link>
              <button type="button" className="secondary-button" onClick={editData}><ArrowLeft aria-hidden="true" /> Editar datos</button>
              <button type="button" className="secondary-button" onClick={restart}>Nueva sesión</button>
            </div>
          </header>
          {message ? <div className="workflow-message workflow-message--error" role="alert">{message}</div> : null}
          <SessionDocumentPreview artifact={draft.session} values={sessionFields(values, user)} onDownloadWord={() => void download("sesion")} />
          <footer className="class-wizard__footer">
            <button type="button" className="secondary-button" disabled={busy !== ""} onClick={() => void generateSession()}>Volver a generar</button>
            <button type="button" className="workflow-primary" onClick={() => navigate("/dashboard/historial")}>Ver en el historial <ArrowRight aria-hidden="true" /></button>
          </footer>
          <p className="class-wizard__hint">¿Necesitas también el instrumento y los materiales de esta sesión? Usa <button type="button" className="class-link" onClick={() => navigate("/dashboard/crear-clase")}>Crear mi clase</button>.</p>
        </div>
        <GenerationProgressOverlay open={busy === "generating"} toolTitle="Sesión de Aprendizaje" family="planificamos" toolId="sesion-aprendizaje" />
      </main>
    );
  }

  // ----- Resultado: sesión → instrumento → materiales
  if (draft.session) {
    const profile = profileFields(user);
    return (
      <main className="workflow-page class-wizard">
        <div className="workflow-shell">
          <header className="class-wizard__header">
            <div><span className="home-eyebrow">Crear mi clase</span><h1>{STAGE_LABELS[draft.stage]}</h1><p>{draft.session.document_title}</p></div>
            <div className="class-wizard__header-actions">
              <Link className="secondary-button" to={TUTORIALS_ROUTE}><CirclePlay aria-hidden="true" /> Ver tutorial</Link>
              <button type="button" className="secondary-button" onClick={restart}>Nueva clase</button>
            </div>
          </header>
          {chain}
          {message ? <div className="workflow-message workflow-message--error" role="alert">{message}</div> : null}

          {draft.stage === "sesion" ? (
            <SessionDocumentPreview artifact={draft.session} values={sessionFields(values, user)} onDownloadWord={() => void download("sesion")} />
          ) : null}

          {draft.stage === "instrumento" && draft.instrument ? (
            <WordDocumentPreview
              artifact={draft.instrument}
              artifactType="instrumento"
              toolId={instrumentTarget(values.instrument).toolId}
              workflowKey={`evaluamos/${instrumentTarget(values.instrument).toolId}`}
              values={{ ...profile, ...instrumentFields(values, draft.session, user) }}
              onDownloadWord={() => void download("instrumento")}
            />
          ) : null}

          {draft.stage === "materiales" ? (
            <SessionDocumentPreview artifact={draft.session} values={sessionFields(values, user)} part="materials" onDownloadWord={() => void download("materiales")} />
          ) : null}

          <footer className="class-wizard__footer">
            {stageIndex > 0 ? <button type="button" className="secondary-button" onClick={() => setDraft((current) => ({ ...current, stage: CLASS_STAGES[stageIndex - 1] }))}><ArrowLeft aria-hidden="true" /> Anterior</button> : <span />}
            <div>
              <button type="button" className="secondary-button" onClick={() => void download(draft.stage)}><Download aria-hidden="true" /> Descargar Word</button>
              {draft.stage === "sesion" ? (
                <button type="button" className="workflow-primary" disabled={busy !== ""} onClick={() => draft.instrument ? setDraft((current) => ({ ...current, stage: "instrumento" })) : void generateInstrument()}>
                  Siguiente: instrumento <ArrowRight aria-hidden="true" />
                </button>
              ) : null}
              {draft.stage === "instrumento" ? (
                <button type="button" className="workflow-primary" disabled={busy !== ""} onClick={() => void goToMaterials()}>Siguiente: materiales <ArrowRight aria-hidden="true" /></button>
              ) : null}
              {draft.stage === "materiales" ? (
                <>
                  <button type="button" className="secondary-button" disabled={busy !== ""} onClick={() => void downloadBundle()}>{busy === "saving" ? <LoaderCircle className="is-spinning" aria-hidden="true" /> : <FolderArchive aria-hidden="true" />} Descargar clase completa (ZIP)</button>
                  <button type="button" className="workflow-primary" onClick={() => navigate("/dashboard/historial")}>Ver mi clase en el historial <ArrowRight aria-hidden="true" /></button>
                </>
              ) : null}
            </div>
          </footer>
          {draft.stage === "sesion" ? (
            <p className="class-wizard__hint">El instrumento se preparará con los criterios y la evidencia de esta sesión. Instrumento elegido: <strong>{values.instrument}</strong>.</p>
          ) : null}
        </div>
        <GenerationProgressOverlay open={busy === "generating"} toolTitle={draft.stage === "sesion" ? instrumentTarget(values.instrument).toolTitle : "Materiales"} family={draft.stage === "sesion" ? "evaluamos" : "planificamos"} toolId={draft.stage === "sesion" ? instrumentTarget(values.instrument).toolId : "materiales-sesion"} />
      </main>
    );
  }

  // ----- Formulario corto de cuatro pasos
  const step = WIZARD_STEPS[draft.step];
  const competencies = competencyOptions(values.curricular_area);

  return (
    <main className="workflow-page class-wizard">
      <div className="workflow-shell">
        <header className="class-wizard__header">
          {single
            ? <div><span className="home-eyebrow">Planificamos</span><h1>Tu sesión de aprendizaje en cuatro pasos</h1><p>Elige los datos mínimos y Avendia redacta la sesión completa con el formato oficial. Si quieres precisar algún apartado, ábrelo en "Opciones avanzadas".</p></div>
            : <div><span className="home-eyebrow">Crear mi clase</span><h1>Tu clase completa en cuatro pasos</h1><p>Elige los datos mínimos y Avendia redacta la sesión; luego preparará el instrumento y los materiales a partir de ella.</p></div>}
          <div className="class-wizard__header-actions">
            <Link className="secondary-button" to={TUTORIALS_ROUTE}><CirclePlay aria-hidden="true" /> Ver tutorial</Link>
          </div>
        </header>
        {single ? null : chain}

        <ol className="class-steps" aria-label="Pasos del formulario">
          {WIZARD_STEPS.map((item, index) => (
            <li key={item.id} className={index === draft.step ? "is-active" : index < draft.step ? "is-done" : ""}>
              <button type="button" onClick={() => index < draft.step && goTo(index)} aria-current={index === draft.step ? "step" : undefined}>
                <span>{index < draft.step ? <Check aria-hidden="true" /> : index + 1}</span><strong>{item.title}</strong>
              </button>
            </li>
          ))}
        </ol>

        <form className="workflow-card class-card" onSubmit={(event) => { event.preventDefault(); next(); }}>
          <div className="class-card__intro"><span>{draft.step + 1}</span><div><h2>{step.title}</h2><p>{step.description}</p></div><Link className="class-tutorial-link" to={TUTORIALS_ROUTE} aria-label={`Ver tutorial del paso ${step.title}`}><CirclePlay aria-hidden="true" /> Tutorial</Link></div>

          {draft.step === 0 ? (
            <div className="class-block">
              <h3 className="class-block__band">Ubicación curricular, tema y título</h3>
              <div className="class-grid">
                <label><span>Nivel educativo *</span><select value={values.level} onChange={(event) => setValue("level", event.target.value)}>{levelOptions().map((level) => <option key={level}>{level}</option>)}</select></label>
                <label><span>Grado *</span><select value={values.grade} onChange={(event) => setValue("grade", event.target.value)}><option value="">Selecciona</option>{gradeOptions(values.level).map((grade) => <option key={grade}>{grade}</option>)}</select></label>
                <label><span>Área curricular *</span><select value={values.curricular_area} onChange={(event) => setValue("curricular_area", event.target.value)}><option value="">Selecciona</option>{areaOptions(values.level).map((area) => <option key={area}>{area}</option>)}</select></label>
                <label><span>Tema específico de la sesión *</span><input value={values.session_topic} placeholder="Ej. El Fenómeno del Niño" onChange={(event) => setValue("session_topic", event.target.value)} /></label>
                <label>
                  <span>Título de la unidad</span>
                  <input value={values.unit_title} placeholder="Ej. Cuidamos nuestra naturaleza" onChange={(event) => setValue("unit_title", event.target.value)} />
                </label>
                <div className="class-grid__wide">
                  <CurricularReferencePicker
                    references={references}
                    selection={{ mode: values.reference_mode, planId: values.plan_document_id, unitId: values.unit_document_id }}
                    onChange={pickReference}
                    help="Se toma el título y el propósito del documento elegido, y la sesión queda vinculada a él en el historial."
                  />
                </div>
                <label className="class-grid__wide">
                  <span>Título de la sesión <button type="button" className="class-ai-button" disabled={busy === "suggesting"} onClick={() => void suggestTitle()}>{busy === "suggesting" ? <LoaderCircle className="is-spinning" aria-hidden="true" /> : <WandSparkles aria-hidden="true" />} Sugerir con IA</button></span>
                  <input value={values.session_title} placeholder="(Opcional) Si lo dejas vacío se usa el tema como título" onChange={(event) => setValue("session_title", event.target.value)} />
                </label>
              </div>
              <details className="class-advanced">
                <summary>Alinear con tu unidad o pegar material de referencia (opcional)</summary>
                <label><span>Contexto real de tus estudiantes</span><textarea rows={3} value={values.student_context} placeholder="Ej. Colegio urbano marginal, familias dedicadas al comercio." onChange={(event) => setValue("student_context", event.target.value)} /></label>
                <label><span>Texto, apuntes o páginas del libro del Estado</span><textarea rows={4} value={values.source_content} onChange={(event) => setValue("source_content", event.target.value)} /></label>
              </details>
            </div>
          ) : null}

          {draft.step === 1 ? (
            <div className="class-block">
              <h3 className="class-block__band">Competencias del área (CNEB): tú eliges, la IA redacta el texto</h3>
              <p className="class-block__help">Competencia(s), máximo 2. La primera será la principal y la segunda la de apoyo.</p>
              <div className="class-checks">
                <label className={values.ai_competency ? "is-selected is-ai" : "is-ai"}>
                  <input type="checkbox" checked={values.ai_competency} onChange={(event) => setValue("ai_competency", event.target.checked)} />
                  <span><Sparkles aria-hidden="true" /> Dejar que la IA sugiera la competencia</span>
                </label>
                {competencies.map((competency) => (
                  <label key={competency} className={values.competencies.includes(competency) ? "is-selected" : ""}>
                    <input type="checkbox" checked={values.competencies.includes(competency)} onChange={() => setValue("competencies", toggleLimited(values.competencies, competency, 2))} />
                    <span>{competency}</span>
                  </label>
                ))}
                {!competencies.length ? <p className="class-block__help">Elige primero el área curricular en el paso 1.</p> : null}
              </div>
            </div>
          ) : null}

          {draft.step === 2 ? (
            <div className="class-block">
              <h3 className="class-block__band">Enfoques transversales, inclusión y diversidad</h3>
              <p className="class-block__help">Enfoques transversales (elige 2). Aparecerán en el bloque V de la sesión con su valor y actitud observable.</p>
              <div className="class-chips">
                {APPROACH_OPTIONS.map((approach) => (
                  <label key={approach} className={values.transversal_approaches.includes(approach) ? "is-selected" : ""}>
                    <input type="checkbox" checked={values.transversal_approaches.includes(approach)} onChange={() => setValue("transversal_approaches", toggleLimited(values.transversal_approaches, approach, 2))} />
                    <span>{approach}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {draft.step === 3 ? (
            <div className="class-block">
              <h3 className="class-block__band">Duración, instrumento y estudiantes</h3>
              <div className="class-grid">
                <label><span>Duración total de la sesión *</span><select value={values.duration_minutes} onChange={(event) => setValue("duration_minutes", event.target.value)}>{DURATION_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label><span>Instrumento de evaluación *</span><select value={values.instrument} onChange={(event) => setValue("instrument", event.target.value as InstrumentOption)}>{INSTRUMENT_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label>
                <label><span>Periodo</span><select value={values.academic_period} onChange={(event) => setValue("academic_period", event.target.value)}><option value="">Sin indicar</option>{["Bimestre 1", "Bimestre 2", "Bimestre 3", "Bimestre 4", "Trimestre 1", "Trimestre 2", "Trimestre 3"].map((period) => <option key={period}>{period}</option>)}</select></label>
                <label><span>Lista de estudiantes (opcional)</span><select value={values.roster_id} onChange={(event) => void pickRoster(event.target.value)}><option value="">Seleccionar lista guardada</option>{rosters.map((roster) => <option key={roster.id} value={roster.id}>{roster.name || `${roster.grade} "${roster.section}"`} · {roster.institution_name}</option>)}</select></label>
                <label className="class-grid__wide"><span>O escribe los nombres, uno por línea</span><textarea rows={4} value={values.student_names} placeholder={"Juan Pérez García\nMaría López Rodríguez"} onChange={(event) => setValue("student_names", event.target.value)} /></label>
              </div>
              {single ? (
                <details className="class-advanced">
                  <summary>Opciones avanzadas: escribe tú algún apartado (opcional)</summary>
                  <p className="class-block__help">Todo lo que dejes vacío lo redacta la IA. Lo que escribas se respeta tal cual en el Word.</p>
                  {ADVANCED_FIELDS.map((field) => (
                    <label key={field.id}>
                      <span>{field.label}</span>
                      <textarea rows={3} value={values.advanced[field.id] ?? ""} placeholder={field.placeholder} onChange={(event) => setValue("advanced", { ...values.advanced, [field.id]: event.target.value })} />
                    </label>
                  ))}
                </details>
              ) : null}
            </div>
          ) : null}

          {errors.length ? <div className="workflow-message workflow-message--error" role="alert">{errors.join(" ")}</div> : null}
          {message ? <div className="workflow-message workflow-message--error" role="alert">{message}</div> : null}

          <footer className="class-wizard__footer">
            {draft.step > 0 ? <button type="button" className="secondary-button" onClick={() => goTo(draft.step - 1)}><ArrowLeft aria-hidden="true" /> Atrás</button> : <span />}
            <button type="submit" className="workflow-primary" disabled={busy === "generating"}>
              {draft.step === WIZARD_STEPS.length - 1 ? <><FileText aria-hidden="true" /> {single ? "Generar la sesión" : "Crear mi clase"}</> : <>Siguiente <ArrowRight aria-hidden="true" /></>}
            </button>
          </footer>
        </form>
      </div>
      <GenerationProgressOverlay open={busy === "generating"} toolTitle="Sesión de Aprendizaje" family="planificamos" toolId="sesion-aprendizaje" />
    </main>
  );
}
