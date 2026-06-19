"use client";

import React, { useState, useEffect, useRef } from "react";
import { askEduAsesor } from "@/services/chatService";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  content: string;
  sources?: string[];
  timestamp: string;
}

export default function EduAsesorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      content: "¡Hola! Soy EduAsesor, especialista en normativa escolar. ¿Qué duda administrativa puedo resolverte hoy?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Regla de Control de Calidad 1: Auto-scroll suave
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    }
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userText = message;
    setMessage(""); // Limpiar input inmediatamente para evitar doble enter
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      // Formatear el historial para el API
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        content: m.content,
      }));

      // Llamar al API asíncrona de Gemini
      const data = await askEduAsesor(userText, historyPayload);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        content: data.response,
        sources: data.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "bot",
        content: "Disculpa, en este momento no puedo conectarme con la base de conocimientos. Revisa tu conexión.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-body">
      {/* Ventana de Chat */}
      {isOpen && (
        <div className="w-96 h-[500px] bg-white border border-border-custom rounded-2xl shadow-xl flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Cabecera Morado IA */}
          <header className="bg-morado-ia text-white px-5 py-4 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-headings font-semibold text-sm leading-tight">
                EduAsesor - Asistente Administrativo
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white text-lg font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          </header>

          {/* Área de Mensajes */}
          <div className="flex-1 bg-bg-main p-4 overflow-y-auto flex flex-col gap-4">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div
                  key={msg.id}
                  className={`max-w-[85%] flex flex-col ${isBot ? "self-start" : "self-end"}`}
                >
                  {/* Regla de Control de Calidad 3: whitespace-pre-wrap para saltos de línea */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      isBot
                        ? "bg-white border border-border-custom text-slate-700 rounded-tl-none"
                        : "bg-azul-educativo text-white rounded-tr-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                  
                  {/* Metadatos de Fuentes Legales */}
                  {isBot && msg.sources && msg.sources.length > 0 && (
                    <span className="text-[9px] text-slate-400 mt-1 pl-1 leading-normal italic">
                      Fuentes: {msg.sources.join(", ")}
                    </span>
                  )}
                  <span className={`text-[8px] text-slate-400 mt-0.5 ${isBot ? "pl-1" : "text-right pr-1"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}
            
            {/* Indicador de Carga */}
            {isLoading && (
              <div className="self-start max-w-[85%] bg-white border border-border-custom p-3 rounded-2xl rounded-tl-none text-slate-400 text-xs animate-pulse">
                EduAsesor está consultando las leyes...
              </div>
            )}
            
            {!isAuthenticated && (
              <div className="p-4 bg-morado-ia/5 border border-morado-ia/20 rounded-2xl text-center flex flex-col items-center gap-2 my-2">
                <span className="text-xl">🔒</span>
                <p className="text-xs font-semibold text-slate-700">
                  Por favor, inicia sesión para consultar a EduAsesor.
                </p>
                <a
                  href="/login"
                  className="mt-1 px-4 py-1.5 bg-morado-ia text-white font-headings font-bold text-[10px] rounded-lg transition-colors hover:bg-morado-ia/90 cursor-pointer"
                >
                  Iniciar Sesión
                </a>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input de Envío */}
          {/* Regla de Control de Calidad 2: disabled={isLoading} en inputs y botones */}
          <form onSubmit={handleSend} className="border-t border-border-custom p-3 flex gap-2 bg-white shrink-0">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading || !isAuthenticated}
              placeholder={
                !isAuthenticated
                  ? "Inicia sesión para escribir..."
                  : isLoading
                  ? "EduAsesor está pensando..."
                  : "Escribe tu consulta normativa..."
              }
              className="flex-1 px-4 py-2.5 rounded-xl border border-border-custom bg-bg-main focus:outline-none focus:border-morado-ia text-xs text-slate-800 disabled:opacity-60 transition-colors font-body"
            />
            <button
              type="submit"
              disabled={isLoading || !isAuthenticated || !message.trim()}
              className="px-4 rounded-xl bg-morado-ia hover:bg-morado-ia/90 text-white font-headings font-bold text-xs transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Enviar"
              )}
            </button>
          </form>
        </div>
      )}

      {/* Botón Flotante de Activación */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-morado-ia hover:bg-morado-ia/90 text-white text-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105"
      >
        💬
      </button>
    </div>
  );
}
