import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildWorkflowDocxBlob } from "./exportWorkflowDocx";
import { buildSessionDocx } from "./docx/buildSessionDocx";
import { readSessionContent } from "./docx/sessionContent";

const SCALE = "Lo logró / En proceso / Necesita ayuda";

/** Artefacto con la misma estructura que devuelve la IA para la sesión (7 matrices + secciones). */
export function sessionArtifactSample(): StructuredArtifact {
  return {
    document_title: "Sesión de Aprendizaje N° 04: Fenómeno El Niño: ¿cómo nos afecta y cómo nos preparamos?",
    executive_summary:
      "Sesión de 90 minutos para segundo grado de primaria en Personal Social. Los estudiantes reconocen cómo el Fenómeno del Niño afecta su zona urbano marginal y proponen acciones de cuidado familiar y comunitario.",
    sections: [
      {
        title: "Necesidades de aprendizaje",
        narrative: "Para resolver el reto, los estudiantes necesitan movilizar las siguientes capacidades:",
        key_points: [
          "Identificar las características principales del Fenómeno del Niño.",
          "Describir cómo el Fenómeno del Niño afecta la vida en la zona urbano marginal.",
          "Proponer acciones de prevención y cuidado ante sus efectos.",
          "Dibujar y explicar las consecuencias observadas en su comunidad.",
        ],
      },
      {
        title: "DUA según contexto",
        narrative:
          "Considerando el contexto del aula (colegio urbano marginal), el Diseño Universal del Aprendizaje orienta esta sesión. Se ofrecen múltiples formas de representación (visual, auditiva, escrita) y de expresión (oral, gráfica, manipulativa). Se ajustan apoyos, ritmos, tiempos y agrupamientos según las características de los estudiantes.",
        key_points: ["Láminas y fotografías del barrio para los estudiantes que aprenden mejor con imágenes.", "Opción de responder de forma oral o con dibujos en la ficha."],
      },
      {
        title: "Trabajo entre pares",
        narrative:
          "El trabajo entre pares se evidencia cuando los estudiantes interactúan de manera colaborativa para movilizar capacidades y resolver el reto propuesto, intercambiando estrategias, confrontando ideas y retroalimentándose mutuamente.",
        key_points: ["Parejas heterogéneas para la lectura de la teoría.", "Grupos de cuatro para el organizador visual."],
      },
      {
        title: "Evaluación y retroalimentación",
        narrative:
          "La evaluación es formativa y se realiza durante toda la sesión mediante la guía de observación. La retroalimentación es descriptiva: el docente señala lo logrado, formula una pregunta que ayude a mejorar y acuerda con el estudiante el siguiente paso.",
        key_points: ["Retroalimentación oral inmediata durante el trabajo en parejas.", "Devolución escrita breve en el organizador visual."],
      },
      {
        title: "Teoría del tema: introducción y conceptos clave",
        narrative:
          "El estudio del Fenómeno del Niño es fundamental para comprender cómo los cambios en el clima afectan nuestra vida diaria, especialmente en zonas como la nuestra. Este fenómeno impacta en nuestras familias, en el trabajo de nuestros padres, en la agricultura y en la pesca.\nEl Fenómeno del Niño se refiere a un patrón climático recurrente que ocurre en el océano Pacífico tropical, cerca del Ecuador. Se caracteriza por un calentamiento inusual de la superficie del mar. Este calentamiento provoca cambios en los patrones del viento y las lluvias a nivel mundial. Su contraparte, cuando las aguas se enfrían más de lo normal, se denomina Fenómeno de la Niña.",
        key_points: ["Calentamiento inusual del mar Pacífico ecuatorial.", "Forma parte del ciclo ENOS (El Niño-Oscilación del Sur).", "Puede traer sequías o inundaciones."],
      },
      {
        title: "Teoría del tema: características y procedimientos",
        narrative:
          "Características principales:\n- Calentamiento del mar: aumento de la temperatura del agua en el Pacífico ecuatorial.\n- Cambio en los vientos: los vientos alisios se debilitan o invierten su dirección.\n- Alteración de las lluvias: sequías en algunas regiones y lluvias intensas en otras; en la costa peruana suele traer más precipitaciones.\n- Ciclo irregular: puede presentarse cada dos a siete años.\nPara comprender el fenómeno seguimos un proceso de indagación: observamos los cambios en nuestro entorno, los conectamos con la información sobre el clima, buscamos explicaciones y analizamos cómo afectan a nuestra comunidad.",
        key_points: ["Observar → conectar → explicar → analizar → proponer."],
      },
      {
        title: "Teoría del tema: ejemplos aplicados al contexto",
        narrative:
          "1. Lluvias intensas y riesgo de huaicos: si el río cercano al asentamiento crece, puede desbordarse; las laderas con tierra suelta pueden formar huaicos. Los vecinos organizados identifican zonas de riesgo y preparan mochilas de emergencia.\n2. Impacto en la agricultura familiar: la sequía seca el maíz y el camote; las lluvias excesivas pudren las raíces. Conviene elegir cultivos resistentes y recolectar agua de lluvia.\n3. Cambios en la pesca artesanal: el agua caliente hace que los peces habituales desaparezcan o aparezcan otros; los pescadores exploran nuevas zonas con precaución.",
        key_points: ["Los ejemplos parten de la vida diaria del barrio."],
      },
      {
        title: "Ideas fuerza",
        narrative: "Síntesis para recordar:",
        key_points: [
          "El Fenómeno del Niño es un calentamiento del mar Pacífico que altera el clima global.",
          "Provoca cambios en vientos y lluvias, causando sequías o inundaciones.",
          "Afecta directamente actividades como la agricultura y la pesca en nuestra comunidad.",
        ],
      },
    ],
    teacher_recommendations: [
      "Verificar que los ejemplos correspondan a la realidad del barrio antes de imprimir.",
      "Ajustar los tiempos del desarrollo según la participación del grupo.",
      "Coordinar con las familias la mochila de emergencia como tarea de extensión.",
    ],
    tables: [
      {
        title: "Secuencia didáctica",
        columns: ["Momento", "Tiempo", "Acciones del docente", "Acciones del estudiante", "Evidencia y retroalimentación"],
        rows: [
          [
            "Inicio",
            "15 min",
            "Motivación: Niños y niñas, ¿alguna vez han notado que el clima en nuestra ciudad cambia mucho? A veces llueve muy fuerte por días y luego hace mucho sol.\nSaberes previos: ¿Recuerdan haber escuchado a sus papás o abuelos hablar sobre El Niño cuando el clima cambia?\nConflicto cognitivo: Si llueve mucho, ¿cómo afecta esto a las casas de nuestro barrio? Si hay sequía, ¿cómo afecta a las plantas y animales cercanos al colegio?\nPropósito: Hoy aprenderemos cómo el Fenómeno del Niño afecta nuestra comunidad y qué podemos hacer para prepararnos.",
            "Responden en lluvia de ideas, comparten recuerdos familiares y formulan hipótesis.",
            "Ideas previas registradas en la pizarra; retroalimentación oral inmediata.",
          ],
          [
            "Desarrollo",
            "60 min",
            "Metodología activa: proceso didáctico del área aplicado paso a paso con los estudiantes como protagonistas.\nProblematización: Nuestro barrio se ve afectado por lluvias o sequías. ¿Cómo nos impacta el Fenómeno del Niño y qué podemos hacer para cuidarnos mejor?\nAnálisis de información: Leen en parejas la teoría de la sesión (Características y Ejemplos) para identificar dos efectos comunes en el barrio y los comparten con la clase.\nPausa activa: De pie, estiran los brazos hacia arriba, se doblan hacia adelante y respiran hondo tres veces.\nToma de decisiones: Acuerdan dos acciones concretas para prepararse en familia o comunidad y las anotan en papelotes.",
            "Leen en parejas, subrayan, dialogan, elaboran el organizador visual y presentan sus acuerdos.",
            "Organizador visual y papelotes con acuerdos; retroalimentación descriptiva por grupo.",
          ],
          [
            "Cierre",
            "15 min",
            "Evaluación formativa: ¿Qué aprendimos hoy sobre el Fenómeno del Niño y cómo nos afecta en nuestra zona?\nMetacognición: ¿Qué fue lo que más les llamó la atención? ¿Qué ideas se llevan para compartir con sus familias?",
            "Responden, completan la autoevaluación de la ficha y asumen un compromiso familiar.",
            "Ficha de trabajo resuelta; ticket de salida oral.",
          ],
        ],
        note: "La suma de tiempos corresponde a los 90 minutos declarados.",
      },
      {
        title: "Propósitos de aprendizaje",
        columns: ["Competencia y capacidades", "Desempeños del grado", "Criterios de evaluación"],
        rows: [
          [
            "Construye su identidad\n• Se valora a sí mismo\n• Autorregula sus emociones\n• Reflexiona y argumenta éticamente\n• Vive su sexualidad de manera integral y responsable de acuerdo a su etapa de desarrollo y madurez",
            "Explica cómo el Fenómeno del Niño afecta su entorno familiar y comunal, reconociendo sus causas y consecuencias.",
            "• Reconoce el impacto del fenómeno en su vida cotidiana.\n• Identifica cambios causados por el fenómeno en su comunidad.\n• Menciona cómo el fenómeno altera actividades familiares o laborales.",
          ],
          ["Convive y participa democráticamente en la búsqueda del bien común\n• Interactúa con todas las personas", "Participa en acciones colectivas de cuidado del entorno.", "• Colabora en la elaboración de acuerdos grupales."],
        ],
        note: "",
      },
      {
        title: "Alineamiento pedagógico",
        columns: ["Propósito", "Reto y situación significativa", "Evidencia", "Producto", "Estándar del ciclo"],
        rows: [
          [
            "¿Qué? Aprenderemos sobre los efectos del Fenómeno del Niño en nuestra comunidad.\n¿Cómo? Dialogando sobre cómo nos afecta y elaborando un organizador visual.\n¿Para qué? Para comprender mejor estos cambios y preparar nuestro entorno.",
            "Vivimos en una zona urbano marginal donde las lluvias intensas o la ausencia de ellas afectan nuestras calles y viviendas. ¿Cómo podemos entender este fenómeno y prepararnos para cuidarnos mejor?",
            "Elabora un dibujo explicando cómo el Fenómeno del Niño afecta a su familia y qué medidas de cuidado pueden tomar.",
            "Organizador visual sobre el Fenómeno del Niño y sus consecuencias.",
            "Construye su identidad al tomar conciencia de los aspectos que lo hacen único, cuando se reconoce a sí mismo a partir de sus características físicas, cualidades, habilidades, intereses y logros y valora su pertenencia familiar y escolar. Distingue sus diversas emociones y comportamientos, menciona las causas y las consecuencias de estos y las regula usando estrategias diversas.",
          ],
        ],
        note: "",
      },
      {
        title: "Enfoques transversales",
        columns: ["Enfoque transversal", "Valor", "Actitud observable"],
        rows: [
          ["Enfoque ambiental", "Respeto a toda forma de vida", "Reconoce las ideas y aportes de sus compañeros sobre el cuidado del entorno, mostrando interés en aprender de ellos."],
          ["Enfoque de orientación al bien común", "Solidaridad y preocupación por los demás", "Colabora con sus compañeros en la resolución de problemas grupales, ofreciendo ayuda a quienes lo necesitan."],
        ],
        note: "",
      },
      {
        title: "Competencias transversales",
        columns: ["Competencia transversal", "Capacidades", "Estándar", "Desempeño", "Criterio"],
        rows: [
          ["Se desenvuelve en entornos virtuales generados por las TIC", "Personaliza entornos virtuales\nGestiona información del entorno virtual", "Elabora material digital (presentaciones, videos, documentos) comparando y seleccionando distintas actividades según sus necesidades.", "Modifica un entorno virtual personalizado cuando clasifica aplicaciones y herramientas de navegación.", "Busca imágenes del fenómeno en el entorno virtual con ayuda del docente."],
          ["Gestiona su aprendizaje de manera autónoma", "Define metas de aprendizaje\nMonitorea y ajusta su desempeño", "Comprende que debe organizarse lo más específicamente posible y que lo planteado incluya más de una estrategia.", "Determina metas de aprendizaje viables, asociadas a sus necesidades y prioridades.", "Revisa su organizador con la lista de la autoevaluación."],
        ],
        note: "",
      },
      {
        title: "Instrumento de evaluación",
        columns: ["N°", "Criterio observable", "Evidencia", "Escala"],
        rows: [
          ["1", "Reconoce el impacto del fenómeno en su vida cotidiana.", "Participación en el diálogo", SCALE],
          ["2", "Identifica cambios causados por el fenómeno en su comunidad.", "Organizador visual", SCALE],
          ["3", "Menciona cómo el fenómeno altera actividades familiares o laborales.", "Ficha de trabajo", SCALE],
        ],
        note: "",
      },
      {
        title: "Ficha de trabajo",
        columns: ["N°", "Consigna", "Tipo de respuesta", "Opciones o respuesta esperada"],
        rows: [
          ["1", "¿Qué es principalmente el Fenómeno del Niño?", "Opción múltiple", "Un frío intenso en el mar | Un calentamiento inusual del mar Pacífico | Un viento muy fuerte que solo sopla en Perú | Una lluvia que solo dura un día"],
          ["2", "El Fenómeno del Niño siempre ocurre en los mismos años y de la misma manera.", "Verdadero o falso", "Falso"],
          ["3", "Cuando el Fenómeno del Niño causa lluvias muy fuertes en la sierra, puede provocar ____ que bajan con fuerza por las laderas.", "Completar", "huaicos"],
          ["4", "¿Cómo afecta el Fenómeno del Niño al mar para la pesca?", "Desarrollo", "El agua caliente hace que los peces habituales se alejen y aparezcan otras especies."],
          ["5", "¿Qué significa que el Fenómeno del Niño tenga impacto global?", "Opción múltiple", "Que solo afecta a Perú | Que solo afecta al mar | Que puede influir en el clima de otros países lejanos | Que solo afecta a las plantas"],
          ["6", "Dibuja una acción que tu familia puede hacer para prepararse ante lluvias intensas.", "Dibujo", "Dibujo con una medida de prevención (limpiar desagües, mochila de emergencia)."],
        ],
        note: "",
      },
      {
        title: "Mapa mental",
        columns: ["Rama", "Ideas clave"],
        rows: [
          ["¿Qué es?", "Calentamiento del mar Pacífico; ciclo ENOS; ocurre cada 2 a 7 años"],
          ["Causas", "Vientos alisios débiles; agua caliente se acumula frente a Sudamérica"],
          ["Consecuencias", "Lluvias intensas en la costa; sequías en la sierra; huaicos"],
          ["En mi comunidad", "Calles inundadas; cultivos perdidos; cambios en la pesca"],
          ["¿Cómo nos preparamos?", "Limpiar desagües; mochila de emergencia; conocer zonas seguras"],
        ],
        note: "",
      },
    ],
    model: "gemini-3.6-flash",
  };
}

