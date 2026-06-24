"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BACKEND_URL } from "@/config/api";
import { useUser } from "@/context/UserContext";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

// Esquema de validación con Zod
const profileSchema = z.object({
  first_name: z.string().min(1, "El nombre es obligatorio"),
  last_name: z.string().min(1, "El apellido es obligatorio"),
  phone: z.string().min(6, "El teléfono debe tener al menos 6 caracteres"),
  country: z.string().min(1, "El país es obligatorio"),
  school: z.string().min(1, "El nombre del colegio es obligatorio"),
  educational_level: z.string().min(1, "El nivel educativo es obligatorio"),
  grade: z.string().min(1, "El grado es obligatorio"),
  subject: z.string().min(1, "La asignatura es obligatoria"),
  rag_preferences: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const { user, refreshUser } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inicializar react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      country: "Perú",
      school: "",
      educational_level: "",
      grade: "",
      subject: "",
      rag_preferences: "",
    },
  });

  // Rellenar valores cuando se carga el usuario
  useEffect(() => {
    if (user) {
      // Intentar dividir el nombre completo en nombre y apellido
      const names = (user.full_name || "").trim().split(" ");
      const firstName = names[0] || "";
      const lastName = names.slice(1).join(" ") || "";

      setValue("first_name", firstName);
      setValue("last_name", lastName);
      setValue("phone", user.phone || "");
      setValue("country", user.country || "Perú");
      setValue("school", user.school || "");
      setValue("educational_level", user.educational_level || "");
      setValue("grade", user.grade || "");
      setValue("subject", user.subject || "");
      setValue("rag_preferences", user.rag_preferences || "");
    }
  }, [user, setValue]);

  // Guardar perfil completo en el backend
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const fullNameCombined = `${values.first_name.trim()} ${values.last_name.trim()}`;

      const response = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullNameCombined,
          phone: values.phone,
          country: values.country,
          school: values.school,
          educational_level: values.educational_level,
          grade: values.grade,
          subject: values.subject,
          rag_preferences: values.rag_preferences,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el perfil.");
      }

      // Actualizar el contexto de usuario
      await refreshUser();
      
      setSuccessMsg("¡Perfil actualizado con éxito!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al conectar con el servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = user?.full_name ? user.full_name.charAt(0).toUpperCase() : "D";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 font-body">
      {/* Alertas de Estado */}
      {successMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-750 rounded-2xl text-xs font-bold transition-all duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-650 rounded-2xl text-xs font-bold transition-all duration-300">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── SECCIÓN 1: TUS DATOS ── */}
      <div className="space-y-6">
        <h3 className="font-headings font-black text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          Tus Datos
        </h3>
        
        {/* Fila Foto Avatar */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[#5C1D42] text-white flex items-center justify-center font-headings font-black text-3xl shadow-md shrink-0 select-none">
            {initials}
          </div>
          <button
            type="button"
            className="text-xs font-bold text-[#ff7675] hover:text-[#e55958] transition-colors hover:underline cursor-pointer"
          >
            Cambiar foto
          </button>
        </div>

        {/* Inputs de Datos Personales */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
            <label className="sm:col-span-3 text-xs font-bold text-slate-500 text-left sm:text-right">
              País
            </label>
            <div className="sm:col-span-9">
              <input
                type="text"
                {...register("country")}
                placeholder="Ej. Bolivia"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/20 focus:border-[#7C6CF2] text-xs text-slate-850 transition-all"
              />
              {errors.country && (
                <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.country.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
            <label className="sm:col-span-3 text-xs font-bold text-slate-500 text-left sm:text-right">
              Nombres
            </label>
            <div className="sm:col-span-9">
              <input
                type="text"
                {...register("first_name")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/20 focus:border-[#7C6CF2] text-xs text-slate-850 transition-all"
              />
              {errors.first_name && (
                <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.first_name.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
            <label className="sm:col-span-3 text-xs font-bold text-slate-500 text-left sm:text-right">
              Apellidos
            </label>
            <div className="sm:col-span-9">
              <input
                type="text"
                {...register("last_name")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/20 focus:border-[#7C6CF2] text-xs text-slate-855 transition-all"
              />
              {errors.last_name && (
                <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.last_name.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
            <label className="sm:col-span-3 text-xs font-bold text-slate-500 text-left sm:text-right">
              Teléfono
            </label>
            <div className="sm:col-span-9">
              <input
                type="text"
                {...register("phone")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/20 focus:border-[#7C6CF2] text-xs text-slate-850 transition-all"
              />
              {errors.phone && (
                <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.phone.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
            <label className="sm:col-span-3 text-xs font-bold text-slate-500 text-left sm:text-right">
              Correo electrónico
            </label>
            <div className="sm:col-span-9">
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-xs focus:outline-none cursor-not-allowed font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 2: TU ENSEÑANZA ── */}
      <div className="space-y-6">
        <h3 className="font-headings font-black text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          Tu Enseñanza
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
            <label className="sm:col-span-3 text-xs font-bold text-slate-500 text-left sm:text-right">
              Colegio
            </label>
            <div className="sm:col-span-9">
              <input
                type="text"
                {...register("school")}
                placeholder="Escribe tu nombre"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/20 focus:border-[#7C6CF2] text-xs text-slate-850 transition-all"
              />
              {errors.school && (
                <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.school.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
            <label className="sm:col-span-3 text-xs font-bold text-slate-500 text-left sm:text-right">
              Nivel Educativo
            </label>
            <div className="sm:col-span-9">
              <select
                {...register("educational_level")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/20 focus:border-[#7C6CF2] text-xs text-slate-850 transition-all bg-white"
              >
                <option value="">Selecciona nivel</option>
                <option value="Inicial">Inicial</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
              </select>
              {errors.educational_level && (
                <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.educational_level.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
            <label className="sm:col-span-3 text-xs font-bold text-slate-500 text-left sm:text-right">
              Grado
            </label>
            <div className="sm:col-span-9">
              <select
                {...register("grade")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/20 focus:border-[#7C6CF2] text-xs text-slate-850 transition-all bg-white"
              >
                <option value="">Selecciona grado</option>
                <option value="Primer grado">Primer grado</option>
                <option value="Segundo grado">Segundo grado</option>
                <option value="Tercer grado">Tercer grado</option>
                <option value="Cuarto grado">Cuarto grado</option>
                <option value="Quinto grado">Quinto grado</option>
                <option value="Sexto grado">Sexto grado</option>
              </select>
              {errors.grade && (
                <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.grade.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
            <label className="sm:col-span-3 text-xs font-bold text-slate-500 text-left sm:text-right">
              Asignatura
            </label>
            <div className="sm:col-span-9">
              <input
                type="text"
                {...register("subject")}
                placeholder="Ej. Matemática"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/20 focus:border-[#7C6CF2] text-xs text-slate-850 transition-all"
              />
              {errors.subject && (
                <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.subject.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Botón Intermedio */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#FF7657] hover:bg-[#e66345] text-white font-headings font-bold text-xs rounded-xl shadow-md shadow-[#FF7657]/20 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* ── SECCIÓN 3: PERSONALIZACIÓN RAG ── */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="space-y-1">
          <h3 className="font-headings font-black text-xs text-slate-450 uppercase tracking-widest leading-none">
            Lo que EduAsesor debe recordar
          </h3>
          <p className="text-[10px] font-semibold text-slate-400 font-body">
            EduAsesor lo tendrá en cuenta en todas tus conversaciones y en los materiales que prepare para ti.
          </p>
        </div>

        <div className="space-y-4">
          <textarea
            {...register("rag_preferences")}
            rows={5}
            placeholder="ej. No tengo proyector en mi aula. Mis clases duran 45 minutos. Prefiero actividades cortas y dinámicas."
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/20 focus:border-[#7C6CF2] text-xs text-slate-800 leading-relaxed transition-all placeholder:text-slate-400"
          />

          {/* Botón de Guardar Final */}
          <div className="flex justify-center md:justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full md:w-auto px-10 py-3 bg-[#FF7657] hover:bg-[#e66345] text-white font-headings font-black text-xs uppercase tracking-widest rounded-xl shadow-md shadow-[#FF7657]/30 hover:shadow-lg hover:shadow-[#FF7657]/45 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
              Guardar Todo
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
