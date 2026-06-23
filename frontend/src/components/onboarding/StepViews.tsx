"use client";

import React, { useState } from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Sparkles, Coins, HelpCircle, X, ChevronRight, BookOpen } from "lucide-react";
import {
  OnboardingFormValues,
  SOURCES,
  EDUCATION_LEVELS,
  GRADES_BY_LEVEL,
  TERMS,
  KNOWLEDGE_FIELDS,
  AREAS_BY_FIELD,
  BASE_CONTENTS_BY_AREA,
} from "./types";

interface StepProps {
  register: UseFormRegister<OnboardingFormValues>;
  setValue: UseFormSetValue<OnboardingFormValues>;
  watch: UseFormWatch<OnboardingFormValues>;
  errors: FieldErrors<OnboardingFormValues>;
  onNext: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 1: BIENVENIDA
// ═══════════════════════════════════════════════════════════════════════════
export function StepBienvenida({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center animate-fadeIn font-body">
      {/* Ilustración de Moneda y Regalo */}
      <div className="relative w-28 h-28 flex items-center justify-center bg-amber-50 rounded-full border border-amber-200 shadow-sm mt-4">
        <Coins className="w-14 h-14 text-amber-500 animate-bounce" />
        <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow border border-white">
          ¡REGALO!
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-headings font-extrabold text-3xl text-slate-900 leading-tight">
          ¡Bienvenido a AVENDIA!
        </h3>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
          Planificación Escolar Inteligente con RAG
        </p>
      </div>

      {/* Caja de créditos destacados */}
      <div className="bg-amber-500/10 border border-amber-200/50 rounded-2xl p-5 max-w-sm flex items-center gap-4 text-left">
        <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white text-xl shrink-0 shadow shadow-amber-500/20">
          🪙
        </div>
        <div>
          <p className="font-headings font-extrabold text-base text-amber-800 leading-tight">
            ¡Empiezas con 7 Créditos de IA!
          </p>
          <p className="text-[11px] text-amber-700/80 font-medium mt-1 leading-normal">
            Equivale a 7 documentos curriculares completos (unidades, planes o sesiones) que se renovarán automáticamente cada lunes de manera gratuita.
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-500 max-w-sm leading-relaxed mt-2">
        Para comenzar, configuraremos los parámetros básicos de tu aula de clases. De esta forma, nuestra Inteligencia Artificial podrá generar contenidos exactamente a tu medida.
      </p>

      <button
        onClick={onNext}
        className="w-full mt-4 py-3.5 rounded-xl bg-[#FF7675] hover:bg-[#e66867] active:scale-[0.98] text-white font-headings font-bold text-sm shadow-md shadow-[#FF7675]/15 hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>¡Comenzar!</span>
        <ChevronRight className="w-4.5 h-4.5" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 2: ENCUESTA DE ORIGEN
// ═══════════════════════════════════════════════════════════════════════════
export function StepOrigen({ register, watch, onNext }: StepProps) {
  const selectedSource = watch("source");

  // Habilitado solo si el usuario selecciona algo del dropdown
  const isValid = selectedSource && selectedSource.trim().length > 0;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn font-body">
      <div className="text-center flex flex-col gap-1.5">
        <h3 className="font-headings font-extrabold text-xl text-slate-900 leading-tight">
          ¿Primero, cómo supiste de nosotros?
        </h3>
        <p className="text-xs text-slate-500 font-body">
          Queremos entender cómo llegó AVENDIA a tus manos para seguir mejorando.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-headings">
          ¿Cómo llegaste a AVENDIA?
        </label>
        <select
          {...register("source")}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none focus:bg-white focus:border-[#7C6CF2] transition-all font-body appearance-none cursor-pointer"
        >
          <option value="">Escoge una opción...</option>
          {SOURCES.map((src) => (
            <option key={src} value={src}>
              {src}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className={`w-full mt-4 py-3.5 rounded-xl font-headings font-bold text-sm shadow-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
          isValid
            ? "bg-[#FF7675] hover:bg-[#e66867] active:scale-[0.98] text-white shadow-[#FF7675]/15"
            : "bg-[#FF7675]/40 text-white cursor-not-allowed shadow-none"
        }`}
      >
        <span>Continuar</span>
        <ChevronRight className="w-4.5 h-4.5" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 3: CONTEXTO DEL AULA
// ═══════════════════════════════════════════════════════════════════════════
export function StepAula({ register, setValue, watch, errors, onNext }: StepProps) {
  const classroomNameVal = watch("classroomName");
  const studentsDescriptionVal = watch("studentsDescription");

  // Autocompletar con un ejemplo pedagógico simulado
  const handleUseExample = () => {
    setValue("classroomName", "5to A - Primaria");
    setValue(
      "studentsDescription",
      "Tengo 28 niños en total de 10 años. Contamos con 3 estudiantes con TDAH y 1 estudiante con discapacidad auditiva leve. Son muy participativos e interesados en proyectos de ciencias ambientales, robótica casera y dinámicas deportivas."
    );
  };

  const isFormValid =
    (classroomNameVal || "").trim().length >= 2 && (studentsDescriptionVal || "").trim().length >= 10;

  return (
    <div className="flex flex-col gap-5 animate-fadeIn font-body">
      <div className="text-center flex flex-col gap-1.5">
        <h3 className="font-headings font-extrabold text-xl text-slate-900 leading-tight">
          Contexto del Aula
        </h3>
        <p className="text-xs text-slate-500 font-body">
          Cuéntanos sobre tu salón de clases para adaptar el vocabulario y las dinámicas curriculares.
        </p>
      </div>

      {/* Nombre del Aula */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-headings">
          ¿Cómo se llama tu aula?
        </label>
        <input
          type="text"
          placeholder="Ej: 5to A, Sala Azul, 3er Grado"
          {...register("classroomName")}
          className={`px-4 py-3 rounded-xl border bg-slate-50/50 text-sm text-slate-800 outline-none transition-all font-body focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 ${
            errors.classroomName ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
          }`}
        />
        {errors.classroomName && (
          <span className="text-[11px] font-bold text-red-500">{errors.classroomName.message}</span>
        )}
      </div>

      {/* Descripción de Estudiantes */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-headings">
            Cuéntanos sobre tus estudiantes
          </label>
          <button
            type="button"
            onClick={handleUseExample}
            className="flex items-center gap-1 text-[10px] font-bold text-[#7C6CF2] hover:text-[#5c4ee0] border border-[#7C6CF2]/20 hover:border-[#7C6CF2]/50 bg-violet-50/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            Usar ejemplo
          </button>
        </div>

        <textarea
          rows={4}
          placeholder="Ej. Mi grupo de estudiantes es muy activo..."
          {...register("studentsDescription")}
          className={`px-4 py-3 rounded-xl border bg-slate-50/50 text-sm text-slate-800 outline-none transition-all font-body focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 ${
            errors.studentsDescription ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
          }`}
        />
        <div className="flex gap-1.5 items-start mt-1 text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed">
            Menciona la cantidad de estudiantes, sus edades promedio, intereses principales y si hay necesidades educativas especiales (NEE) o contextos particulares.
          </p>
        </div>
        {errors.studentsDescription && (
          <span className="text-[11px] font-bold text-red-500">
            {errors.studentsDescription.message}
          </span>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!isFormValid}
        className={`w-full mt-4 py-3.5 rounded-xl font-headings font-bold text-sm shadow-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
          isFormValid
            ? "bg-[#FF7675] hover:bg-[#e66867] active:scale-[0.98] text-white shadow-[#FF7675]/15"
            : "bg-[#FF7675]/40 text-white cursor-not-allowed shadow-none"
        }`}
      >
        <span>Continuar</span>
        <ChevronRight className="w-4.5 h-4.5" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 4: PARÁMETROS CURRICULARES INICIALES
// ═══════════════════════════════════════════════════════════════════════════
export function StepCurriculo({ register, setValue, watch, onNext }: StepProps) {
  const selectedLevel = watch("educationLevel");
  const selectedGrades = watch("grades") || [];
  const selectedTerm = watch("term");

  const gradesList = selectedLevel ? GRADES_BY_LEVEL[selectedLevel] || [] : [];

  // Agregar grado a la lista multiselección
  const handleAddGrade = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val && !selectedGrades.includes(val)) {
      setValue("grades", [...selectedGrades, val], { shouldValidate: true });
    }
    e.target.value = ""; // Reset
  };

  // Quitar grado de la lista
  const handleRemoveGrade = (grade: string) => {
    setValue(
      "grades",
      selectedGrades.filter((g) => g !== grade),
      { shouldValidate: true }
    );
  };

  const isFormValid =
    selectedLevel.length > 0 && selectedGrades.length > 0 && selectedTerm.length > 0;

  return (
    <div className="flex flex-col gap-5 animate-fadeIn font-body">
      <div className="text-center flex flex-col gap-1.5">
        <h3 className="font-headings font-extrabold text-xl text-slate-900 leading-tight">
          Parámetros Curriculares
        </h3>
        <p className="text-xs text-slate-500 font-body">
          Define el nivel pedagógico básico y la temporalidad del año académico.
        </p>
      </div>

      {/* 1. Nivel Educativo */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-headings">
          Nivel educativo
        </label>
        <select
          {...register("educationLevel")}
          onChange={(e) => {
            register("educationLevel").onChange(e);
            setValue("grades", []); // Resetear grados al cambiar nivel
          }}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none transition-all font-body cursor-pointer focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        >
          <option value="">Selecciona el nivel...</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Año de Escolaridad (Multi-selección) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-headings">
          Año de escolaridad
        </label>
        <select
          disabled={!selectedLevel}
          onChange={handleAddGrade}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none transition-all font-body cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        >
          <option value="">
            {!selectedLevel ? "Primero escoge nivel..." : "Añadir año/grado..."}
          </option>
          {gradesList.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>

        {/* Renderizado de Badges/Tags */}
        {selectedGrades.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedGrades.map((g) => (
              <span
                key={g}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#7C6CF2]/10 text-[#7C6CF2] border border-[#7C6CF2]/20 rounded-full text-[11px] font-bold animate-in zoom-in-95 duration-100"
              >
                {g}
                <button
                  type="button"
                  onClick={() => handleRemoveGrade(g)}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#7C6CF2] hover:text-white transition-colors ml-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Trimestre / Bimestre */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-headings">
          Trimestre / Bimestre
        </label>
        <select
          {...register("term")}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none transition-all font-body cursor-pointer focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        >
          <option value="">Selecciona el trimestre...</option>
          {TERMS.map((term) => (
            <option key={term} value={term}>
              {term}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onNext}
        disabled={!isFormValid}
        className={`w-full mt-4 py-3.5 rounded-xl font-headings font-bold text-sm shadow-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
          isFormValid
            ? "bg-[#FF7675] hover:bg-[#e66867] active:scale-[0.98] text-white shadow-[#FF7675]/15"
            : "bg-[#FF7675]/40 text-white cursor-not-allowed shadow-none"
        }`}
      >
        <span>Siguiente</span>
        <ChevronRight className="w-4.5 h-4.5" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 5: CONTENIDOS Y SABERES PROFUNDOS
// ═══════════════════════════════════════════════════════════════════════════
export function StepSaberes({ register, setValue, watch, onNext }: StepProps) {
  const selectedFields = watch("knowledgeFields") || [];
  const selectedAreas = watch("knowledgeAreas") || [];
  const baseContentsObj = watch("baseContents") || {};

  // Listado de áreas filtradas pertenecientes a los campos seleccionados y que no estén seleccionadas ya
  const areasList = Array.from(
    new Set(selectedFields.flatMap((field) => AREAS_BY_FIELD[field] || []))
  ).filter((area) => !selectedAreas.includes(area));

  // Agregar Campo
  const handleAddField = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val && !selectedFields.includes(val)) {
      setValue("knowledgeFields", [...selectedFields, val], { shouldValidate: true });
    }
    e.target.value = ""; // Reset select
  };

  // Quitar Campo
  const handleRemoveField = (field: string) => {
    const newFields = selectedFields.filter((f) => f !== field);
    setValue("knowledgeFields", newFields, { shouldValidate: true });

    // Eliminación en cascada de áreas que pertenecen al campo eliminado
    const remainingAreasSet = new Set(newFields.flatMap((f) => AREAS_BY_FIELD[f] || []));
    const newAreas = selectedAreas.filter((area) => remainingAreasSet.has(area));
    setValue("knowledgeAreas", newAreas, { shouldValidate: true });

    // Actualizar contenidos base eliminando áreas huérfanas
    const newContents = { ...baseContentsObj };
    Object.keys(newContents).forEach((area) => {
      if (!remainingAreasSet.has(area)) {
        delete newContents[area];
      }
    });
    setValue("baseContents", newContents);
  };

  // Agregar Área
  const handleAddArea = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val && !selectedAreas.includes(val)) {
      setValue("knowledgeAreas", [...selectedAreas, val], { shouldValidate: true });
      // Seteamos un contenido base inicial por defecto
      const contentsList = BASE_CONTENTS_BY_AREA[val] || [];
      if (contentsList.length > 0) {
        setValue(`baseContents.${val}`, contentsList[0], { shouldValidate: true });
      }
    }
    e.target.value = "";
  };

  // Quitar Área
  const handleRemoveArea = (area: string) => {
    setValue(
      "knowledgeAreas",
      selectedAreas.filter((a) => a !== area),
      { shouldValidate: true }
    );
    const newContents = { ...baseContentsObj };
    delete newContents[area];
    setValue("baseContents", newContents);
  };

  const handleBaseContentChange = (area: string, val: string) => {
    setValue(`baseContents.${area}`, val, { shouldValidate: true });
  };

  const isFormValid =
    selectedFields.length > 0 &&
    selectedAreas.length > 0 &&
    selectedAreas.every((area) => !!baseContentsObj[area]);

  return (
    <div className="flex flex-col gap-5 animate-fadeIn font-body max-h-[500px] overflow-y-auto pr-1.5 scrollbar-thin">
      <div className="text-center flex flex-col gap-1.5">
        <h3 className="font-headings font-extrabold text-xl text-slate-900 leading-tight">
          Contenidos y Saberes Profundos
        </h3>
        <p className="text-xs text-slate-500 font-body">
          Define los saberes específicos que estructurarán tus planes curriculares.
        </p>
      </div>

      {/* 1. Campo de Saberes (Multi-selección) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-headings">
          Campo de saberes y conocimientos
        </label>
        <select
          onChange={handleAddField}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none transition-all font-body cursor-pointer focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        >
          <option value="">Añadir campo de saberes...</option>
          {KNOWLEDGE_FIELDS.filter((f) => !selectedFields.includes(f)).map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>

        {/* Badges de Campos */}
        {selectedFields.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedFields.map((field) => (
              <span
                key={field}
                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100/60 text-amber-800 border border-amber-200/50 rounded-full text-[11px] font-bold animate-in zoom-in-95 duration-100"
              >
                {field}
                <button
                  type="button"
                  onClick={() => handleRemoveField(field)}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors ml-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. Áreas de Saberes (Multi-selección) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-headings">
          Áreas de saberes y conocimientos
        </label>
        <select
          disabled={selectedFields.length === 0}
          onChange={handleAddArea}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none transition-all font-body cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        >
          <option value="">
            {selectedFields.length === 0 ? "Primero escoge un campo..." : "Añadir área de saberes..."}
          </option>
          {areasList.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>

        {/* Badges de Áreas */}
        {selectedAreas.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100/60 text-[#7C6CF2] border border-[#7C6CF2]/20 rounded-full text-[11px] font-bold animate-in zoom-in-95 duration-100"
              >
                {area}
                <button
                  type="button"
                  onClick={() => handleRemoveArea(area)}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#7C6CF2] hover:text-white transition-colors ml-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. UI Condicional Dinámica: Contenido Base por Área Seleccionada */}
      {selectedAreas.length > 0 && (
        <div className="flex flex-col gap-4 mt-2 border-t border-slate-100 pt-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            Estructuración Temática por Área
          </span>

          {selectedAreas.map((area) => {
            const contentsList = BASE_CONTENTS_BY_AREA[area] || [];
            return (
              <div
                key={area}
                className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    {area}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Contenidos base
                  </label>
                  <select
                    value={baseContentsObj[area] || ""}
                    onChange={(e) => handleBaseContentChange(area, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-blue-200/50 bg-white text-xs text-slate-700 outline-none focus:border-[#7C6CF2] transition-all cursor-pointer font-body"
                  >
                    {contentsList.map((content) => (
                      <option key={content} value={content}>
                        {content}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!isFormValid}
        className={`w-full mt-4 py-3.5 rounded-xl font-headings font-bold text-sm shadow-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
          isFormValid
            ? "bg-[#FF7675] hover:bg-[#e66867] active:scale-[0.98] text-white shadow-[#FF7675]/15"
            : "bg-[#FF7675]/40 text-white cursor-not-allowed shadow-none"
        }`}
      >
        <span>Finalizar y Crear Workspace</span>
        <ChevronRight className="w-4.5 h-4.5" />
      </button>
    </div>
  );
}
