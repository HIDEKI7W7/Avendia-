"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Globe, Ticket, ArrowRight } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// DICCIONARIO DE PAÍSES Y PREFIJOS
// ═══════════════════════════════════════════════════════════════════════════
export interface CountryData {
  name: string;
  code: string;
  prefix: string;
  flag: string;
}

export const COUNTRIES: CountryData[] = [
  { name: "Perú", code: "PE", prefix: "+51", flag: "🇵🇪" },
  { name: "Bolivia", code: "BO", prefix: "+591", flag: " BO" },
  { name: "Colombia", code: "CO", prefix: "+57", flag: "🇨🇴" },
  { name: "Ecuador", code: "EC", prefix: "+593", flag: "🇪🇨" },
  { name: "Chile", code: "CL", prefix: "+56", flag: "🇨🇱" },
  { name: "Argentina", code: "AR", prefix: "+54", flag: "🇦🇷" },
  { name: "México", code: "MX", prefix: "+52", flag: "🇲🇽" },
  { name: "España", code: "ES", prefix: "+34", flag: "🇪🇸" },
];

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA DE VALIDACIÓN (ZOD)
// ═══════════════════════════════════════════════════════════════════════════
export const personalDataSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "El nombre completo debe tener al menos 3 caracteres")
      .max(80, "El nombre es demasiado largo"),
    country: z.string().min(1, "Por favor, selecciona tu país"),
    phonePrefix: z.string().min(2, "Prefijo requerido"),
    phoneNumber: z
      .string()
      .regex(/^\d{7,15}$/, "El número debe tener entre 7 y 15 dígitos numéricos"),
    email: z.string().email("Correo electrónico inválido"),
    hasSpecialCode: z.boolean(),
    specialCode: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.hasSpecialCode) {
        return !!data.specialCode && data.specialCode.trim().length > 0;
      }
      return true;
    },
    {
      message: "Por favor, ingresa el código especial",
      path: ["specialCode"],
    }
  );

export type PersonalDataFormValues = z.infer<typeof personalDataSchema>;

