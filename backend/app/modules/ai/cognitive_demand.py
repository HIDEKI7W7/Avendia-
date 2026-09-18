"""
Exigencia cognitiva por ciclo de la EBR.

El prompt maestro recibía nivel y grado como texto suelto y pedía "diferenciar el
nivel de complejidad" sin decir en qué consiste, así que una sesión de 2.º de
Primaria salía con la misma dificultad que una de 5.º de Secundaria. Aquí se
traduce el par (nivel, grado) al ciclo del CNEB y a exigencias concretas y
verificables: verbos del estándar, extensión del texto que lee el estudiante,
complejidad de los procedimientos y grado de autonomía esperado.
"""

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class CycleDemand:
    """Exigencias redactables para un ciclo del CNEB."""

    cycle: str
    ages: str
    verbs: str
    reading: str
    procedures: str
    autonomy: str
    vocabulary: str


# Ciclos I y II (Inicial), III–V (Primaria) y VI–VII (Secundaria).
_DEMANDS: dict[str, CycleDemand] = {
    "II": CycleDemand(
        cycle="II (Inicial)",
        ages="3 a 5 años",
        verbs="explorar, nombrar, reconocer, agrupar, representar con el cuerpo y el juego",
        reading="no se exige lectura autónoma; el docente lee en voz alta e interpreta imágenes",
        procedures=(
            "comparaciones y conteos concretos con material manipulable, sin operaciones escritas "
            "ni algoritmos"
        ),
        autonomy="actividad guiada paso a paso por el docente, en juego y rutina",
        vocabulary="palabras cotidianas y frases cortas; nada de tecnicismos",
    ),
    "III": CycleDemand(
        cycle="III (1.º y 2.º de Primaria)",
        ages="6 a 7 años",
        verbs="identificar, describir, ordenar, comparar, clasificar con apoyo concreto",
        reading="textos de 3 a 6 líneas con apoyo visual y vocabulario frecuente",
        procedures=(
            "números hasta dos cifras, adición y sustracción con material concreto; una sola "
            "consigna por vez"
        ),
        autonomy="modelado del docente y práctica acompañada; trabajo en parejas breve",
        vocabulary="lenguaje sencillo y literal; cada palabra nueva se explica con un ejemplo",
    ),
    "IV": CycleDemand(
        cycle="IV (3.º y 4.º de Primaria)",
        ages="8 a 9 años",
        verbs="explicar, relacionar, secuenciar, inferir causas simples, justificar con un dato",
        reading="textos de 1 a 2 párrafos con una idea principal explícita",
        procedures=(
            "números hasta cuatro cifras, multiplicación y división sencillas, fracciones usuales; "
            "problemas de dos pasos"
        ),
        autonomy="trabajo en equipo con roles asignados y pautas escritas",
        vocabulary="términos del área introducidos con definición breve",
    ),
    "V": CycleDemand(
        cycle="V (5.º y 6.º de Primaria)",
        ages="10 a 11 años",
        verbs="analizar, argumentar con evidencia, organizar información, proponer alternativas",
        reading="textos de 2 a 3 párrafos con información implícita y una fuente",
        procedures=(
            "fracciones, decimales, porcentajes básicos y proporcionalidad simple; problemas de "
            "varios pasos con datos que el estudiante selecciona"
        ),
        autonomy="planifica su trabajo con una pauta y se autoevalúa con criterios dados",
        vocabulary="vocabulario técnico del área con apoyo contextual",
    ),
    "VI": CycleDemand(
        cycle="VI (1.º y 2.º de Secundaria)",
        ages="12 a 13 años",
        verbs="explicar con fundamento, contrastar fuentes, modelar situaciones, evaluar opciones",
        reading="textos de varios párrafos, discontinuos o con dos fuentes que se contrastan",
        procedures=(
            "números enteros y racionales, álgebra inicial (ecuaciones de primer grado), "
            "estadística descriptiva; problemas con datos incompletos o irrelevantes"
        ),
        autonomy="trabajo autónomo con entregables intermedios y coevaluación",
        vocabulary="terminología disciplinar precisa; se exige usarla correctamente",
    ),
    "VII": CycleDemand(
        cycle="VII (3.º, 4.º y 5.º de Secundaria)",
        ages="14 a 17 años",
        verbs=(
            "argumentar con criterios, generalizar, tomar decisiones justificadas, evaluar "
            "supuestos y consecuencias"
        ),
        reading="textos extensos, especializados o contradictorios, con validación de la fuente",
        procedures=(
            "funciones, sistemas de ecuaciones, interés simple y compuesto, probabilidad e "
            "inferencia; problemas abiertos con más de una solución defendible"
        ),
        autonomy="proyecto o investigación con decisiones propias y metacognición explícita",
        vocabulary="lenguaje académico y técnico del área, sin simplificaciones",
    ),
}


def _cycle_for(level: str, grade: str) -> str | None:
    level_key = level.strip().lower()
    number = re.search(r"\d+", grade or "")
    position = int(number.group()) if number else 0
    if "inicial" in level_key:
        return "II"
    if "primaria" in level_key:
        if position in (1, 2):
            return "III"
        if position in (3, 4):
            return "IV"
        if position in (5, 6):
            return "V"
        return "IV"
    if "secundaria" in level_key:
        if position in (1, 2):
            return "VI"
        if position in (3, 4, 5):
            return "VII"
        return "VII"
    return None


def cognitive_demand_block(fields: dict[str, str]) -> str:
    """Bloque de prompt con la exigencia del ciclo, o cadena vacía si no aplica."""
    level = (fields.get("level") or "").strip()
    grade = (fields.get("grade") or "").strip()
    cycle = _cycle_for(level, grade)
    if cycle is None:
        return ""
    demand = _DEMANDS[cycle]
    if grade and level.lower() not in grade.lower():
        target = f"{grade} de {level}"
    else:
        target = grade or level
    return f"""
EXIGENCIA COGNITIVA OBLIGATORIA — CICLO {demand.cycle}, {target} ({demand.ages}):
- Verbos y procesos esperados: {demand.verbs}.
- Textos que lee el estudiante: {demand.reading}.
- Complejidad de los procedimientos: {demand.procedures}.
- Autonomía: {demand.autonomy}.
- Vocabulario: {demand.vocabulary}.
- Calibra a este ciclo TODO el documento: propósito, situación significativa, consignas,
  ejemplos, preguntas, evidencias, criterios y niveles del instrumento.
- Está prohibido reutilizar el nivel de dificultad de otro ciclo. Antes de responder,
  revisa cada consigna y pregúntate si un estudiante de {target} puede resolverla sin
  conocimientos de un ciclo superior y sin que resulte trivial para su edad.
""".strip()
