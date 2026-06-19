import { BACKEND_URL } from "@/config/api";

/**
 * Servicio para interactuar con el asistente administrativo virtual EduAsesor
 * enviando la consulta y el historial de chat acumulado.
 */
export async function askEduAsesor(
  message: string,
  history: Array<{ sender: "user" | "bot"; content: string }>
): Promise<{ response: string; sources: string[] }> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/chatbot/ask`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        message: message,
        history: history,
      }),
    });

    if (!response.ok) {
      const errDetail = await response.text();
      throw new Error(`Error en el chatbot: ${errDetail || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fallo al consultar a EduAsesor:", error);
    throw error;
  }
}
