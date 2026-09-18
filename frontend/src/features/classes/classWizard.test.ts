import { describe, expect, it } from "vitest";

import { sessionArtifactSample } from "../tools/qaExport18SesionAprendizaje.test";
import {
  defaultValues,
  instrumentFields,
  instrumentTarget,
  sessionFields,
  sessionSummaryForChain,
  stepErrors,
  toggleLimited,
  type ClassWizardValues,
} from "./classWizard";

const filled: ClassWizardValues = {
  ...defaultValues({ full_name: "Prof. Miguel Quispe", school_name: "I.E. 123", education_level: "Primaria", grade: "2° de Primaria", curricular_area: "Personal Social" }),
  session_topic: "El Fenómeno del Niño",
  competencies: ["Construye su identidad", "Convive y participa democráticamente en la búsqueda del bien común"],
  transversal_approaches: ["Ambiental", "Bien común"],
  instrument: "Guía de observación",
  student_names: "Ana Torres\nBruno Cárdenas",
};

describe("classWizard", () => {
  it("precarga nivel, grado y área desde el perfil del docente", () => {
    const values = defaultValues({ education_level: "Secundaria", grade: "3° de Secundaria", curricular_area: "Matemática" });
    expect(values.level).toBe("Secundaria");
    expect(values.grade).toBe("3° de Secundaria");
    expect(values.curricular_area).toBe("Matemática");
    expect(values.duration_minutes).toBe("90");
    expect(defaultValues({ education_level: "Otro" }).level).toBe("Primaria");
  });

  it("valida cada paso con mensajes cortos", () => {
    const empty = defaultValues();
    expect(stepErrors(0, empty)).toEqual(["Elige el grado.", "Elige el área curricular.", "Escribe el tema de la sesión."]);
    expect(stepErrors(1, { ...filled, competencies: [], ai_competency: false })).toHaveLength(1);
    expect(stepErrors(1, { ...filled, competencies: [], ai_competency: true })).toHaveLength(0);
    expect(stepErrors(2, { ...filled, transversal_approaches: ["Ambiental"] })).toHaveLength(1);
    expect(stepErrors(3, filled)).toHaveLength(0);
  });

  it("limita las selecciones a dos y reemplaza la más antigua", () => {
    expect(toggleLimited(["a"], "b", 2)).toEqual(["a", "b"]);
    expect(toggleLimited(["a", "b"], "c", 2)).toEqual(["b", "c"]);
    expect(toggleLimited(["a", "b"], "a", 2)).toEqual(["b"]);
  });

  it("arma los campos de la sesión con los datos del perfil y las elecciones del docente", () => {
    const fields = sessionFields(filled, { full_name: "Prof. Miguel Quispe", school_name: "I.E. 123", dre: "DRE Lima" });
    expect(fields.teacher_name).toBe("Prof. Miguel Quispe");
    expect(fields.institution).toBe("I.E. 123");
    expect(fields.competencies).toContain("Competencia principal: Construye su identidad");
    expect(fields.competencies).toContain("Competencia de apoyo: Convive");
    expect(fields.transversal_approaches).toBe("Ambiental, Bien común");
    expect(fields.include_worksheet).toBe("Sí");
    expect(sessionFields({ ...filled, competencies: [], ai_competency: true }).competencies).toMatch(/Selecciona la competencia/);
  });

  it("deriva el instrumento de los criterios y la evidencia de la sesión generada", () => {
    const session = sessionArtifactSample();
    const summary = sessionSummaryForChain(session, filled);
    expect(summary.criteria).toHaveLength(3);
    expect(summary.criteria[0]).toMatch(/Reconoce el impacto/);

    const checklist = instrumentFields(filled, session);
    expect(instrumentTarget("Guía de observación").toolId).toBe("lista-cotejo");
    expect(checklist.criteria_count).toBe("3");
    expect(checklist.additional_criteria).toContain("Identifica cambios causados");
    expect(checklist.student_names).toBe("Ana Torres\nBruno Cárdenas");
    expect(checklist.response_scale).toBe("Logrado / En proceso");

    const rubric = instrumentFields({ ...filled, instrument: "Rúbrica" }, session);
    expect(instrumentTarget("Rúbrica").toolId).toBe("rubrica-evaluacion");
    expect(rubric.criteria_notes.split("\n")).toHaveLength(3);
    expect(rubric.product).toMatch(/Organizador visual/);

    const scale = instrumentFields({ ...filled, instrument: "Escala de estimación" }, session);
    expect(instrumentTarget("Escala de estimación").toolId).toBe("escala-estimacion");
    expect(scale.scale_type).toBe("Logrado / En proceso / Inicio");
  });
});
