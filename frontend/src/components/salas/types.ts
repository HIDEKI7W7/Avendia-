// ═══════════════════════════════════════════════════════════════════════════
// SALAS AVENDIA — Types & Interfaces
// ═══════════════════════════════════════════════════════════════════════════

export type TipoSala = "chat" | "examen";
export type OrigenContenido = "tema" | "documento" | "archivo";
export type Dificultad = "facil" | "intermedio" | "dificil";

export interface SalaConfig {
  tipo: TipoSala;
  nombre: string;
  instruccionesEstudiante: string;
  aulaVinculadaId: string | null;
  origenContenido: OrigenContenido;
  numPreguntas: number;
  dificultad: Dificultad;
  systemPromptPersonalizado: string;
}

export const DEFAULT_SYSTEM_PROMPT = `Eres un evaluador experto y un tutor socrático. Tu objetivo principal es evaluar si el estudiante comprende a fondo el tema asignado.

Reglas:
1. Haz una pregunta a la vez y espera la respuesta antes de continuar.
2. Si el estudiante responde correctamente, anímalo brevemente y pasa a la siguiente pregunta.
3. Si la respuesta es incorrecta o incompleta, proporciona una pista breve sin revelar la respuesta.
4. Usa un tono amigable, claro y alentador en todo momento.
5. Al finalizar todas las preguntas, entrega un resumen de desempeño con puntaje.`;

export const DEFAULT_SALA_CONFIG: SalaConfig = {
  tipo: "chat",
  nombre: "",
  instruccionesEstudiante: "",
  aulaVinculadaId: null,
  origenContenido: "tema",
  numPreguntas: 10,
  dificultad: "intermedio",
  systemPromptPersonalizado: DEFAULT_SYSTEM_PROMPT,
};

// Etiquetas legibles para el resumen final
export const TIPO_LABELS: Record<TipoSala, string> = {
  chat: "Conversar con IA",
  examen: "Examen Interactivo",
};

export const ORIGEN_LABELS: Record<OrigenContenido, string> = {
  tema: "Tema o preguntas propias",
  documento: "Documento interno",
  archivo: "Archivo subido",
};

export const DIFICULTAD_LABELS: Record<Dificultad, string> = {
  facil: "Fácil",
  intermedio: "Intermedio",
  dificil: "Difícil",
};
