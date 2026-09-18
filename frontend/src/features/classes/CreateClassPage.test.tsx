import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { sessionArtifactSample } from "../tools/qaExport18SesionAprendizaje.test";
import { CreateClassPage } from "./CreateClassPage";

const mocks = vi.hoisted(() => ({ apiRequest: vi.fn(), downloadApiBlob: vi.fn() }));

vi.mock("../../lib/api", async () => {
  const actual = await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
  return { ...actual, apiRequest: (...args: unknown[]) => mocks.apiRequest(...args), downloadApiBlob: (...args: unknown[]) => mocks.downloadApiBlob(...args) };
});

vi.mock("../rosters/rosterApi", () => ({
  listRosters: vi.fn().mockResolvedValue([{ id: "roster-1", name: "2do B", grade: "2° de Primaria", section: "B", institution_name: "I.E. 123" }]),
  listStudents: vi.fn().mockResolvedValue([{ id: "s1", full_name: "Ana Torres" }, { id: "s2", full_name: "Bruno Cárdenas" }]),
}));

const instrumentArtifact = {
  document_title: "Guía de observación: Fenómeno El Niño",
  executive_summary: "Instrumento derivado de la sesión con sus tres criterios observables.",
  sections: [{ title: "Datos del instrumento", narrative: "Guía para observar el diálogo y el organizador visual.", key_points: ["Aplicar durante el desarrollo."] }],
  teacher_recommendations: ["Registrar durante la clase.", "Devolver observaciones al cierre."],
  tables: [
    { title: "Matriz de registro", columns: ["N°", "Estudiante", "C1", "C2", "C3", "Observaciones"], rows: [["1", "Ana Torres", "Sí", "Sí", "No", ""], ["2", "Bruno Cárdenas", "Sí", "No", "Sí", ""]], note: "" },
    { title: "Leyenda de criterios", columns: ["Código", "Criterio observable", "Evidencia"], rows: [["C1", "Reconoce el impacto del fenómeno en su vida cotidiana.", "Diálogo"], ["C2", "Identifica cambios en su comunidad.", "Organizador"], ["C3", "Menciona cómo altera actividades familiares.", "Ficha"]], note: "" },
  ],
  model: "gemini-test",
};

function fillStepOne() {
  fireEvent.change(screen.getByLabelText(/Nivel educativo/), { target: { value: "Primaria" } });
  fireEvent.change(screen.getByLabelText(/^Grado/), { target: { value: "2° de Primaria" } });
  fireEvent.change(screen.getByLabelText(/Área curricular/), { target: { value: "Personal Social" } });
  fireEvent.change(screen.getByLabelText(/Tema específico/), { target: { value: "El Fenómeno del Niño" } });
}

