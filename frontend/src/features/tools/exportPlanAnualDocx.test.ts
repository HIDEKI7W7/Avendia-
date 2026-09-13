import { describe, expect, it } from "vitest";
import { Packer } from "docx";

import { buildPlanAnualDocxDocument, matrixFamilyColor, periodGrid } from "./exportPlanAnualDocx";
import type { StructuredArtifact } from "./exportWorkflowDocx";

const calendar = {
  title: "Calendarización de unidades",
  columns: ["Periodo", "Unidad", "Título contextualizado", "Situación significativa", "Competencias", "Producto o evidencia", "Duración o fechas"],
  rows: [
    ["Bimestre I", "Unidad 1", "Analizamos el presupuesto familiar", "Gastos del hogar", "Resuelve problemas de cantidad", "Presupuesto", "4 semanas"],
    ["Bimestre I", "Unidad 2", "Modelamos el crecimiento local", "Datos del distrito", "Resuelve problemas de regularidad", "Gráfico", "4 semanas"],
    ["Bimestre II", "Unidad 3", "Optimizamos recursos", "Agua en la comunidad", "Resuelve problemas de cantidad", "Informe", "5 semanas"],
  ],
  note: "",
};

describe("exportPlanAnualDocx", () => {
  it("construye la cuadrícula de periodos desde la matriz de calendarización", () => {
    const grid = periodGrid([calendar]);
    expect(grid?.periods).toEqual(["Bimestre I", "Bimestre II"]);
    expect(grid?.units["Bimestre I"]).toHaveLength(2);
    expect(grid?.units["Bimestre II"][0]).toBe("Unidad 3: Optimizamos recursos (5 semanas)");
    expect(periodGrid([])).toBeNull();
  });

  it("asigna el color de cabecera por familia de matriz", () => {
    expect(matrixFamilyColor("Diagnóstico de aprendizaje")).toBe("0B769F");
    expect(matrixFamilyColor("Evaluación de aprendizajes")).toBe("1B4F72");
    expect(matrixFamilyColor("Materiales educativos")).toBe("0F4761");
    expect(matrixFamilyColor("Organización curricular")).toBe("2E75B6");
  });

  it("genera el Word horizontal con portada, cuadrícula y firmas", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Plan Curricular Anual 2026: Matemática 3° de Secundaria",
      executive_summary: "Programación anual del área de Matemática organizada en cuatro bimestres y ocho unidades.",
      sections: [{ title: "Justificación", narrative: "El área contribuye a formar ciudadanos capaces de interpretar datos.", key_points: ["Enfoque centrado en la resolución de problemas."] }],
      teacher_recommendations: ["Revisar la calendarización con el equipo directivo.", "Ajustar las unidades al calendario cívico."],
      tables: [calendar],
      model: "gemini-test",
    };
    const doc = await buildPlanAnualDocxDocument(artifact, { values: { institution: "I.E. 0001", school_year: "2026", teacher_name: "Prof. Ana Torres" } });
    const buffer = await Packer.toBuffer(doc);
    expect(buffer.byteLength).toBeGreaterThan(20_000);
  });
});