export const sessionValuesSample: Record<string, unknown> = {
  institution: "I.E. 123",
  teacher_name: "Prof. Miguel Quispe",
  director_name: "Lic. Ceferino Huamán",
  level: "Primaria",
  grade: "2do Grado",
  section: "B",
  curricular_area: "Personal Social",
  session_topic: "El Fenómeno del Niño",
  unit_title: "Cuidamos nuestra naturaleza",
  duration_minutes: "90",
  academic_period: "Bimestre 3",
  shift: "Mañana",
  instrument: "Guía de observación",
  student_context: "Colegio urbano marginal con familias dedicadas al comercio ambulante y la construcción.",
  materials: "Papelotes, plumones, láminas del barrio, teoría impresa",
  digital_resources: "Video corto del SENAMHI sobre el Fenómeno del Niño",
  bibliography: "MINEDU (2016). Programa curricular de Educación Primaria.\nSENAMHI (2024). El Niño costero: preguntas frecuentes.",
  student_names: "Ana Lucía Torres\nBruno Cárdenas\nCamila Rojas\nDiego Paredes",
};

describe("QA Generator: 18-planificamos-sesion-aprendizaje", () => {
  it("lee las matrices por título y cae a los datos del formulario cuando faltan", () => {
    const content = readSessionContent(sessionArtifactSample(), sessionValuesSample);
    expect(content.sessionNumber).toBe("04");
    expect(content.title).toMatch(/^Fenómeno El Niño/);
    expect(content.moments.map((moment) => moment.name)).toEqual(["Inicio", "Desarrollo", "Cierre"]);
    expect(content.competencies).toHaveLength(2);
    expect(content.alignment.purpose).toContain("¿Qué?");
    expect(content.alignment.standard).toContain("Construye su identidad");
    expect(content.worksheet).toHaveLength(6);
    expect(content.worksheet[0].options).toHaveLength(4);
    expect(content.mindMap.branches).toHaveLength(5);
    expect(content.transversal).toHaveLength(2);
    expect(content.transversal[0].competency).toMatch(/entornos virtuales/);
    expect(content.transversal[1].performance).toMatch(/metas/);
    expect(content.approaches).toHaveLength(2);
    expect(content.theory.length).toBeGreaterThanOrEqual(3);
    expect(content.students).toHaveLength(4);
    expect(content.info.find(([label]) => label === "Duración")?.[1]).toBe("90 minutos");

    const minimal = readSessionContent(
      { ...sessionArtifactSample(), tables: [], sections: [] },
      { ...sessionValuesSample, opening: "Motivación con una lámina.", competencies: "Construye su identidad" },
    );
    expect(minimal.moments[0].teacher).toBe("Motivación con una lámina.");
    expect(minimal.competencies[0].competency).toBe("Construye su identidad");
    expect(minimal.includeWorksheet).toBe(false);
  });

  it("genera 18-planificamos-sesion-aprendizaje.docx con el formato de referencia", async () => {
    const doc = buildSessionDocx(sessionArtifactSample(), sessionValuesSample);
    const buffer = await Packer.toBuffer(doc);
    const targetDir = process.env.QA_EXPORT_DIR ?? path.join(os.tmpdir(), "avendia-qa-export");
    const targetFile = path.join(targetDir, "18-planificamos-sesion-aprendizaje.docx");
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    // El Word incrusta el logo y las ilustraciones: supera con holgura el tamaño de un documento sin imágenes.
    expect(fs.statSync(targetFile).size).toBeGreaterThan(120_000);
  });

  it("enruta la sesión al generador de referencia desde el exportador universal", async () => {
    const generated = await buildWorkflowDocxBlob(sessionArtifactSample(), {
      workflowKey: "planificamos/sesion-aprendizaje",
      values: sessionValuesSample,
      toolTitle: "Sesión de Aprendizaje",
    });
    expect(generated.fileName.endsWith(".docx")).toBe(true);
    expect(generated.blob.size).toBeGreaterThan(120_000);
  });
});
