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
ESP_DATA_UNITS = [unit for unit in UNITS if unit["name"] == "Set Macroscopically Averaged ESP Data"]
FIND_UNIT = next(unit for unit in UNITS if unit["name"] == "Find Block Averages")
TEMPLATE = next(item["template"]["content"] for item in FIND_UNIT["input"] if item["template"]["name"].endswith(".py"))
AVERAGES_UNIT = next(unit for unit in UNITS if unit.get("operand") == "AVG_ESP_INTERFACE")
CALC_UNITS = next(subworkflow for subworkflow in SUBWORKFLOWS if subworkflow["name"] == "Calculate VBO")["units"]
FIXTURES_DIRECTORY = Path(__file__).parent.parent / "fixtures"
# job y9NnPhvRqdWN4hX8N: cubic SiO2/HfO2 (001) superlattice and its two bulks, profiles every 8th / 30th sample
AVERAGES_BY_SCOPE = {"valence_band_offset_bulk_scope.json": [5.7039, 0.7295]}
VALENCE_BAND_OFFSET_BY_SCOPE = {"valence_band_offset_bulk_scope.json": -0.3535}


def _evaluate(unit, scope, local_scope):
    """Value of an assignment unit on the global scope, its inputs read from the local scope."""
    inputs = {item["name"]: local_scope[item["scope"]][item["name"]] for item in unit.get("input", [])}
    return eval(unit["value"], {"np": np, "json": json}, {**scope, **inputs})


def _get_scope_with_esp_data(scope_name):
    """The job's scope after the three "Set Macroscopically Averaged ESP Data" units: interface, left, right."""
    job_scope = json.loads((FIXTURES_DIRECTORY / scope_name).read_text())["scope"]
    scope = dict(job_scope["global"])
    for unit in ESP_DATA_UNITS:
        scope[unit["operand"]] = _evaluate(unit, scope, job_scope["local"])
    return scope


def _run_template(scope):
    """STDOUT of the template, rendered as the web-app (raw blocks) and then rupy (the scope) render it."""
    stdout = io.StringIO()
    with contextlib.redirect_stdout(stdout):
        exec(jinja2.Template(jinja2.Template(TEMPLATE).render()).render(**scope), {})
    return stdout.getvalue()


@pytest.mark.parametrize("scope_name, expected", AVERAGES_BY_SCOPE.items())
def test_find_block_averages(scope_name, expected):
    averages = json.loads(_run_template(_get_scope_with_esp_data(scope_name)))["averages"]
    assert averages == pytest.approx(expected, abs=1e-4)


@pytest.mark.parametrize("scope_name, expected", VALENCE_BAND_OFFSET_BY_SCOPE.items())
def test_calc_subworkflow_valence_band_offset(scope_name, expected):
    scope = _get_scope_with_esp_data(scope_name)
    find_scope = {FIND_UNIT["flowchartId"]: {"STDOUT": _run_template(scope)}}
    scope[AVERAGES_UNIT["operand"]] = _evaluate(AVERAGES_UNIT, scope, find_scope)
    for unit in CALC_UNITS:
        scope[unit["operand"]] = _evaluate(unit, scope, {})
    assert scope["VALENCE_BAND_OFFSET"] == pytest.approx(expected, abs=1e-4)
