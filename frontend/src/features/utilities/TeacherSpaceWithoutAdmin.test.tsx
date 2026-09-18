/**
 * El espacio docente no debe contener controles de administración: la moderación
 * vive bajo /admin. Antes estos formularios aparecían incrustados en las páginas
 * del docente detrás de un `role === "admin"`.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const TEACHER_PAGES = [
  "src/features/utilities/IdeasPage.tsx",
  "src/features/utilities/CommunityPage.tsx",
  "src/features/utilities/TutorialsPage.tsx",
  "src/features/utilities/ReferralsPage.tsx",
];

describe("Separación del espacio docente y la administración", () => {
  it.each(TEACHER_PAGES)("%s no llama a ningún endpoint de administración", (page) => {
    expect(readFileSync(page, "utf8")).not.toContain("/admin/");
  });

  it.each(TEACHER_PAGES)("%s no ramifica la interfaz por el rol de administrador", (page) => {
    expect(readFileSync(page, "utf8")).not.toContain('role === "admin"');
  });

  it("la moderación agrupa ideas, comunidad, tutoriales y referidos en el área de admin", () => {
    const moderation = readFileSync("src/features/admin/AdminModerationPage.tsx", "utf8");
    for (const endpoint of ["/admin/ideas/", "/admin/community/", "/admin/tutorials", "/admin/referrals"]) {
      expect(moderation).toContain(endpoint);
    }
  });
});