describe("CreateClassPage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("avendia.accessToken", "token-de-prueba");
    mocks.apiRequest.mockReset();
    mocks.downloadApiBlob.mockReset();
  });
  afterEach(cleanup);

  it("guía en cuatro pasos y genera la sesión con los datos elegidos", async () => {
    mocks.apiRequest.mockImplementation(async (path: string) => {
      if (path === "/ai/tools/workflow/generate") return sessionArtifactSample();
      if (path === "/documents") return { id: "doc-sesion" };
      return {};
    });
    render(<MemoryRouter initialEntries={["/dashboard/crear-clase"]}><CreateClassPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: /cuatro pasos/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Elige el grado/);

    fillStepOne();
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    expect(screen.getByRole("heading", { name: /^Competencias$/ })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Construye su identidad/));
    fireEvent.click(screen.getByLabelText(/Convive y participa/));
    fireEvent.click(screen.getByLabelText(/Gestiona responsablemente el espacio/));
    // Máximo dos: la primera marcada se reemplaza por la nueva.
    expect(screen.getByLabelText(/Construye su identidad/)).not.toBeChecked();
    expect(screen.getByLabelText(/Gestiona responsablemente el espacio/)).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));

    expect(screen.getByRole("heading", { name: /^Enfoques$/ })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Ambiental"));
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    expect(screen.getByRole("alert")).toHaveTextContent(/exactamente dos enfoques/);
    fireEvent.click(screen.getByLabelText("Bien común"));
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));

    expect(screen.getByRole("heading", { name: /^Evaluación$/ })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Instrumento de evaluación/), { target: { value: "Guía de observación" } });
    await screen.findByRole("option", { name: /2do B/ });
    fireEvent.change(screen.getByLabelText(/Lista de estudiantes/), { target: { value: "roster-1" } });
    await waitFor(() => expect(screen.getByLabelText(/uno por línea/)).toHaveValue("Ana Torres\nBruno Cárdenas"));

    fireEvent.click(screen.getByRole("button", { name: /Crear mi clase/ }));

    await screen.findByRole("heading", { name: /sesión de aprendizaje n° 04/i });
    const generate = mocks.apiRequest.mock.calls.find(([path]) => path === "/ai/tools/workflow/generate");
    const body = JSON.parse(String((generate?.[1] as { body: string }).body));
    expect(body.tool_id).toBe("sesion-aprendizaje");
    expect(body.fields.competencies).toContain("Competencia principal: Convive y participa");
    expect(body.fields.transversal_approaches).toBe("Ambiental, Bien común");
    expect(body.fields.student_names).toBe("Ana Torres\nBruno Cárdenas");
    expect(screen.getByRole("button", { name: /Siguiente: instrumento/ })).toBeInTheDocument();
  });

  it("encadena el instrumento y los materiales a partir de la sesión generada", async () => {
    mocks.apiRequest.mockImplementation(async (path: string, init?: { body?: string }) => {
      if (path === "/ai/tools/workflow/generate") {
        const body = JSON.parse(String(init?.body));
        return body.tool_id === "sesion-aprendizaje" ? sessionArtifactSample() : instrumentArtifact;
      }
      if (path === "/documents") return { id: `doc-${Math.random()}` };
      return {};
    });
    render(<MemoryRouter initialEntries={["/dashboard/crear-clase"]}><CreateClassPage /></MemoryRouter>);
    fillStepOne();
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    fireEvent.click(screen.getByLabelText(/Dejar que la IA sugiera/));
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    fireEvent.click(screen.getByLabelText("Inclusivo"));
    fireEvent.click(screen.getByLabelText("Bien común"));
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    fireEvent.click(screen.getByRole("button", { name: /Crear mi clase/ }));
    await screen.findByRole("button", { name: /Siguiente: instrumento/ });

    fireEvent.click(screen.getByRole("button", { name: /Siguiente: instrumento/ }));
    await screen.findByRole("button", { name: /Siguiente: materiales/ });
    const instrumentCall = mocks.apiRequest.mock.calls.filter(([path]) => path === "/ai/tools/workflow/generate").at(-1);
    const body = JSON.parse(String((instrumentCall?.[1] as { body: string }).body));
    expect(body.tool_id).toBe("lista-cotejo");
    expect(body.fields.additional_criteria).toContain("Reconoce el impacto del fenómeno");
    expect(body.fields.chained_rule).toMatch(/exactamente los criterios/);
    expect(mocks.apiRequest.mock.calls.some(([path]) => path === "/documents/relations")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /Siguiente: materiales/ }));
    await screen.findByRole("heading", { name: /Materiales de la sesión/i });
    expect(screen.getByRole("heading", { name: /^Ficha de trabajo$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ver mi clase en el historial/ })).toBeInTheDocument();
  });

  it("como herramienta suelta genera solo la sesión y respeta lo escrito en opciones avanzadas", async () => {
    mocks.apiRequest.mockImplementation(async (path: string) => {
      if (path === "/ai/tools/workflow/generate") return sessionArtifactSample();
      if (path === "/documents") return { id: "doc-sesion" };
      return {};
    });
    render(<MemoryRouter initialEntries={[{ pathname: "/dashboard/planificamos/sesion-aprendizaje", state: { teacherNeed: "El Fenómeno del Niño" } }]}><CreateClassPage mode="sesion" /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: /sesión de aprendizaje en cuatro pasos/i })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: /Etapas de la clase/ })).not.toBeInTheDocument();
    // El pedido de la portada llega como tema.
    expect(screen.getByLabelText(/Tema específico/)).toHaveValue("El Fenómeno del Niño");
    fireEvent.change(screen.getByLabelText(/Nivel educativo/), { target: { value: "Primaria" } });
    fireEvent.change(screen.getByLabelText(/^Grado/), { target: { value: "2° de Primaria" } });
    fireEvent.change(screen.getByLabelText(/Área curricular/), { target: { value: "Personal Social" } });
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    fireEvent.click(screen.getByLabelText(/Dejar que la IA sugiera/));
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    fireEvent.click(screen.getByLabelText("Ambiental"));
    fireEvent.click(screen.getByLabelText("Bien común"));
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));

    // Nada técnico a la vista; los campos largos están plegados.
    expect(screen.queryByText(/Control de calidad/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Reutilizar datos/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(/Opciones avanzadas: escribe tú/));
    fireEvent.change(screen.getByLabelText(/Inicio: motivación/), { target: { value: "Observamos fotos de la última lluvia intensa en el barrio." } });
    expect(screen.queryByRole("button", { name: /Crear mi clase/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Generar la sesión/ }));

    await screen.findByRole("heading", { level: 1, name: /Fenómeno El Niño: ¿cómo nos afecta/i });
    expect(screen.getByRole("heading", { name: /^I\. Datos informativos$/i })).toBeInTheDocument();
    const generate = mocks.apiRequest.mock.calls.find(([path]) => path === "/ai/tools/workflow/generate");
    const body = JSON.parse(String((generate?.[1] as { body: string }).body));
    expect(body.fields.opening).toBe("Observamos fotos de la última lluvia intensa en el barrio.");
    expect(body.fields.development).toBeUndefined();
    expect(body.fields.planning_mode).toMatch(/opciones avanzadas/);
    const saved = mocks.apiRequest.mock.calls.find(([path, init]) => path === "/documents" && (init as { method?: string })?.method === "POST");
    expect(JSON.parse(String((saved?.[1] as { body: string }).body)).metadata.class_flow).toBe(false);
    expect(screen.queryByRole("button", { name: /Siguiente: instrumento/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Descargar Word/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ver en el historial/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Editar datos/ }));
    expect(screen.getByRole("heading", { name: /^Evaluación$/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/Inicio: motivación/)).toHaveValue("Observamos fotos de la última lluvia intensa en el barrio.");
  });

  it("encadena en el servidor: envía la sesión guardada como documento de origen y guarda los datos de la clase", async () => {
    mocks.apiRequest.mockImplementation(async (path: string, init?: { body?: string; method?: string }) => {
      if (path === "/ai/tools/workflow/generate") {
        const body = JSON.parse(String(init?.body));
        return body.tool_id === "sesion-aprendizaje" ? sessionArtifactSample() : instrumentArtifact;
      }
      if (path === "/documents" && init?.method === "POST") {
        const body = JSON.parse(String(init?.body));
        return { id: body.metadata.class_stage === "sesion" ? "doc-sesion" : `doc-${body.metadata.class_stage}` };
      }
      if (path === "/documents") return [];
      return {};
    });
    render(<MemoryRouter initialEntries={["/dashboard/crear-clase"]}><CreateClassPage /></MemoryRouter>);
    fillStepOne();
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    fireEvent.click(screen.getByLabelText(/Dejar que la IA sugiera/));
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    fireEvent.click(screen.getByLabelText("Inclusivo"));
    fireEvent.click(screen.getByLabelText("Bien común"));
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    fireEvent.click(screen.getByRole("button", { name: /Crear mi clase/ }));
    await screen.findByRole("button", { name: /Siguiente: instrumento/ });

    const sessionSave = mocks.apiRequest.mock.calls.find(([path, init]) => path === "/documents" && (init as { method?: string })?.method === "POST");
    const sessionMeta = JSON.parse(String((sessionSave?.[1] as { body: string }).body)).metadata;
    expect(sessionMeta.class_flow).toBe(true);
    expect(sessionMeta.wizard_values.transversal_approaches).toEqual(["Inclusivo", "Bien común"]);

    fireEvent.click(screen.getByRole("button", { name: /Siguiente: instrumento/ }));
    await screen.findByRole("button", { name: /Siguiente: materiales/ });
    const instrumentCall = mocks.apiRequest.mock.calls.filter(([path]) => path === "/ai/tools/workflow/generate").at(-1);
    const body = JSON.parse(String((instrumentCall?.[1] as { body: string }).body));
    expect(body.source_document_id).toBe("doc-sesion");
    const instrumentSave = mocks.apiRequest.mock.calls.filter(([path, init]) => path === "/documents" && (init as { method?: string })?.method === "POST").at(-1);
    const instrumentMeta = JSON.parse(String((instrumentSave?.[1] as { body: string }).body)).metadata;
    expect(instrumentMeta.class_stage).toBe("instrumento");
    expect(instrumentMeta.class_session_id).toBe("doc-sesion");
  });

  it("alinea la sesión con una unidad guardada y la deja vinculada", async () => {
    mocks.apiRequest.mockImplementation(async (path: string, init?: { body?: string; method?: string }) => {
      if (path === "/documents" && !init?.method) {
        return [
          { id: "unit-1", title: "Unidad 3: Cuidamos el agua", document_type: "planificamos/unidad-aprendizaje", metadata_json: { fields: { unit_title: "Cuidamos el agua", learning_purposes: "Explicar el ciclo del agua y proponer acciones de cuidado.", curricular_area: "Personal Social", grade: "2° de Primaria" } } },
          { id: "other", title: "Sesión vieja", document_type: "planificamos/sesion-aprendizaje", metadata_json: {} },
        ];
      }
      if (path === "/ai/tools/workflow/generate") return sessionArtifactSample();
      if (path === "/documents") return { id: "doc-sesion" };
      return {};
    });
    render(<MemoryRouter initialEntries={["/dashboard/crear-clase"]}><CreateClassPage /></MemoryRouter>);
    const originSelect = await screen.findByLabelText(/Basar este documento en/);
    fireEvent.change(originSelect, { target: { value: "unidad" } });
    const unitSelect = await screen.findByLabelText(/^Unidad de aprendizaje$/);
    expect(screen.queryByRole("option", { name: /Sesión vieja/ })).not.toBeInTheDocument();
    fireEvent.change(unitSelect, { target: { value: "unit-1" } });
    expect(screen.getByLabelText(/Título de la unidad/)).toHaveValue("Cuidamos el agua");

    fillStepOne();
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    fireEvent.click(screen.getByLabelText(/Dejar que la IA sugiera/));
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    fireEvent.click(screen.getByLabelText("Inclusivo"));
    fireEvent.click(screen.getByLabelText("Bien común"));
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    fireEvent.click(screen.getByRole("button", { name: /Crear mi clase/ }));
    await screen.findByRole("button", { name: /Siguiente: instrumento/ });

    const generate = mocks.apiRequest.mock.calls.find(([path]) => path === "/ai/tools/workflow/generate");
    const body = JSON.parse(String((generate?.[1] as { body: string }).body));
    expect(body.source_document_id).toBe("unit-1");
    expect(body.fields.unit_title).toBe("Cuidamos el agua");
    expect(body.fields.unit_purpose).toMatch(/ciclo del agua/);
    const relation = mocks.apiRequest.mock.calls.find(([path]) => path === "/documents/relations");
    const relationBody = JSON.parse(String((relation?.[1] as { body: string }).body));
    expect(relationBody).toMatchObject({ parent_document_id: "unit-1", child_document_id: "doc-sesion", relation_type: "continuation" });
  });

  it("encadena plan anual y unidad: solo ofrece las unidades del plan elegido", async () => {
    mocks.apiRequest.mockImplementation(async (path: string, init?: { method?: string }) => {
      if (path === "/documents" && !init?.method) {
        return [
          { id: "plan-1", title: "Plan anual 2026", document_type: "planificamos/plan-curricular-anual", metadata_json: { fields: { curricular_area: "Personal Social" } } },
          { id: "plan-2", title: "Plan anual de Arte", document_type: "planificamos/plan-curricular-anual", metadata_json: {} },
          { id: "unit-1", title: "Unidad 3: Cuidamos el agua", document_type: "planificamos/unidad-aprendizaje", metadata_json: { fields: { unit_title: "Cuidamos el agua" } } },
          { id: "unit-2", title: "Unidad de otro plan", document_type: "planificamos/unidad-aprendizaje", metadata_json: {} },
        ];
      }
      if (path === "/documents/plan-1/relations") {
        return [{ parent_document_id: "plan-1", child_document_id: "unit-1", relation_type: "continuation" }];
      }
      return {};
    });
    render(<MemoryRouter initialEntries={["/dashboard/crear-clase"]}><CreateClassPage /></MemoryRouter>);

    fireEvent.change(await screen.findByLabelText(/Basar este documento en/), { target: { value: "unidad" } });
    // Sin plan elegido se ofrecen todas las unidades guardadas.
    expect(screen.getByRole("option", { name: /Unidad de otro plan/ })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Plan curricular anual \(opcional\)/), { target: { value: "plan-1" } });
    await waitFor(() => expect(screen.queryByRole("option", { name: /Unidad de otro plan/ })).not.toBeInTheDocument());
    expect(screen.getByRole("option", { name: /Cuidamos el agua/ })).toBeInTheDocument();
  });

  it("reabre una clase guardada desde el historial en la etapa donde quedó y arma el ZIP", async () => {
    mocks.apiRequest.mockImplementation(async (path: string) => {
      if (path === "/documents/doc-sesion") {
        return { id: "doc-sesion", title: "Sesión guardada", document_type: "planificamos/sesion-aprendizaje", metadata_json: { artifact: sessionArtifactSample(), class_flow: true, class_stage: "sesion", wizard_values: { level: "Primaria", grade: "2° de Primaria", curricular_area: "Personal Social", session_topic: "El Fenómeno del Niño", transversal_approaches: ["Ambiental", "Bien común"], instrument: "Guía de observación", ai_competency: true } } };
      }
      if (path === "/documents/doc-sesion/relations") return [{ parent_document_id: "doc-sesion", child_document_id: "doc-instrumento", relation_type: "assessment" }];
      if (path === "/documents/doc-instrumento") return { id: "doc-instrumento", title: "Guía", document_type: "evaluamos/lista-cotejo", metadata_json: { artifact: instrumentArtifact, class_flow: true, class_stage: "instrumento" } };
      if (path === "/documents") return [];
      return {};
    });
    render(<MemoryRouter initialEntries={["/dashboard/crear-clase?class=doc-sesion"]}><CreateClassPage /></MemoryRouter>);

    await screen.findByRole("button", { name: /Siguiente: materiales/ });
    expect(screen.getByRole("heading", { level: 1, name: /Instrumento de evaluación/ })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /tutorial/i }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Siguiente: materiales/ }));
    await screen.findByRole("button", { name: /Descargar clase completa/ });
    fireEvent.click(screen.getByRole("button", { name: /Descargar clase completa/ }));
    await waitFor(() => expect(mocks.downloadApiBlob).toHaveBeenCalled(), { timeout: 15_000 });
    const [{ filename, blob }] = mocks.downloadApiBlob.mock.calls.at(-1) as [{ filename: string; blob: Blob }];
    expect(filename).toBe("clase-el-fenomeno-del-nino.zip");
    expect(blob.size).toBeGreaterThan(1000);
  }, 30_000);

  it("muestra al docente qué está preparando la IA mientras genera", async () => {
    mocks.apiRequest.mockImplementation(async (path: string) => {
      if (path === "/ai/tools/workflow/generate") return new Promise(() => undefined);
      if (path === "/documents") return [];
      return {};
    });
    render(<MemoryRouter initialEntries={["/dashboard/crear-clase"]}><CreateClassPage /></MemoryRouter>);
    fillStepOne();
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    fireEvent.click(screen.getByLabelText(/Dejar que la IA sugiera/));
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    fireEvent.click(screen.getByLabelText("Inclusivo"));
    fireEvent.click(screen.getByLabelText("Bien común"));
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente/ }));
    fireEvent.click(screen.getByRole("button", { name: /Crear mi clase/ }));
    expect(await screen.findByText(/Plantilla Word oficial y datos informativos/)).toBeInTheDocument();
    expect(screen.getByText(/Teoría del tema, ficha de trabajo y mapa mental/)).toBeInTheDocument();
  });
});
