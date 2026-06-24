"use client";

import React, { useEffect, useRef, useState } from "react";
import { Coffee, CheckCircle, X, Sparkles } from "lucide-react";

interface ConfettiProps {
  active: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  d: number;
  color: string;
  tilt: number;
  tiltAngleIncremental: number;
  tiltAngle: number;
}

export default function Confetti({
  active,
  onClose,
  title = "¡Documento Generado Exitosamente!",
  message = "Te acabas de ahorrar un par de horas de trabajo administrativo. Ve por un café ☕",
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showModal, setShowModal] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (active) {
      setShowModal(true);
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas dimensions to window size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Confetti particles configuration
      const particleCount = 150;
      const colors = [
        "#7C6CF2", // Brand Purple
        "#FF7657", // Coral Accent
        "#FFE342", // Amber Gold
        "#4A90E2", // Soft Blue
        "#16A34A", // Emerald Green
        "#E11D48", // Rose Pink
      ];

      const particles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          r: Math.random() * 4 + 4, // size
          d: Math.random() * particleCount, // density
          color: colors[Math.floor(Math.random() * colors.length)],
          tilt: Math.random() * 10 - 5,
          tiltAngleIncremental: Math.random() * 0.07 + 0.02,
          tiltAngle: 0,
        });
      }

      let angle = 0;
      const draw = () => {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        angle += 0.01;

        particles.forEach((p, idx) => {
          p.tiltAngle += p.tiltAngleIncremental;
          p.y += (Math.cos(angle + p.d) + 3 + p.r / 2) / 2;
          p.x += Math.sin(angle);
          p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

          // Drawing particle
          ctx.beginPath();
          ctx.lineWidth = p.r;
          ctx.strokeStyle = p.color;
          ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
          ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
          ctx.stroke();

          // Reset particle when it reaches the bottom
          if (p.y > canvas.height) {
            particles[idx] = {
              ...p,
              x: Math.random() * canvas.width,
              y: -20,
              tilt: Math.random() * 10 - 5,
            };
          }
        });

        animationFrameRef.current = requestAnimationFrame(draw);
      };

      draw();

      const handleResize = () => {
        if (canvas) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
      };

      window.addEventListener("resize", handleResize);

      // Clean up animation and resize listener
      return () => {
        window.removeEventListener("resize", handleResize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } else {
      setShowModal(false);
    }
  }, [active]);

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  if (!active) return null;

  return (
    <>
      {/* Confetti canvas animation */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[100] select-none"
      />

      {/* Success Modal Dialogue */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-body animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C6CF2]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF7657]/5 rounded-full blur-2xl pointer-events-none" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Sparkle decorative */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 shrink-0 shadow-inner rotate-3 hover:rotate-0 transition-transform">
              <CheckCircle className="w-8 h-8" />
            </div>

            <span className="text-[9px] font-headings font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider mb-2.5">
              ¡Felicidades, Listo!
            </span>

            <h3 className="font-headings font-black text-lg text-slate-900 dark:text-white leading-tight tracking-tight mb-2">
              {title}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mb-6">
              {message}
            </p>

            {/* Coffee Invitation action button */}
            <button
              onClick={handleClose}
              className="w-full py-3.5 bg-gradient-to-r from-[#7C6CF2] to-[#FF7657] text-white font-headings font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[#7C6CF2]/20 hover:shadow-xl hover:shadow-[#FF7657]/30 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <Coffee className="w-4 h-4 text-white" />
              <span>Tomar un Café ☕</span>
            </button>

            <span className="text-[8px] text-slate-400 dark:text-slate-500 font-semibold mt-4">
              El archivo .docx se ha descargado a tu dispositivo.
            </span>
          </div>
        </div>
      )}
    </>
  );
}
