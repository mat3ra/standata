import contextlib
import io
import json
from pathlib import Path

import jinja2
import numpy as np
import pytest
from mat3ra.standata.data.workflows import workflows_data

LOCAL_SCOPE_OPERANDS = ["array_from_context", "AVG_ESP_LEFT", "AVG_ESP_RIGHT", "FERMI_ENERGY_RIGHT"]
FIXTURES_DIRECTORY = Path(__file__).parent.parent / "fixtures"
# (workflow, scope of a SiO2/HfO2 (001) superlattice job and its two bulks, the units the interface's basis is given
# in): offset. Job cTZuQ9ek4x66jAHus, monoclinic HfO2 with c tilted from the a, b normal; profiles every 38th
# (interface) / 300th (bulks) sample, where the window still sees the tilt. The metal workflow reads the HfO2 bulk's
# Fermi energy (its pw_scf) in place of its VBM.
VALENCE_BAND_OFFSET_BY_SCOPE = {
    ("valence_band_offset_bulk", "valence_band_offset_bulk_monoclinic_hafnia_scope.json", "crystal"): 0.6888,
    ("valence_band_offset_bulk", "valence_band_offset_bulk_monoclinic_hafnia_scope.json", "cartesian"): 0.6888,
    ("valence_band_offset_bulk_metal", "valence_band_offset_bulk_monoclinic_hafnia_scope.json", "crystal"): -2.0725,
}


def _evaluate(unit, scope, local_scope):
    """Value of an assignment unit on the global scope, its inputs read from the local scope."""
    inputs = {item["name"]: local_scope[item["scope"]][item["name"]] for item in unit.get("input", [])}
    return eval(unit["value"], {"np": np, "json": json}, {**scope, **inputs})


def _get_units_by_subworkflow(workflow_name):
    """The workflow's units, by subworkflow name."""
    subworkflows = workflows_data["filesMapByName"][f"espresso/{workflow_name}.json"]["subworkflows"]
    return {subworkflow["name"]: subworkflow["units"] for subworkflow in subworkflows}


def _get_scope_with_local_data(units_by_subworkflow, scope_name, basis_units):
    """The job's scope, the interface's basis in the given units, after the units that read the job's local scope."""
    job_scope = json.loads((FIXTURES_DIRECTORY / scope_name).read_text())["scope"]
    scope = dict(job_scope["global"])
    basis, lattice_vectors = scope["INTERFACE"]["basis"], scope["INTERFACE"]["lattice"]["vectors"]
    if basis["units"] != basis_units:
        cell = [lattice_vectors[axis] for axis in "abc"]
        for coordinate in basis["coordinates"]:
            coordinate["value"] = (np.array(coordinate["value"]) @ cell).tolist()
        basis["units"] = basis_units
    for units in units_by_subworkflow.values():
        for unit in units:
            if unit.get("operand") in LOCAL_SCOPE_OPERANDS:
                scope[unit["operand"]] = _evaluate(unit, scope, job_scope["local"])
    return scope


def _run_template(find_unit, scope):
    """STDOUT of the unit's template, rendered as the web-app (raw blocks) and then rupy (the scope) render it."""
    template = next(
        item["template"]["content"] for item in find_unit["input"] if item["template"]["name"].endswith(".py")
    )
    stdout = io.StringIO()
    with contextlib.redirect_stdout(stdout):
        exec(jinja2.Template(jinja2.Template(template).render()).render(**scope), {})
    return stdout.getvalue()


@pytest.mark.parametrize("workflow_scope_name_and_basis_units, expected", VALENCE_BAND_OFFSET_BY_SCOPE.items())
def test_calc_subworkflow_valence_band_offset(workflow_scope_name_and_basis_units, expected):
    workflow_name, scope_name, basis_units = workflow_scope_name_and_basis_units
    units_by_subworkflow = _get_units_by_subworkflow(workflow_name)
    scope = _get_scope_with_local_data(units_by_subworkflow, scope_name, basis_units)
    find_unit, averages_unit = units_by_subworkflow["Find ESP Block Averages"]
    find_scope = {find_unit["flowchartId"]: {"STDOUT": _run_template(find_unit, scope)}}
    scope[averages_unit["operand"]] = _evaluate(averages_unit, scope, find_scope)
    for unit in units_by_subworkflow["Calculate VBO"]:
        scope[unit["operand"]] = _evaluate(unit, scope, {})
    assert scope["VALENCE_BAND_OFFSET"] == pytest.approx(expected, abs=1e-4)
