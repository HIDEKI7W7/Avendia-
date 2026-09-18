import pytest

from app.modules.ai.cognitive_demand import cognitive_demand_block


def test_primaria_y_secundaria_no_comparten_exigencia() -> None:
    primaria = cognitive_demand_block({"level": "Primaria", "grade": "2° de Primaria"})
    secundaria = cognitive_demand_block({"level": "Secundaria", "grade": "5° de Secundaria"})
    assert "CICLO III" in primaria
    assert "CICLO VII" in secundaria
    assert primaria != secundaria


def test_cada_ciclo_de_primaria_es_distinto() -> None:
    bloques = {
        cognitive_demand_block({"level": "Primaria", "grade": f"{grade}° de Primaria"})
        for grade in (1, 3, 5)
    }
    assert len(bloques) == 3


def test_inicial_no_exige_lectura_autonoma() -> None:
    bloque = cognitive_demand_block({"level": "Inicial", "grade": "4 años"})
    assert "CICLO II" in bloque
    assert "no se exige lectura autónoma" in bloque


@pytest.mark.parametrize(
    ("level", "grade"),
    [
        # EBA es educación de personas jóvenes y adultas: tratar su "Ciclo Inicial"
        # como el Inicial de EBR pedía un documento para niños de 3 a 5 años.
        ("EBA · Ciclo Inicial", "1.er grado EBA"),
        ("EBA · Ciclo Intermedio", "2.º grado EBA"),
        ("EBA · Ciclo Avanzado", "2.º grado EBA"),
        # EBE atiende necesidades específicas; los ciclos de EBR no le aplican.
        ("CEBE · Inicial (ciclo II)", "4 años"),
        ("CEBE · Primaria (ciclos III–V)", "6.º grado CEBE / TVA"),
        ("PRITE · Ciclo I", "1 año"),
    ],
)
def test_los_niveles_ajenos_a_ebr_no_reciben_ciclo(level: str, grade: str) -> None:
    assert cognitive_demand_block({"level": level, "grade": grade}) == ""


def test_sin_nivel_no_hay_bloque() -> None:
    assert cognitive_demand_block({}) == ""
    assert cognitive_demand_block({"level": "", "grade": "2° de Primaria"}) == ""


@pytest.mark.parametrize("level", ["Primaria", "Secundaria"])
def test_sin_grado_se_acota_al_nivel_sin_inventar_ciclo_ni_edad(level: str) -> None:
    bloque = cognitive_demand_block({"level": level, "grade": ""})
    assert level in bloque
    assert "No se indicó el grado" in bloque
    # No debe afirmar un ciclo concreto ni una franja de edad que nadie declaró.
    assert "CICLO" not in bloque
    assert "años)" not in bloque


def test_sin_grado_primaria_y_secundaria_siguen_siendo_distintas() -> None:
    primaria = cognitive_demand_block({"level": "Primaria", "grade": ""})
    secundaria = cognitive_demand_block({"level": "Secundaria", "grade": ""})
    assert primaria and secundaria and primaria != secundaria
