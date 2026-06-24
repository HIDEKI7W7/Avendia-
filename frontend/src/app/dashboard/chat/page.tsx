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
    icon: <BookOpen className="w-5 h-5 text-[#7C6CF2]" />,
    prompt:
      "Quiero crear una unidad de aprendizaje completa con todas sus sesiones de clase. Necesito que me guíes por el proceso paso a paso.",
  },
  {
    id: "pdc",
    title: "Crea tu PDC",
    subtitle: "Un PDC listo con inicio, desarrollo y cierre",
    icon: <FileText className="w-5 h-5 text-[#FF7657]" />,
    prompt:
      "Necesito crear un PDC (Plan de Clase) completo con inicio, desarrollo y cierre estructurados de acuerdo al CNEB.",
  },
  {
    id: "ficha",
    title: "Crea una ficha de trabajo",
    subtitle: "Actividades para que tus estudiantes practiquen",
    icon: <ClipboardList className="w-5 h-5 text-[#4A90E2]" />,
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
    <div className={`flex gap-3.5 ${isUser ? "flex-row-reverse" : "flex-row"} items-start transition-all duration-300`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white text-[10px] font-black shadow-[0_4px_10px_rgba(0,0,0,0.05)] ring-2 ${
          isUser
            ? "bg-gradient-to-tr from-[#FF7657] to-[#FF9B82] ring-[#FF7657]/10"
            : "bg-gradient-to-tr from-[#7C6CF2] to-[#4A90E2] ring-[#7C6CF2]/10"
        }`}
      >
        {isUser ? "Tú" : "AV"}
      </div>

      {/* Burbuja */}
      <div
        className={`max-w-[78%] px-5 py-3.5 rounded-3xl text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-[#7C6CF2] to-[#5A4CE0] text-white rounded-tr-sm shadow-[0_8px_20px_rgba(124,108,242,0.2)]"
            : "bg-white/80 dark:bg-slate-900/80 border border-[#E8EDF3]/60 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-[0_8px_30px_rgba(30,41,59,0.02)] backdrop-blur-md"
        }`}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <span
          className={`block text-[9px] mt-2 font-bold ${
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

  // Check for initial prompt from localStorage (e.g., when planning for a classroom)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const initialPrompt = localStorage.getItem("chat_initial_prompt");
      if (initialPrompt) {
        setInputValue(initialPrompt);
        localStorage.removeItem("chat_initial_prompt");
        // Focus the textarea
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
    }
  }, []);

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

  // Extraer las acciones para mostrarlas en el Bento Grid de forma específica
  const unidadAction = QUICK_ACTIONS.find((a) => a.id === "unidad");
  const pdcAction = QUICK_ACTIONS.find((a) => a.id === "pdc");
  const fichaAction = QUICK_ACTIONS.find((a) => a.id === "ficha");

  // ─── VISTA: CONVERSACIÓN ACTIVA ──────────────────────────────────────────
  if (isChatActive) {
    return (
      <div className="flex flex-col h-full max-h-full relative">
        {/* Header mínimo de conversación activa */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7C6CF2]/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#7C6CF2]" />
            </div>
            <div>
              <p className="font-headings font-black text-sm text-slate-900 dark:text-white leading-none">
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
            className="text-[10px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-slate-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
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
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C6CF2] to-[#4A90E2] flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                AV
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm flex items-center gap-2.5 backdrop-blur-md">
                <Loader2 className="w-3.5 h-3.5 text-[#7C6CF2] animate-spin" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  AVENDIA está pensando...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input de conversación */}
        <div className="shrink-0 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
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
          <p className="text-[10px] font-body text-slate-400 dark:text-slate-500 text-center mt-2 leading-relaxed">
            Puede cometer errores. Tu criterio docente es clave. Revisa y personaliza.
          </p>
        </div>
      </div>
    );
  }

  // ─── VISTA: PANTALLA INICIAL (HERO) ─────────────────────────────────────
  return (
    <div className="w-full h-full flex flex-col justify-center items-stretch py-4 md:py-6 overflow-y-auto select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl w-full mx-auto px-4">
        
        {/* ── COLUMNA IZQUIERDA: BIENVENIDA, MASCOTA Y COMMAND BAR ── */}
        <div className="lg:col-span-7 flex flex-col gap-8 justify-center">
          
          {/* Header Superior y Mascota Integrada */}
          <div className="flex items-start justify-between gap-4">
            
            {/* Saludo & Título con gradiente de texto brillante */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-montserrat font-black text-3xl sm:text-4xl tracking-tight bg-gradient-to-r from-[#4A90E2] to-[#7C6CF2] bg-clip-text text-transparent leading-tight">
                  ¿En qué te ayudo hoy, profe?
                </h1>
                {/* Micro-badge minimalista */}
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black bg-[#7C6CF2]/10 dark:bg-[#7C6CF2]/20 text-[#7C6CF2] border border-[#7C6CF2]/20 dark:border-[#7C6CF2]/30 uppercase tracking-widest align-middle">
                  Beta
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-body max-w-md leading-relaxed mt-1">
                Genera documentos curriculares, planificaciones y material pedagógico en segundos con nuestro motor de IA especializado.
              </p>
            </div>

            {/* Contenedor de la Mascota Interactiva */}
            <div className="relative shrink-0 hidden sm:block">
              {/* Globo de texto dinámico y flotante */}
              <div className="absolute right-full mr-3.5 top-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3.5 py-2 rounded-2xl rounded-tr-none shadow-[0_8px_30px_rgba(124,108,242,0.06)] text-[11px] font-bold text-slate-700 dark:text-slate-300 max-w-[150px] leading-snug animate-pulse whitespace-normal">
                ¡Hola, profe! ¿Listos para planificar hoy? ✨
              </div>
              
              {/* Espacio esférico de la mascota */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#7C6CF2]/15 to-[#4A90E2]/15 flex items-center justify-center border border-white/40 dark:border-slate-800/40 shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <img
                  src="/kawaii_teacher.png"
                  alt="Asistente Avendia"
                  className="w-16 h-16 object-contain hover:scale-115 transition-transform duration-300 ease-out"
                />
              </div>
            </div>
          </div>

          {/* Caja de Entrada Flotante estilo Glassmorphism */}
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
            {/* Micro-copia de Advertencia sutil en la base */}
            <p className="text-[10px] font-body text-slate-400 dark:text-slate-500 text-left pl-3 mt-1 leading-relaxed">
              * Puede cometer errores. Tu criterio docente es clave. Revisa y personaliza.
            </p>
          </div>
        </div>

        {/* ── COLUMNA DERECHA: BENTO GRID ASIMÉTRICO (Shortcuts) ── */}
        <div className="lg:col-span-5 flex flex-col gap-4 justify-center h-full">
          {/* Encabezado de sección */}
          <div className="flex items-center gap-2 mb-1">
            <Settings2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Empieza por aquí
            </span>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Tarjeta 1: Crea tu unidad (Doble de grande - 2 columnas) */}
            {unidadAction && (
              <button
                type="button"
                onClick={() => handleQuickAction(unidadAction.prompt)}
                className="sm:col-span-2 relative overflow-hidden group p-6 rounded-3xl border border-[#E8EDF3] dark:border-slate-800 bg-gradient-to-br from-[#7C6CF2]/5 via-white to-white dark:from-[#7C6CF2]/10 dark:via-slate-900 dark:to-slate-900 hover:border-[#7C6CF2]/40 shadow-sm hover:shadow-[0_20px_40px_rgba(124,108,242,0.06)] hover:-translate-y-1.5 transition-all duration-500 ease-out cursor-pointer text-left flex flex-col justify-between min-h-[145px]"
              >
                {/* Glow decorativo de fondo */}
                <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-[#7C6CF2]/10 blur-2xl group-hover:bg-[#7C6CF2]/20 transition-all duration-500" />
                
                <div className="flex justify-between items-start w-full relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#7C6CF2]/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                    {unidadAction.icon}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#7C6CF2] group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                <div className="mt-5 relative z-10">
                  <h3 className="font-headings font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#7C6CF2] transition-colors leading-tight">
                    {unidadAction.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {unidadAction.subtitle}. Diseña objetivos, competencias y evaluaciones integrales.
                  </p>
                </div>
              </button>
            )}

            {/* Tarjeta 2: Crea tu PDC */}
            {pdcAction && (
              <button
                type="button"
                onClick={() => handleQuickAction(pdcAction.prompt)}
                className="relative overflow-hidden group p-5 rounded-3xl border border-[#E8EDF3] dark:border-slate-800 bg-gradient-to-br from-[#FF7657]/5 via-white to-white dark:from-[#FF7657]/10 dark:via-slate-900 dark:to-slate-900 hover:border-[#FF7657]/40 shadow-sm hover:shadow-[0_20px_40px_rgba(255,118,87,0.06)] hover:-translate-y-1.5 transition-all duration-500 ease-out cursor-pointer text-left flex flex-col justify-between min-h-[135px]"
              >
                <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-[#FF7657]/10 blur-2xl group-hover:bg-[#FF7657]/20 transition-all duration-500" />
                
                <div className="flex justify-between items-start w-full relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-[#FF7657]/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                    {pdcAction.icon}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#FF7657] group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                <div className="mt-4 relative z-10">
                  <h3 className="font-headings font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-[#FF7657] transition-colors leading-tight">
                    {pdcAction.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
                    {pdcAction.subtitle}
                  </p>
                </div>
              </button>
            )}

            {/* Tarjeta 3: Crea una ficha de trabajo */}
            {fichaAction && (
              <button
                type="button"
                onClick={() => handleQuickAction(fichaAction.prompt)}
                className="relative overflow-hidden group p-5 rounded-3xl border border-[#E8EDF3] dark:border-slate-800 bg-gradient-to-br from-[#4A90E2]/5 via-white to-white dark:from-[#4A90E2]/10 dark:via-slate-900 dark:to-slate-900 hover:border-[#4A90E2]/40 shadow-sm hover:shadow-[0_20px_40px_rgba(74,144,226,0.06)] hover:-translate-y-1.5 transition-all duration-500 ease-out cursor-pointer text-left flex flex-col justify-between min-h-[135px]"
              >
                <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-[#4A90E2]/10 blur-2xl group-hover:bg-[#4A90E2]/20 transition-all duration-500" />
                
                <div className="flex justify-between items-start w-full relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-[#4A90E2]/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                    {fichaAction.icon}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#4A90E2] group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                <div className="mt-4 relative z-10">
                  <h3 className="font-headings font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-[#4A90E2] transition-colors leading-tight">
                    {fichaAction.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
                    {fichaAction.subtitle}
                  </p>
                </div>
              </button>
            )}
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
// SUB-COMPONENTE: INPUT BOX INTELIGENTE (reutilizable y estilizado)
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
      className={`w-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border rounded-[2rem] transition-all duration-500 ease-out flex flex-col ${
        isInputFilled
          ? "border-[#7C6CF2] ring-4 ring-[#7C6CF2]/10 shadow-[0_20px_40px_rgba(124,108,242,0.08)]"
          : "border-white/20 dark:border-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-[0_12px_30px_rgba(30,41,59,0.03)] shadow-md"
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
        className="w-full resize-none px-6 pt-5 pb-2 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none font-body leading-relaxed"
        style={{ minHeight: "56px", maxHeight: "180px" }}
      />

      {/* Barra de acciones */}
      <div className="flex items-center justify-between px-4 pb-4 pt-1">
        {/* Acción izquierda: Adjuntar */}
        <button
          type="button"
          onClick={onAttach}
          title="Adjuntar archivo"
          className="w-9 h-9 flex items-center justify-center rounded-2xl bg-slate-100/50 hover:bg-slate-200/60 dark:bg-slate-800/50 dark:hover:bg-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <Paperclip className="w-4.5 h-4.5" />
        </button>

        {/* Acciones derechas: Mic + Send */}
        <div className="flex items-center gap-2">
          {/* Micrófono */}
          <button
            type="button"
            onClick={onMicToggle}
            title={isRecording ? "Detener grabación" : "Dictado por voz"}
            className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer ${
              isRecording
                ? "bg-red-50 text-red-500 hover:bg-red-100 shadow-[0_4px_12px_rgba(239,68,68,0.15)]"
                : "bg-slate-100/50 hover:bg-slate-200/60 dark:bg-slate-800/50 dark:hover:bg-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
            }`}
          >
            {isRecording ? (
              <StopCircle className="w-4.5 h-4.5 animate-pulse" />
            ) : (
              <Mic className="w-4.5 h-4.5" />
            )}
          </button>

          {/* Botón Enviar */}
          <button
            type="button"
            onClick={onSend}
            disabled={!isInputFilled || isLoading}
            title="Enviar mensaje"
            className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-500 ease-out cursor-pointer ${
              isInputFilled && !isLoading
                ? "bg-gradient-to-tr from-[#7C6CF2] to-[#4A90E2] text-white hover:brightness-110 shadow-[0_4px_14px_rgba(124,108,242,0.3)] hover:shadow-[0_6px_20px_rgba(124,108,242,0.45)] active:scale-95 hover:scale-105"
                : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
