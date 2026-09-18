import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Document, Packer, Paragraph } from "docx";

import { documentHeader } from "./chrome";
import { applyBrandingResponse, getYearMotto, resetYearMotto, setYearMotto, useYearMotto } from "./motto";
import { YEAR_MOTTO } from "./theme";

async function headerXml(): Promise<string> {
  const doc = new Document({ sections: [{ headers: documentHeader(), children: [new Paragraph("x")] }] });
  const buffer = await Packer.toBuffer(doc);
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);
  const files = Object.keys(zip.files).filter((name) => /^word\/header\d*\.xml$/.test(name));
  const parts = await Promise.all(files.map((name) => zip.file(name)!.async("string")));
  return parts.join("\n");
}

afterEach(() => resetYearMotto());

describe("lema del año", () => {
  it("usa el lema incrustado hasta que administración fija otro", () => {
    expect(getYearMotto()).toBe(YEAR_MOTTO);
    setYearMotto("  “Año de la Unidad” ");
    expect(getYearMotto()).toBe("“Año de la Unidad”");
    setYearMotto(undefined);
    expect(getYearMotto()).toBe(YEAR_MOTTO);
  });

  it("acepta la cadena vacía para omitir el lema en la cabecera", () => {
    setYearMotto("");
    expect(getYearMotto()).toBe("");
  });

  it("solo toma de la respuesta del servidor un lema de texto", () => {
    applyBrandingResponse([]);
    applyBrandingResponse({ year_motto: 42 });
    expect(getYearMotto()).toBe(YEAR_MOTTO);
    applyBrandingResponse({ year_motto: "“Año del Bicentenario”" });
    expect(getYearMotto()).toBe("“Año del Bicentenario”");
  });

  it("actualiza los componentes suscritos", () => {
    const { result } = renderHook(() => useYearMotto());
    expect(result.current).toBe(YEAR_MOTTO);
    act(() => setYearMotto("“Año de la Esperanza”"));
    expect(result.current).toBe("“Año de la Esperanza”");
  });

  it("imprime en la cabecera del Word el lema configurado", async () => {
    setYearMotto("“Año del Bicentenario”");
    expect(await headerXml()).toContain("“Año del Bicentenario”");
    setYearMotto("");
    expect(await headerXml()).not.toContain("Año de");
  });
});
