import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HistoryPage } from "./HistoryPage";

const mocks = vi.hoisted(() => ({
  apiRequest: vi.fn(),
}));

vi.mock("../../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/api")>();
  return {
    ...actual,
    apiRequest: (...args: unknown[]) => mocks.apiRequest(...args),
  };
});

describe("HistoryPage reproduction", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("avendia.accessToken", "test-token");
    sessionStorage.setItem(
      "avendia.user",
      JSON.stringify({
        full_name: "Administrador Avendia",
        email: "admin@avendia.com",
        role: "admin",
      })
    );

    localStorage.setItem(
      "avendia.draft.crear-clase.v1.admin@avendia.com",
      JSON.stringify({
        stage: "materiales",
        step: 3,
        values: {
          level: "Secundaria",
          grade: "5° de Secundaria",
          curricular_area: "Matemática",
          session_topic: "Ecuaciones no lineales",
          unit_title: "Ecuaciones no lineales",
          session_title: "Modelamos y resolvemos situaciones cotidianas usando ecuaciones no lineales",
          competencies: [],
          ai_competency: true,
          transversal_approaches: ["Derechos", "Inclusivo"],
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
        },
        session: null,
        instrument: null,
        documentIds: {
          sesion: "e59c6d74-b880-430e-a8f1-39b77babcd6b",
          instrumento: "cbe33a3d-24fa-4acb-83df-f839fc8a65f7",
          materiales: "2ed2f007-0be3-40d1-be68-334bb83b4daa",
        },
        updatedAt: "2026-09-25T14:31:51.909Z",
      })
    );

    mocks.apiRequest.mockImplementation((path: string) => {
      if (typeof path === "string" && path.includes("/utilities/summary")) {
        return Promise.resolve({
          tutorials: { published: 0, completed: 0 },
          history: { documents: 3 },
          templates: { total: 0 },
          ideas: { mine: 0, votes: 0 },
          referrals: { total: 0, credited: 0 },
          community: { posts: 0, saved: 0 },
        });
      }
      if (typeof path === "string" && path.includes("/history/feed")) {
        return Promise.resolve({
          total: 3,
          documents: [
            {
              id: "e59c6d74-b880-430e-a8f1-39b77babcd6b",
              title: "Sesión de Aprendizaje: Modelamos y resolvemos situaciones cotidianas usando ecuaciones no lineales",
              document_type: "planificamos/sesion-aprendizaje",
              status: "draft",
              content: "test session content",
              revision: 1,
              favorite: false,
              created_at: "2026-09-25T14:31:51.909901Z",
              updated_at: "2026-09-25T14:31:51.909906Z",
              metadata_json: {
                source_route: "/dashboard/planificamos/sesion-aprendizaje",
                class_flow: true,
                class_stage: "sesion",
                class_session_id: null,
              },
            },
            {
              id: "cbe33a3d-24fa-4acb-83df-f839fc8a65f7",
              title: "Lista de cotejo: Modelamos y resolvemos situaciones cotidianas usando ecuaciones no lineales",
              document_type: "evaluamos/lista-cotejo",
              status: "draft",
              content: "test instrument content",
              revision: 1,
              favorite: false,
              created_at: "2026-09-25T14:32:00.000000Z",
              updated_at: "2026-09-25T14:32:00.000000Z",
              metadata_json: {
                source_route: "/dashboard/evaluamos/lista-cotejo",
                class_flow: true,
                class_stage: "instrumento",
                class_session_id: "e59c6d74-b880-430e-a8f1-39b77babcd6b",
              },
            },
            {
              id: "2ed2f007-0be3-40d1-be68-334bb83b4daa",
              title: "Materiales: Sesión de Aprendizaje: Modelamos y resolvemos situaciones cotidianas usando ecuaciones no lineales",
              document_type: "planificamos/materiales-sesion",
              status: "draft",
              content: "test materials content",
              revision: 1,
              favorite: false,
              created_at: "2026-09-25T14:33:00.000000Z",
              updated_at: "2026-09-25T14:33:00.000000Z",
              metadata_json: {
                source_route: "/dashboard/crear-clase",
                class_flow: true,
                class_stage: "materiales",
                class_session_id: "e59c6d74-b880-430e-a8f1-39b77babcd6b",
              },
            },
          ],
          instruments: [],
        });
      }
      return Promise.resolve({});
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders history page without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HistoryPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Historial y borradores")).toBeInTheDocument();

    await waitFor(() => {
      const headings = screen.getAllByRole("heading", { level: 2 });
      console.log("HEADINGS FOUND:", headings.map(h => h.textContent));
      expect(headings.length).toBeGreaterThan(1);
    }, { timeout: 3000 });
  });
});