interface PersonalDataFormProps {
  email: string;
  onSubmit: (data: PersonalDataFormValues) => void;
  isLoading?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function PersonalDataForm({
  email,
  onSubmit,
  isLoading = false,
}: PersonalDataFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PersonalDataFormValues>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      fullName: "",
      country: "Perú",
      phonePrefix: "+51",
      phoneNumber: "",
      email: email,
      hasSpecialCode: false,
      specialCode: "",
    },
  });

  const selectedCountryName = watch("country");
  const hasSpecialCodeChecked = watch("hasSpecialCode");

  // Actualización automática del prefijo telefónico según el país seleccionado
  useEffect(() => {
    const countryObj = COUNTRIES.find((c) => c.name === selectedCountryName);
    if (countryObj) {
      setValue("phonePrefix", countryObj.prefix);
    }
  }, [selectedCountryName, setValue]);

  // Asegura que el email se actualice si la prop cambia
  useEffect(() => {
    setValue("email", email);
  }, [email, setValue]);

  return (
    <div className="w-full max-w-lg bg-white border border-[#E8EDF3] rounded-2xl shadow-[0_4px_20px_rgba(30,41,59,0.04)] p-8">
      {/* Encabezado del Formulario */}
      <div className="flex flex-col gap-1.5 mb-8">
        <span className="text-[10px] font-bold text-[#7C6CF2] uppercase tracking-widest">
          Paso 2: Registro de Onboarding
        </span>
        <h2 className="font-headings font-bold text-2xl text-slate-900 tracking-tight">
          Datos Personales
        </h2>
        <p className="text-xs text-slate-500 font-body">
          Completa tu información de contacto para personalizar tu experiencia pedagógica.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Campo: Nombre Completo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-headings">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Nombre Completo
          </label>
          <input
            type="text"
            placeholder="Ej. María Teresa Gonzáles"
            {...register("fullName")}
            className={`px-4 py-3 rounded-xl border bg-slate-50/50 text-sm text-slate-800 outline-none focus:bg-white focus:border-[#7C6CF2] transition-all font-body ${
              errors.fullName ? "border-red-300 focus:border-red-500 bg-red-50/10" : "border-[#E8EDF3]"
            }`}
          />
          {errors.fullName && (
            <span className="text-[11px] font-bold text-red-500 pl-1">
              {errors.fullName.message}
            </span>
          )}
        </div>

        {/* Campo: Correo Electrónico (Solo Lectura) */}
        <div className="flex flex-col gap-1.5 opacity-80">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-headings">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            Correo Electrónico
          </label>
          <div className="relative flex items-center">
            <input
              type="email"
              readOnly
              disabled
              {...register("email")}
              className="w-full px-4 py-3 rounded-xl border border-[#E8EDF3] bg-slate-100 text-sm text-slate-500 outline-none cursor-not-allowed font-body"
            />
            <span className="absolute right-4 text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-md">
              PROTEGIDO
            </span>
          </div>
        </div>

        {/* Grupo: País y Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo: Selección de País */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-headings">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              País
            </label>
            <select
              {...register("country")}
              className="px-4 py-3 rounded-xl border border-[#E8EDF3] bg-slate-50/50 text-sm text-slate-800 outline-none focus:bg-white focus:border-[#7C6CF2] transition-all font-body appearance-none cursor-pointer"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name} ({c.prefix})
                </option>
              ))}
            </select>
          </div>

          {/* Campo: Número de Teléfono (con prefijo dinámico) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-headings">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Teléfono Celular
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                {...register("phonePrefix")}
                className="w-16 px-2 py-3 rounded-xl border border-[#E8EDF3] bg-slate-100 text-center text-sm font-bold text-slate-500 outline-none cursor-default font-body"
              />
              <input
                type="tel"
                placeholder="987654321"
                {...register("phoneNumber")}
                className={`flex-1 px-4 py-3 rounded-xl border bg-slate-50/50 text-sm text-slate-800 outline-none focus:bg-white focus:border-[#7C6CF2] transition-all font-body ${
                  errors.phoneNumber ? "border-red-300 focus:border-red-500 bg-red-50/10" : "border-[#E8EDF3]"
                }`}
              />
            </div>
            {errors.phoneNumber && (
              <span className="text-[11px] font-bold text-red-500 pl-1">
                {errors.phoneNumber.message}
              </span>
            )}
          </div>
        </div>

        {/* Checkbox: Código Especial */}
        <div className="flex flex-col gap-3 pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer group select-none">
            <input
              type="checkbox"
              {...register("hasSpecialCode")}
              className="w-4.5 h-4.5 rounded border-slate-300 text-[#7C6CF2] focus:ring-[#7C6CF2] cursor-pointer transition-all accent-[#7C6CF2]"
            />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide group-hover:text-slate-900 transition-colors font-headings">
              Tengo un código especial
            </span>
          </label>

          {/* Campo condicional para código especial */}
          {hasSpecialCodeChecked && (
            <div className="flex flex-col gap-1.5 pl-7 animate-in slide-in-from-top-2 duration-200">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-headings">
                <Ticket className="w-3.5 h-3.5 text-slate-400" />
                Código de Activación / Convenio
              </label>
              <input
                type="text"
                placeholder="Ingresa tu código aquí"
                {...register("specialCode")}
                className={`px-4 py-2.5 rounded-xl border bg-slate-50/50 text-sm text-slate-800 outline-none focus:bg-white focus:border-[#7C6CF2] transition-all font-body ${
                  errors.specialCode ? "border-red-300 focus:border-red-500 bg-red-50/10" : "border-[#E8EDF3]"
                }`}
              />
              {errors.specialCode && (
                <span className="text-[11px] font-bold text-red-500 pl-1">
                  {errors.specialCode.message}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Botón: Continuar (Coral / Salmón) */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-3.5 rounded-xl bg-[#FF7657] hover:bg-[#e86446] active:scale-[0.98] text-white font-headings font-bold text-sm shadow-md shadow-[#FF7657]/15 hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Guardando información...</span>
            </>
          ) : (
            <>
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
