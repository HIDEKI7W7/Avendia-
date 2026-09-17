import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { ToolWorkspace } from "./ToolWorkspace";

vi.mock("./WorkflowTool", () => ({ WorkflowTool: () => <div>Editor completo</div> }));
vi.mock("../classes/CreateClassPage", () => ({ CreateClassPage: ({ mode }: { mode?: string }) => <div>Asistente corto · {mode}</div> }));

function renderAt(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/dashboard/:moduleId/:toolId" element={<ToolWorkspace />} /></Routes></MemoryRouter>);
}

describe("ToolWorkspace", () => {
  afterEach(cleanup);

  it("abre la sesión de aprendizaje con el asistente corto", async () => {
    renderAt("/dashboard/planificamos/sesion-aprendizaje");
    expect(await screen.findByText("Asistente corto · sesion")).toBeInTheDocument();
  });

  it("reabre una sesión guardada en el editor completo", () => {
    renderAt("/dashboard/planificamos/sesion-aprendizaje?document=doc-1");
    expect(screen.getByText("Editor completo")).toBeInTheDocument();
  });

  it("deja el resto de herramientas en el editor completo", () => {
    renderAt("/dashboard/planificamos/unidad-aprendizaje");
    expect(screen.getByText("Editor completo")).toBeInTheDocument();
  });
});
