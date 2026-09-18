import { describe, expect, it } from "vitest";

import type { CurricularReference } from "../../../../lib/curricularReference";
import { effectiveOrigin, inheritedValues, originDocumentId, releasedFields } from "./curricularOrigin";

const unidad: CurricularReference = {
  id: "unit-1",
  kind: "unidad-aprendizaje",
  title: "Unidad 3",
  unitTitle: "Cuidamos el agua",
  purpose: "Explicar el ciclo del agua.",
  modality: "EBA — Educación Básica Alternativa",
  level: "EBA · Ciclo Avanzado",
  grade: "2.º grado EBA",
  area: "Ciencia y Tecnología",
};

const TODOS = new Set(["modality", "level", "grade", "curricular_area", "unit_title", "unit_purpose"]);

describe("inheritedValues", () => {
  it("hereda la modalidad junto al nivel, porque el nivel depende de ella", () => {
    const heredado = inheritedValues(unidad, TODOS);
    expect(heredado.modality).toBe("EBA — Educación Básica Alternativa");
    expect(heredado.level).toBe("EBA · Ciclo Avanzado");
  });

  it("solo copia los campos que la herramienta declara", () => {
    expect(inheritedValues(unidad, new Set(["unit_title"]))).toEqual({ unit_title: "Cuidamos el agua" });
  });

  it("no inventa nada cuando no hay origen", () => {
    expect(inheritedValues(null, TODOS)).toEqual({});
  });

  it("omite los datos que el origen no tiene", () => {
    const sinGrado = { ...unidad, grade: "" };
    expect(inheritedValues(sinGrado, TODOS)).not.toHaveProperty("grade");
  });
});

describe("releasedFields", () => {
  it("suelta lo que copió el origen anterior y el nuevo ya no aporta", () => {
    const soltados = releasedFields(["unit_title", "grade"], { grade: "3° de Primaria" }, {
      unit_title: "reference",
      grade: "reference",
    });
    expect(soltados).toEqual(["unit_title"]);
  });

  it("respeta lo que el docente editó a mano después de heredarlo", () => {
    const soltados = releasedFields(["unit_title"], {}, { unit_title: "teacher" });
    expect(soltados).toEqual([]);
  });
});

describe("effectiveOrigin", () => {
  const elegido = { mode: "unidad" as const, planId: "", unitId: "unit-1" };

  it("respeta lo guardado mientras la lista no se ha cargado", () => {
    expect(effectiveOrigin(elegido, null)).toEqual(elegido);
  });

  it("suelta un origen que ya no existe, para no pedir al servidor un documento borrado", () => {
    expect(effectiveOrigin(elegido, [])).toEqual({ mode: "", planId: "", unitId: "" });
  });

  it("conserva el origen cuando sigue disponible", () => {
    expect(effectiveOrigin(elegido, [unidad])).toEqual(elegido);
  });
});

describe("originDocumentId", () => {
  it("la unidad manda sobre el plan cuando se eligieron ambos", () => {
    expect(originDocumentId({ mode: "unidad", planId: "plan-1", unitId: "unit-1" })).toBe("unit-1");
  });

  it("usa el plan cuando la cascada se quedó en ese nivel", () => {
    expect(originDocumentId({ mode: "plan", planId: "plan-1", unitId: "" })).toBe("plan-1");
  });

  it("sin origen no hay documento del que colgar", () => {
    expect(originDocumentId({ mode: "", planId: "", unitId: "" })).toBe("");
  });
});
