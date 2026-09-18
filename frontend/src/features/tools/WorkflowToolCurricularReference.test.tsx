/**
 * La cascada plan anual → unidad debe estar en TODAS las herramientas, no solo
 * en el asistente de clase. Se comprueba sobre dos herramientas de módulos
 * distintos, una de ellas sin origen compatible declarado en el backend.
 */
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { WorkflowTool } from "./WorkflowTool";

const mocks = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock("../../lib/api", async () => {
  const actual = await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
  return { ...actual, apiRequest: (...args: unknown[]) => mocks.apiRequest(...args) };
});

const DRAFT_KEY = "avendia.draft.workflow.recursos/crucigramas.v2.anonymous";

const DOCUMENTS = [
  { id: "plan-1", title: "Plan anual 2026", document_type: "planificamos/plan-curricular-anual", metadata_json: {} },
  { id: "unit-1", title: "Unidad 3: Cuidamos el agua", document_type: "planificamos/unidad-aprendizaje", metadata_json: { fields: { unit_title: "Cuidamos el agua", grade: "2° de Primaria" } } },
  { id: "unit-2", title: "Unidad de otro plan", document_type: "planificamos/unidad-aprendizaje", metadata_json: {} },
];

function mockDocuments() {
  mocks.apiRequest.mockImplementation(async (path: string, init?: { method?: string }) => {
    if (path === "/documents" && !init?.method) return DOCUMENTS;
    if (path === "/documents/plan-1/relations") {
      return [{ parent_document_id: "plan-1", child_document_id: "unit-1", relation_type: "continuation" }];
    }
    // El resto de consultas del motor (plantillas, perfil) devuelven listas vacías.
    return [];
  });
}

describe("Origen curricular en cascada dentro del motor de herramientas", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("avendia.accessToken", "token-de-prueba");
    mocks.apiRequest.mockReset();
    mockDocuments();
  });

  it.each([
    ["/dashboard/recursos/crucigramas"],
    ["/dashboard/evaluamos/examen"],
  ])("ofrece el selector de plan anual y unidad en %s", async (route) => {
    render(<MemoryRouter initialEntries={[route]}><WorkflowTool /></MemoryRouter>);
    const origin = await screen.findByLabelText(/Basar este documento en/);
    expect(within(origin).getByRole("option", { name: /plan curricular anual/i })).toBeInTheDocument();
    expect(within(origin).getByRole("option", { name: /unidad de aprendizaje/i })).toBeInTheDocument();
  });

  it("cambiar el origen invalida el resultado ya generado", async () => {
    // Un artefacto generado con el contexto anterior no puede quedar colgando de
    // un origen nuevo: al guardar se archivaría bajo un documento del que no salió.
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      version: 2,
      currentStep: 0,
      values: {},
      artifact: {
        document_title: "Crucigrama del ciclo del agua",
        executive_summary: "Resultado generado antes de elegir el origen.",
        sections: [{ title: "Instrucciones", narrative: "Resuelve.", key_points: ["Lee la pista."] }],
        teacher_recommendations: ["Revisar antes de imprimir."],
        tables: [],
        model: "gemini-test",
      },
      updatedAt: new Date().toISOString(),
    }));
    render(<MemoryRouter initialEntries={["/dashboard/recursos/crucigramas"]}><WorkflowTool /></MemoryRouter>);
    const stored = () => JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    // El borrador se rehidrata con su artefacto antes de tocar nada.
    await waitFor(() => expect(stored()?.artifact?.document_title).toBe("Crucigrama del ciclo del agua"));

    fireEvent.change(await screen.findByLabelText(/Basar este documento en/), { target: { value: "plan" } });
    fireEvent.change(screen.getByLabelText(/^Plan curricular anual$/), { target: { value: "plan-1" } });

    await waitFor(() => expect(stored()?.artifact).toBeNull());
  });

  it("ignora un origen que el docente ya borró en lugar de arrastrarlo", async () => {
    // El borrador recuerda una unidad que ya no existe. Si se conservara, cada
    // generación recibiría un 404 del servidor y el selector mostraría un origen
    // que no se puede resolver.
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      version: 2,
      currentStep: 0,
      values: {},
      artifact: null,
      curricular: { mode: "unidad", planId: "", unitId: "unidad-borrada" },
      updatedAt: new Date().toISOString(),
    }));
    render(<MemoryRouter initialEntries={["/dashboard/recursos/crucigramas"]}><WorkflowTool /></MemoryRouter>);

    const origin = await screen.findByLabelText(/Basar este documento en/);
    await waitFor(() => expect(origin).toHaveValue(""));
    // Al soltarse el origen, el desplegable de unidad ya no se ofrece.
    expect(screen.queryByLabelText(/^Unidad de aprendizaje$/)).not.toBeInTheDocument();
  });

  it("acota las unidades al plan elegido", async () => {
    render(<MemoryRouter initialEntries={["/dashboard/recursos/crucigramas"]}><WorkflowTool /></MemoryRouter>);
    fireEvent.change(await screen.findByLabelText(/Basar este documento en/), { target: { value: "unidad" } });
    expect(screen.getByRole("option", { name: /Unidad de otro plan/ })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Plan curricular anual \(opcional\)/), { target: { value: "plan-1" } });
    await waitFor(() => expect(screen.queryByRole("option", { name: /Unidad de otro plan/ })).not.toBeInTheDocument());
    expect(screen.getByRole("option", { name: /Cuidamos el agua/ })).toBeInTheDocument();
  });
});
