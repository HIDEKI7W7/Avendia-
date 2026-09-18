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

  it("acota las unidades al plan elegido", async () => {
    render(<MemoryRouter initialEntries={["/dashboard/recursos/crucigramas"]}><WorkflowTool /></MemoryRouter>);
    fireEvent.change(await screen.findByLabelText(/Basar este documento en/), { target: { value: "unidad" } });
    expect(screen.getByRole("option", { name: /Unidad de otro plan/ })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Plan curricular anual \(opcional\)/), { target: { value: "plan-1" } });
    await waitFor(() => expect(screen.queryByRole("option", { name: /Unidad de otro plan/ })).not.toBeInTheDocument());
    expect(screen.getByRole("option", { name: /Cuidamos el agua/ })).toBeInTheDocument();
  });
});
