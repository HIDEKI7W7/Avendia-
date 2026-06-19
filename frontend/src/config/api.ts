export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Interceptar solicitudes fetch al vuelo para deshabilitar la pantalla de advertencia de Pinggy
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const urlString = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    
    if (urlString && urlString.includes("pinggy")) {
      init = init || {};
      const headers = new Headers(init.headers || {});
      headers.set("X-Pinggy-No-Screen", "true");
      init.headers = headers;
    }
    return originalFetch(input, init);
  };
}
