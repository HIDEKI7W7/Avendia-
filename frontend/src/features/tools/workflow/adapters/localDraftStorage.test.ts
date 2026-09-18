import { beforeEach, describe, expect, it } from "vitest";

import { localDraftStorage } from "./localDraftStorage";

const KEY = "avendia.draft.workflow.prueba.v2.anonymous";
const LEGACY = "avendia.workflow.prueba.anonymous";

describe("localDraftStorage", () => {
  beforeEach(() => localStorage.clear());

  it("parte de un borrador limpio y marca como del perfil lo que ya viene relleno", () => {
    const draft = localDraftStorage(KEY, LEGACY).read({ level: "Primaria", grade: "" });
    expect(draft.values).toEqual({ level: "Primaria", grade: "" });
    expect(draft.fieldSources).toEqual({ level: "profile" });
    expect(draft.artifact).toBeNull();
  });

  it("recupera el borrador guardado por encima de los valores iniciales", () => {
    const storage = localDraftStorage(KEY, LEGACY);
    storage.write({ ...storage.read({}), currentStep: 3, values: { grade: "5° de Primaria" } });
    expect(storage.read({ grade: "" }).currentStep).toBe(3);
    expect(storage.read({ grade: "" }).values.grade).toBe("5° de Primaria");
  });

  it("lee el borrador heredado cuando no hay uno en la clave actual", () => {
    localStorage.setItem(LEGACY, JSON.stringify({ version: 2, currentStep: 2, values: {} }));
    expect(localDraftStorage(KEY, LEGACY).read({}).currentStep).toBe(2);
  });

  it("descarta un borrador ilegible en vez de romper la pantalla", () => {
    localStorage.setItem(KEY, "{ esto no es json");
    expect(localDraftStorage(KEY, LEGACY).read({}).currentStep).toBe(0);
  });

  it("normaliza la modalidad guardada contra el catálogo vigente", () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 2, values: { modality: "EBR" } }));
    const modality = localDraftStorage(KEY, LEGACY).read({}).values.modality;
    expect(String(modality).startsWith("EBR")).toBe(true);
    expect(String(modality).length).toBeGreaterThan(3);
  });

  it("sella la fecha al guardar, para que el historial local tenga orden", () => {
    const storage = localDraftStorage(KEY, LEGACY);
    expect(storage.write(storage.read({})).updatedAt).not.toBe("");
  });
});
