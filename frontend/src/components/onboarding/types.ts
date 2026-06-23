import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA DE VALIDACIÓN DE TODO EL WIZARD (ZOD)
// ═══════════════════════════════════════════════════════════════════════════

export const onboardingSchema = z.object({
  // Paso 2: Origen
  source: z.string().min(1, "Por favor, selecciona una opción"),

  // Paso 3: Contexto del Aula
  classroomName: z.string().min(2, "El nombre del aula debe tener al menos 2 caracteres"),
  studentsDescription: z
    .string()
    .min(10, "Por favor, cuéntanos un poco más sobre tus estudiantes (mínimo 10 caracteres)"),

  // Paso 4: Parámetros Curriculares
  educationLevel: z.string().min(1, "Por favor, selecciona el nivel educativo"),
  grades: z.array(z.string()).min(1, "Selecciona al menos un año de escolaridad"),
  term: z.string().min(1, "Por favor, selecciona el trimestre"),

  // Paso 5: Contenidos y Saberes
  knowledgeFields: z.array(z.string()).min(1, "Selecciona al menos un campo de saberes"),
  knowledgeAreas: z.array(z.string()).min(1, "Selecciona al menos un área de saberes"),
  baseContents: z.record(z.string(), z.string()), // Clave: Área, Valor: Contenido Base
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA PARA LOS DROPDOWNS Y SELECCIONES
// ═══════════════════════════════════════════════════════════════════════════

export const SOURCES = [
  "Redes Sociales (Facebook, Instagram, TikTok)",
  "Recomendación de otro Docente / Colega",
  "Búsqueda en Google / Internet",
  "Capacitación o Taller Pedagógico",
  "Publicidad Oficial",
  "Otro medio",
];

export const EDUCATION_LEVELS = [
  "Educación Inicial",
  "Educación Primaria",
  "Educación Secundaria (EBR)",
];

export const GRADES_BY_LEVEL: Record<string, string[]> = {
  "Educación Inicial": ["3 años", "4 años", "5 años"],
  "Educación Primaria": [
    "Primer grado",
    "Segundo grado",
    "Tercer grado",
    "Cuarto grado",
    "Quinto grado",
    "Sexto grado",
  ],
  "Educación Secundaria (EBR)": [
    "Primer año",
    "Segundo año",
    "Tercer año",
    "Cuarto año",
    "Quinto año",
  ],
};

export const TERMS = [
  "Primer Trimestre / Bimestre",
  "Segundo Trimestre / Bimestre",
  "Tercer Trimestre / Bimestre",
  "Cuarto Bimestre",
];

export const KNOWLEDGE_FIELDS = [
  "Comunidad y Sociedad",
  "Ciencia, Tecnología y Producción",
  "Vida Tierra Territorio",
  "Cosmos y Pensamiento",
];

export const AREAS_BY_FIELD: Record<string, string[]> = {
  "Comunidad y Sociedad": [
    "Lengua Castellana y Originaria",
    "Ciencias Sociales",
    "Artes Plásticas y Visuales",
    "Educación Musical",
    "Educación Física y Deportes",
  ],
  "Ciencia, Tecnología y Producción": [
    "Matemática",
    "Técnica Tecnológica General",
    "Técnica Tecnológica Especializada",
  ],
  "Vida Tierra Territorio": [
    "Ciencias Naturales",
    "Biología - Geografía",
    "Física - Química",
  ],
  "Cosmos y Pensamiento": [
    "Cosmovisiones, Filosofía y Psicología",
    "Valores, Espiritualidad y Religiones",
  ],
};

// Contenidos base sugeridos por área para autocompletar el dropdown anidado
export const BASE_CONTENTS_BY_AREA: Record<string, string[]> = {
  "Lengua Castellana y Originaria": [
    "Comprensión lectora y textos argumentativos",
    "La oratoria y la expresión oral formal",
    "Ortografía y redacción de documentos escolares",
  ],
  "Ciencias Sociales": [
    "Historia republicana del Perú y su impacto social",
    "Geografía física, cuencas e impacto climático",
    "Derechos ciudadanos y deberes escolares",
  ],
  "Artes Plásticas y Visuales": [
    "Dibujo técnico y perspectiva geométrica",
    "Pintura y teoría del color aplicada",
    "Artesanías y manualidades locales",
  ],
  "Educación Musical": [
    "Lectura de partituras básicas y ritmos",
    "Canto coral e himnos institucionales",
    "Instrumentos folclóricos de viento y percusión",
  ],
  "Educación Física y Deportes": [
    "Desarrollo motor básico y capacidades físicas",
    "Reglamento y práctica de mini-básquetbol",
    "Hábitos de higiene y alimentación saludable",
  ],
  "Matemática": [
    "Álgebra básica, ecuaciones e inecuaciones de 1er grado",
    "Geometría plana: áreas y perímetros de polígonos",
    "Estadística descriptiva y probabilidades sencillas",
    "Fracciones y números decimales aplicados",
  ],
  "Técnica Tecnológica General": [
    "Introducción a la informática y herramientas de Google",
    "Dibujo técnico asistido por computadora (CAD básico)",
    "Conceptos de robótica y circuitos eléctricos sencillos",
  ],
  "Técnica Tecnológica Especializada": [
    "Desarrollo web con HTML, CSS y JS",
    "Diseño gráfico digital con herramientas de software libre",
    "Contabilidad básica y finanzas para emprendedores",
  ],
  "Ciencias Naturales": [
    "El ciclo del agua y preservación del medio ambiente",
    "Los reinos de la naturaleza y biodiversidad local",
    "El cuerpo humano: sistemas digestivo y respiratorio",
  ],
  "Biología - Geografía": [
    "Genética molecular y leyes de Mendel",
    "Ecología, ecosistemas y desarrollo sustentable",
    "Geología, placas tectónicas y actividad sísmica",
  ],
  "Física - Química": [
    "Leyes de Newton y cinemática en una dimensión",
    "Tabla periódica, enlaces químicos y valencias",
    "Soluciones, mezclas y balanceo de reacciones químicas",
  ],
  "Cosmovisiones, Filosofía y Psicología": [
    "Filosofía andina, amazónica y cosmovisiones locales",
    "Lógica formal y desarrollo del pensamiento crítico",
    "Psicología evolutiva y autoconocimiento en adolescentes",
  ],
  "Valores, Espiritualidad y Religiones": [
    "Ética del vivir bien y valores comunitarios",
    "Festividades espirituales y religiosas del entorno",
    "Diálogo intercultural y de respeto de credos",
  ],
};
