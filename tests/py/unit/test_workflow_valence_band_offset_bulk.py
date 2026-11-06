import contextlib
import io
import json
from pathlib import Path

import jinja2
import numpy as np
import pytest
from mat3ra.standata.data.workflows import workflows_data

SUBWORKFLOWS = workflows_data["filesMapByName"]["espresso/valence_band_offset_bulk.json"]["subworkflows"]
UNITS = [unit for subworkflow in SUBWORKFLOWS for unit in subworkflow["units"]]
ESP_DATA_OPERANDS = ["array_from_context", "AVG_ESP_LEFT", "AVG_ESP_RIGHT"]
ESP_DATA_UNITS = [unit for unit in UNITS if unit.get("operand") in ESP_DATA_OPERANDS]
FIND_UNIT = next(unit for unit in UNITS if unit["name"] == "Find Block Averages")
TEMPLATE = next(item["template"]["content"] for item in FIND_UNIT["input"] if item["template"]["name"].endswith(".py"))
AVERAGES_UNIT = next(unit for unit in UNITS if unit.get("operand") == "AVG_ESP_INTERFACE")
CALC_UNITS = next(subworkflow for subworkflow in SUBWORKFLOWS if subworkflow["name"] == "Calculate VBO")["units"]
FIXTURES_DIRECTORY = Path(__file__).parent.parent / "fixtures"
# (scope of a SiO2/HfO2 (001) superlattice job and its two bulks, the units the interface's basis is given in): offset.
# Job cTZuQ9ek4x66jAHus, monoclinic HfO2 with c tilted from the a, b normal; profiles every 38th (interface) / 300th
# (bulks) sample, where the window still sees the tilt.
VALENCE_BAND_OFFSET_BY_SCOPE = {
    ("valence_band_offset_bulk_monoclinic_hafnia_scope.json", "crystal"): 0.6888,
    ("valence_band_offset_bulk_monoclinic_hafnia_scope.json", "cartesian"): 0.6888,
}


def _evaluate(unit, scope, local_scope):
    """Value of an assignment unit on the global scope, its inputs read from the local scope."""
    inputs = {item["name"]: local_scope[item["scope"]][item["name"]] for item in unit.get("input", [])}
    return eval(unit["value"], {"np": np, "json": json}, {**scope, **inputs})


def _get_scope_with_esp_data(scope_name, basis_units):
    """The job's scope, the interface's basis in the given units, after the units that set the ESP data."""
    job_scope = json.loads((FIXTURES_DIRECTORY / scope_name).read_text())["scope"]
    scope = dict(job_scope["global"])
    basis, lattice_vectors = scope["INTERFACE"]["basis"], scope["INTERFACE"]["lattice"]["vectors"]
    if basis["units"] != basis_units:
        cell = [lattice_vectors[axis] for axis in "abc"]
        for coordinate in basis["coordinates"]:
            coordinate["value"] = (np.array(coordinate["value"]) @ cell).tolist()
        basis["units"] = basis_units
    for unit in ESP_DATA_UNITS:
        scope[unit["operand"]] = _evaluate(unit, scope, job_scope["local"])
    return scope


def _run_template(scope):
    """STDOUT of the template, rendered as the web-app (raw blocks) and then rupy (the scope) render it."""
    stdout = io.StringIO()
    with contextlib.redirect_stdout(stdout):
        exec(jinja2.Template(jinja2.Template(TEMPLATE).render()).render(**scope), {})
    return stdout.getvalue()


@pytest.mark.parametrize("scope_name_and_basis_units, expected", VALENCE_BAND_OFFSET_BY_SCOPE.items())
def test_calc_subworkflow_valence_band_offset(scope_name_and_basis_units, expected):
    scope = _get_scope_with_esp_data(*scope_name_and_basis_units)
    find_scope = {FIND_UNIT["flowchartId"]: {"STDOUT": _run_template(scope)}}
    scope[AVERAGES_UNIT["operand"]] = _evaluate(AVERAGES_UNIT, scope, find_scope)
    for unit in CALC_UNITS:
        scope[unit["operand"]] = _evaluate(unit, scope, {})
    assert scope["VALENCE_BAND_OFFSET"] == pytest.approx(expected, abs=1e-4)
