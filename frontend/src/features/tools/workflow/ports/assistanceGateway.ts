/**
 * Puerto de la asistencia con IA: sugerir el contenido de un campo, registrar si
 * al docente le sirvió, recordar sus preferencias y rehacer una sección del
 * resultado.
 *
 * Se mantiene aparte del `WorkflowGateway` porque son dos capacidades distintas:
 * una redacta el documento y la otra ayuda a rellenarlo. Un consumidor puede
 * necesitar una sin la otra.
 */
import type { AssistanceMode } from "../../pedagogicalContext";

export type FieldSuggestionRequest = {
  payload: string;
  signal: AbortSignal;
};

export type AssistancePreferences = {
  consent: boolean;
  assistanceMode: AssistanceMode;
};

export type FeedbackOutcome =
  | "useful" | "edited" | "incorrect" | "repetitive" | "too_long" | "discarded";

export type AssistanceGateway = {
  suggestField(request: FieldSuggestionRequest): Promise<{ reply: string }>;
  readPreferences(signal?: AbortSignal): Promise<{ consent: boolean; assistance_mode?: AssistanceMode } | null>;
  savePreferences(preferences: AssistancePreferences): Promise<void>;
  recordFeedback(feedback: Record<string, unknown>): Promise<void>;
  rewriteSection(request: Record<string, unknown>): Promise<{ reply: string }>;
};
