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
});
