import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { resetYearMotto, setYearMotto } from "./docx/motto";
import { SessionDocumentPreview } from "./SessionDocumentPreview";
import { sessionArtifactSample, sessionValuesSample } from "./qaExport18SesionAprendizaje.test";

describe("SessionDocumentPreview", () => {
  afterEach(() => {
    cleanup();
    resetYearMotto();
  });

  it("reproduce los bloques del formato de referencia con ilustraciones y anexos", () => {
    render(<SessionDocumentPreview artifact={sessionArtifactSample()} values={sessionValuesSample} />);

    expect(screen.getByRole("heading", { name: /sesión de aprendizaje n° 04/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^I\. Datos informativos$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /VI\. Procesos pedagógicos y actividades/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /VIII\. Soporte pedagógico/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /ministerio de educación/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^inicio$/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^desarrollo$/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^cierre$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /teoría del tema/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /instrumento de evaluación — guía de observación/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^ficha de trabajo$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /mapa mental/i })).toBeInTheDocument();
    expect(screen.getByText(/Un calentamiento inusual del mar Pacífico/)).toBeInTheDocument();
    expect(screen.getByText("Ana Lucía Torres")).toBeInTheDocument();
    expect(screen.getByText(/DOCENTE DEL ÁREA/)).toBeInTheDocument();
  });

  it("deja líneas de llenado y omite los anexos cuando la IA no devolvió matrices", () => {
    const artifact = { ...sessionArtifactSample(), tables: [], sections: [] };
    render(<SessionDocumentPreview artifact={artifact} values={{ opening: "Motivación con una lámina del barrio." }} />);

    expect(screen.getByText(/Motivación con una lámina del barrio/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /^ficha de trabajo$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /mapa mental/i })).not.toBeInTheDocument();
    expect(screen.getAllByText("________________________").length).toBeGreaterThan(3);
  });

  it("encabeza cada página con el lema fijado por administración y lo omite si está vacío", () => {
    setYearMotto("“Año del Bicentenario”");
    const { unmount } = render(<SessionDocumentPreview artifact={sessionArtifactSample()} values={sessionValuesSample} />);
    expect(screen.getAllByText("“Año del Bicentenario”").length).toBeGreaterThan(0);
    unmount();

    setYearMotto("");
    render(<SessionDocumentPreview artifact={sessionArtifactSample()} values={sessionValuesSample} />);
    expect(screen.queryByText(/Año del Bicentenario/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Año de la Esperanza/)).not.toBeInTheDocument();
  });
});
