import { BACKEND_URL } from "@/config/api";

/**
 * Servicio para consumir la API de documentos del Backend y gestionar
 * la descarga segura del archivo Word (.docx) procesado.
 */
export async function generateAndDownloadDocument(
  documentType: string,
  formData: Record<string, any>
): Promise<void> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Adjuntar el JWT de autenticación si existe en la sesión
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/documents/generate`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        document_type: documentType,
        title: formData.title || "Documento Escolar",
        form_data: formData,
      }),
    });

    if (!response.ok) {
      const errDetail = await response.text();
      throw new Error(`Error en el servidor: ${errDetail || response.statusText}`);
    }

    // 1. Extraer nombre original de archivo del header content-disposition de forma segura
    const disposition = response.headers.get("content-disposition");
    let filename = "documento-avendia.docx";

    if (disposition && disposition.indexOf("attachment") !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, "");
      }
    }

    // 2. Procesar estrictamente la respuesta como un Blob binario
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // 3. Crear enlace temporal en el DOM
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    link.style.display = "none";
    document.body.appendChild(link);
    
    // Disparar la descarga
    link.click();

    // 4. Limpieza de memoria y eliminación del DOM
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Fallo en la descarga de documento:", error);
    throw error;
  }
}
