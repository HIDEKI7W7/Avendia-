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


def test_nivel_desconocido_no_agrega_bloque() -> None:
    assert cognitive_demand_block({"level": "EBA · Ciclo Avanzado", "grade": "2.º grado EBA"}) == ""
    assert cognitive_demand_block({}) == ""


def test_secundaria_sin_grado_usa_el_ciclo_superior() -> None:
    assert "CICLO VII" in cognitive_demand_block({"level": "Secundaria", "grade": ""})
