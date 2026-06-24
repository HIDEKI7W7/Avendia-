"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Paperclip,
  Mic,
  Send,
  BookOpen,
  FileText,
  ClipboardList,
  ChevronRight,
  Sparkles,
  Settings2,
  StopCircle,
  Loader2,
} from "lucide-react";
import { askEduAsesor } from "@/services/chatService";

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACES Y TIPOS
// ═══════════════════════════════════════════════════════════════════════════
interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  prompt: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DATOS ESTÁTICOS
// ═══════════════════════════════════════════════════════════════════════════
const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "unidad",
    title: "Crea tu unidad",
    subtitle: "Una unidad de aprendizaje con todas sus clases",
    icon: <BookOpen className="w-4.5 h-4.5 text-[#7C6CF2]" />,
    prompt:
      "Quiero crear una unidad de aprendizaje completa con todas sus sesiones de clase. Necesito que me guíes por el proceso paso a paso.",
  },
  {
    id: "pdc",
    title: "Crea tu PDC",
    subtitle: "Un PDC listo con inicio, desarrollo y cierre",
    icon: <FileText className="w-4.5 h-4.5 text-[#FF7657]" />,
    prompt:
      "Necesito crear un PDC (Plan de Clase) completo con inicio, desarrollo y cierre estructurados de acuerdo al CNEB.",
  },
  {
    id: "ficha",
    title: "Crea una ficha de trabajo",
    subtitle: "Actividades para que tus estudiantes practiquen",
    icon: <ClipboardList className="w-4.5 h-4.5 text-[#4A90E2]" />,
    prompt:
      "Quiero diseñar una ficha de trabajo con actividades prácticas y dinámicas para que mis estudiantes refuercen los aprendizajes.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTE: BURBUJA DE MENSAJE
// ═══════════════════════════════════════════════════════════════════════════
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.sender === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-start transition-all duration-300`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-[10px] font-black shadow-[0_2px_6px_rgba(0,0,0,0.1)] ${
          isUser
            ? "bg-gradient-to-tr from-[#FF7657] to-[#FF9B82]"
            : "bg-gradient-to-tr from-[#7C6CF2] to-[#4A90E2]"
        }`}
      >
        {isUser ? "Tú" : "A"}
      </div>

      {/* Burbuja */}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-[#7C6CF2] text-white rounded-tr-sm shadow-[0_4px_14px_rgba(124,108,242,0.15)]"
            : "bg-white border border-[#E8EDF3] text-slate-800 rounded-tl-sm shadow-[0_4px_12px_rgba(30,41,59,0.02)]"
        }`}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <span
          className={`block text-[9px] mt-1.5 font-bold ${
            isUser ? "text-white/60 text-right" : "text-slate-400"
          }`}
        >
          {msg.timestamp}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — EDUPROMPT ENGINE WORKSPACE
// ═══════════════════════════════════════════════════════════════════════════
export default function ChatWorkspacePage() {
  const [inputValue, setInputValue] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChatActive, setIsChatActive] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
  }, [inputValue]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);
    setIsChatActive(true);

    try {
      const history = messages.map((m) => ({
        sender: m.sender,
        content: m.content,
      }));

      const { response } = await askEduAsesor(text, history);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        content: response,
        timestamp: new Date().toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "bot",
        content:
          "Lo siento, ocurrió un error al conectar con el servidor. Por favor, intenta nuevamente en un momento.",
        timestamp: new Date().toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
    textareaRef.current?.focus();
  };

  const handleMicToggle = () => {
    setIsRecording((prev) => !prev);
    // TODO: conectar API de reconocimiento de voz del navegador
  };

  const isInputFilled = inputValue.trim().length > 0;

  // ─── VISTA: CONVERSACIÓN ACTIVA ──────────────────────────────────────────
  if (isChatActive) {
    return (
      <div className="flex flex-col h-full max-h-full relative">
        {/* Header mínimo de conversación activa */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7C6CF2]/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#7C6CF2]" />
            </div>
            <div>
              <p className="font-headings font-black text-sm text-slate-900 leading-none">
                EduPrompt Engine
              </p>
              <p className="text-[9px] font-bold text-[#7C6CF2] uppercase tracking-wider mt-0.5">
                Conversación activa
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsChatActive(false);
              setMessages([]);
              setInputValue("");
            }}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            Nueva conversación
          </button>
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-1">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {/* Indicador de escritura */}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7C6CF2] to-[#4A90E2] flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                A
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-[#7C6CF2] animate-spin" />
                <span className="text-xs text-slate-500 font-medium">
                  AVENDIA está pensando...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input de conversación */}
        <div className="shrink-0 mt-4 pt-4 border-t border-slate-100">
          <ChatInputBox
            inputValue={inputValue}
            setInputValue={setInputValue}
            textareaRef={textareaRef}
            fileInputRef={fileInputRef}
            isInputFilled={isInputFilled}
            isLoading={isLoading}
            isRecording={isRecording}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            onMicToggle={handleMicToggle}
            onAttach={() => fileInputRef.current?.click()}
          />
          <p className="text-[10px] italic text-slate-400 text-center mt-2 leading-relaxed">
            Puede cometer errores. Tu criterio docente es clave. Revisa y personaliza.
          </p>
        </div>
      </div>
    );
  }

  // ─── VISTA: PANTALLA INICIAL (HERO) ─────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-8">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">

        {/* ── 1. BLOQUE HERO ── */}
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Avatar con badge BETA */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#7C6CF2]/10 flex items-center justify-center shadow-inner">
              <Sparkles className="w-8 h-8 text-[#7C6CF2]" />
            </div>
            {/* Badge BETA flotante */}
            <span className="absolute -top-2 -right-4 bg-[#FF7657]/15 text-[#FF7657] border border-[#FF7657]/25 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
              BETA
            </span>
          </div>

          {/* Título principal */}
          <div className="flex flex-col gap-1.5">
            <h1 className="font-headings font-black text-3xl text-slate-900 tracking-tight leading-tight">
              ¿En qué te ayudo hoy, profe?
            </h1>
            <p className="text-sm text-slate-500 font-body max-w-md leading-relaxed">
              Genera documentos curriculares, planificaciones y material pedagógico
              en segundos con nuestro motor de IA especializado.
            </p>
          </div>
        </div>

        {/* ── 2. INPUT BOX INTELIGENTE ── */}
        <div className="w-full flex flex-col gap-2">
          <ChatInputBox
            inputValue={inputValue}
            setInputValue={setInputValue}
            textareaRef={textareaRef}
            fileInputRef={fileInputRef}
            isInputFilled={isInputFilled}
            isLoading={isLoading}
            isRecording={isRecording}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            onMicToggle={handleMicToggle}
            onAttach={() => fileInputRef.current?.click()}
          />
          <p className="text-xs italic text-slate-400 text-center leading-relaxed">
            Puede cometer errores. Tu criterio docente es clave. Revisa y personaliza.
          </p>
        </div>

        {/* ── 3. SECCIÓN "EMPIEZA POR AQUÍ" ── */}
        <div className="w-full flex flex-col gap-3">
          {/* Encabezado de sección */}
          <div className="flex items-center gap-2">
            <Settings2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Empieza por aquí
            </span>
          </div>

          {/* Tarjetas de acceso rápido agrupadas con bordes divisores */}
          <div className="w-full bg-white border border-[#E8EDF3] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-slate-100">
            {QUICK_ACTIONS.map((action) => (
              <QuickActionCard
                key={action.id}
                action={action}
                onClick={() => handleQuickAction(action.prompt)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={() => {
          /* TODO: handle file upload */
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTE: TARJETA DE ACCESO RÁPIDO
// ═══════════════════════════════════════════════════════════════════════════
interface QuickActionCardProps {
  action: QuickAction;
  onClick: () => void;
}

function QuickActionCard({ action, onClick }: QuickActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-4 text-left group hover:bg-slate-50/40 hover:scale-[1.005] transition-all duration-300 ease-in-out cursor-pointer"
    >
      <div className="flex items-center gap-3.5">
        {/* Ícono envuelto en contenedor */}
        <div className="w-9 h-9 rounded-xl bg-slate-100/70 group-hover:bg-white flex items-center justify-center transition-all duration-300 shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] group-hover:scale-105 group-hover:rotate-2">
          {action.icon}
        </div>

        {/* Texto */}
        <div className="flex flex-col gap-0.5">
          <span className="font-headings font-bold text-sm text-slate-900 group-hover:text-[#7C6CF2] transition-colors leading-tight">
            {action.title}
          </span>
          <span className="text-[11px] text-slate-500 font-body leading-tight">
            {action.subtitle}
          </span>
        </div>
      </div>

      {/* Flecha */}
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#7C6CF2] group-hover:translate-x-1 transition-all duration-300 shrink-0" />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTE: INPUT BOX INTELIGENTE (reutilizable)
// ═══════════════════════════════════════════════════════════════════════════
interface ChatInputBoxProps {
  inputValue: string;
  setInputValue: (v: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isInputFilled: boolean;
  isLoading: boolean;
  isRecording: boolean;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onMicToggle: () => void;
  onAttach: () => void;
}

function ChatInputBox({
  inputValue,
  setInputValue,
  textareaRef,
  isInputFilled,
  isLoading,
  isRecording,
  onSend,
  onKeyDown,
  onMicToggle,
  onAttach,
}: ChatInputBoxProps) {
  return (
    <div
      className={`w-full bg-white border rounded-2xl transition-all duration-300 ease-in-out flex flex-col ${
        isInputFilled
          ? "border-[#7C6CF2] ring-4 ring-[#7C6CF2]/10 shadow-[0_8px_30px_rgba(124,108,242,0.06)]"
          : "border-[#E8EDF3] hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(30,41,59,0.02)] shadow-sm"
      }`}
    >
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Pídeme un PDC, una ficha, un examen..."
        rows={1}
        className="w-full resize-none px-5 pt-4 pb-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none font-body leading-relaxed"
        style={{ minHeight: "52px", maxHeight: "180px" }}
      />

      {/* Barra de acciones */}
      <div className="flex items-center justify-between px-3.5 pb-3 pt-1">
        {/* Acción izquierda: Adjuntar */}
        <button
          type="button"
          onClick={onAttach}
          title="Adjuntar archivo"
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Acciones derechas: Mic + Send */}
        <div className="flex items-center gap-1.5">
          {/* Micrófono */}
          <button
            type="button"
            onClick={onMicToggle}
            title={isRecording ? "Detener grabación" : "Dictado por voz"}
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 active:scale-95 cursor-pointer ${
              isRecording
                ? "bg-red-50 text-red-500 hover:bg-red-100 shadow-[0_2px_8px_rgba(239,68,68,0.15)]"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isRecording ? (
              <StopCircle className="w-4 h-4 animate-pulse" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Botón Enviar */}
          <button
            type="button"
            onClick={onSend}
            disabled={!isInputFilled || isLoading}
            title="Enviar mensaje"
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 ease-in-out cursor-pointer ${
              isInputFilled && !isLoading
                ? "bg-[#7C6CF2] text-white hover:bg-[#6359d1] shadow-[0_4px_12px_rgba(124,108,242,0.25)] hover:shadow-[0_6px_16px_rgba(124,108,242,0.35)] active:scale-95 hover:scale-105"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
