/**
 * Adaptador de `AssistanceGateway` sobre la API de Avendia.
 *
 * Las operaciones accesorias (preferencias y valoración de una sugerencia) no
 * deben interrumpir al docente si fallan, así que se resuelven en silencio; la
 * sugerencia y la reescritura sí propagan el error, porque el docente está
 * esperando un resultado en pantalla.
 */
import { apiRequest } from "../../../../lib/api";
import { readAccessToken } from "../../../../lib/session";
import type { AssistanceMode } from "../../pedagogicalContext";
import type {
  AssistanceGateway,
  AssistancePreferences,
  FieldSuggestionRequest,
} from "../ports/assistanceGateway";

function authHeaders(): Record<string, string> | undefined {
  const token = readAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export function httpAssistanceGateway(): AssistanceGateway {
  return {
    suggestField({ payload, signal }: FieldSuggestionRequest) {
      return apiRequest<{ reply: string }>("/ai/tools/field-assist", {
        method: "POST",
        signal,
        headers: authHeaders(),
        body: payload,
      });
    },

    async readPreferences(signal?: AbortSignal) {
      const headers = authHeaders();
      if (!headers) return null;
      return apiRequest<{ consent: boolean; assistance_mode?: AssistanceMode }>(
        "/ai/tools/field-assist/preferences",
        { headers, signal },
      ).catch(() => null);
    },

    async savePreferences(preferences: AssistancePreferences) {
      const headers = authHeaders();
      if (!headers) return;
      await apiRequest("/ai/tools/field-assist/preferences", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          consent: preferences.consent,
          assistance_mode: preferences.assistanceMode,
          preferred_length: "balanced",
        }),
      }).catch(() => undefined);
    },

    async recordFeedback(feedback: Record<string, unknown>) {
      const headers = authHeaders();
      if (!headers) return;
      await apiRequest("/ai/tools/field-assist/feedback", {
        method: "POST",
        headers,
        body: JSON.stringify(feedback),
      }).catch(() => undefined);
    },

    rewriteSection(request: Record<string, unknown>) {
      return apiRequest<{ reply: string }>("/ai/tools/copilot", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(request),
      });
    },
  };
}
