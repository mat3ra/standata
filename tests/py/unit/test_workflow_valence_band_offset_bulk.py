import json
from pathlib import Path

import numpy as np
import pytest
from mat3ra.standata.data.workflows import workflows_data

SUBWORKFLOWS = workflows_data["filesMapByName"]["espresso/valence_band_offset_bulk.json"]["subworkflows"]
UNITS = [unit for subworkflow in SUBWORKFLOWS for unit in subworkflow["units"]]
SCRIPT_UNIT = next(unit for unit in UNITS if unit["name"] == "Calculate VBO (Bulk Method)")
SCRIPT = next(item["template"]["content"] for item in SCRIPT_UNIT["input"] if item["template"]["name"] == "script.py")
RESULT_UNIT = next(unit for unit in UNITS if unit["name"] == "Valence Band Offset")
SCRIPT_NAMESPACE = {"__name__": "script"}
exec(SCRIPT, SCRIPT_NAMESPACE)
get_block_centers, get_plane_period = SCRIPT_NAMESPACE["get_block_centers"], SCRIPT_NAMESPACE["get_plane_period"]
get_structure, get_rendered_pw_input = SCRIPT_NAMESPACE["get_structure"], SCRIPT_NAMESPACE["get_rendered_pw_input"]
get_valence_band_offset = SCRIPT_NAMESPACE["get_valence_band_offset"]
FIXTURES_DIRECTORY = Path(__file__).parent.parent / "fixtures"
# job y9NnPhvRqdWN4hX8N: cubic SiO2/HfO2 (001) superlattice, profiles downsampled above the FFT grid
VALENCE_BAND_OFFSET_BY_CHECKPOINT = {"valence_band_offset_bulk_checkpoint.json": -0.3602}
# job cTZuQ9ek4x66jAHus: monoclinic SiO2/HfO2 superlattice and its HfO2 bulk, c tilted from the a, b normal
PLANE_PERIOD_BY_PW_INPUTS = {"valence_band_offset_bulk_monoclinic_hafnia_pw_inputs.json": 2.6251}
ERROR_BY_BULK_ELEMENTS = {(("Si", "O"), ("O", "Si")): "be located", (("Si", "O", "Hf"), ("Hf", "O")): "material order"}


@pytest.mark.parametrize("checkpoint_name, expected", VALENCE_BAND_OFFSET_BY_CHECKPOINT.items())
def test_calc_subworkflow_valence_band_offset(checkpoint_name, expected, tmp_path, monkeypatch, capsys):
    (tmp_path / ".mat3ra").mkdir()
    (tmp_path / ".mat3ra" / "checkpoint").write_text((FIXTURES_DIRECTORY / checkpoint_name).read_text())
    monkeypatch.chdir(tmp_path)
    exec(SCRIPT, {"__name__": "__main__"})
    stdout_scope = {"STDOUT": capsys.readouterr().out}
    assert eval(RESULT_UNIT["value"], {"json": json}, stdout_scope) == pytest.approx(expected, abs=1e-4)


def test_script_reads_what_the_workflow_writes():
    assert set(SCRIPT_NAMESPACE["AVERAGE_FLOWCHART_IDS"]) <= {unit["flowchartId"] for unit in UNITS}
    assert set(SCRIPT_NAMESPACE["VALENCE_BAND_MAXIMUM_OPERANDS"]) <= {unit.get("operand") for unit in UNITS}


@pytest.mark.parametrize(
    "elements, heights, left_elements, right_elements, expected_centers",
    [
        # both blocks marked; the right one across the cell boundary
        (["Si", "Si", "O", "Hf", "Hf"], [0.3, 0.4, 0.6, 0.9, 0.0], ["Si", "O"], ["Hf", "O"], [0.35, 0.95]),
        # Si/SiO2: no element of the left bulk alone, so its block fills the gap between the right block's O
        (["Si", "Si", "O", "O"], [0.1, 0.3, 0.6, 0.8], ["Si"], ["Si", "O"], [0.2, 0.7]),
    ],
)
def test_get_block_centers(elements, heights, left_elements, right_elements, expected_centers):
    centers = get_block_centers(np.array(elements), np.array(heights), left_elements, right_elements)
    assert centers == pytest.approx(expected_centers)


@pytest.mark.parametrize("bulk_elements, message", ERROR_BY_BULK_ELEMENTS.items())
def test_get_block_centers_raises(bulk_elements, message):
    with pytest.raises(ValueError, match=message):
        get_block_centers(np.array(["Si", "O"]), np.array([0.1, 0.6]), *bulk_elements)


def _get_checkpoint_structures(checkpoint_name):
    """Interface, left and right structures from the rendered pw_scf inputs in the checkpoint."""
    workflow = json.loads((FIXTURES_DIRECTORY / checkpoint_name).read_text())["scope"]["global"]["WORKFLOW"]
    flowchart_ids = SCRIPT_NAMESPACE["AVERAGE_FLOWCHART_IDS"]
    return [get_structure(get_rendered_pw_input(workflow, flowchart_id)) for flowchart_id in flowchart_ids]


# Interface Left with the a, b of Beta Cristobalite as stored (fcc primitive cell), not those of the superlattice
@pytest.mark.parametrize("checkpoint_name", VALENCE_BAND_OFFSET_BY_CHECKPOINT)
def test_get_valence_band_offset_with_bulk_off_the_interface_plane(checkpoint_name):
    interface, left, right = _get_checkpoint_structures(checkpoint_name)
    in_plane_cell = np.loadtxt(Path(__file__).parents[3] / "assets/materials/mp-8352.poscar", skiprows=2, max_rows=2)
    left.in_plane_metric = in_plane_cell @ in_plane_cell.T
    with pytest.raises(ValueError, match="Interface's a, b"):
        get_valence_band_offset([], [interface, left, right], [])


# The SiO2 bulk picked as the Interface: its cell is thinner than the windows of the superlattice and HfO2
@pytest.mark.parametrize("checkpoint_name", VALENCE_BAND_OFFSET_BY_CHECKPOINT)
def test_get_valence_band_offset_with_materials_in_the_wrong_order(checkpoint_name):
    interface, left, right = _get_checkpoint_structures(checkpoint_name)
    with pytest.raises(ValueError, match="thicker"):
        get_valence_band_offset([], [left, interface, right], [])


@pytest.mark.parametrize("pw_inputs_name, expected", PLANE_PERIOD_BY_PW_INPUTS.items())
def test_get_plane_period_with_tilted_c(pw_inputs_name, expected):
    pw_inputs = json.loads((FIXTURES_DIRECTORY / pw_inputs_name).read_text())
    interface, bulk = [get_structure(pw_input) for pw_input in pw_inputs]
    assert bulk.in_plane_metric == pytest.approx(interface.in_plane_metric)
    assert get_plane_period(bulk) == pytest.approx(expected, abs=1e-4)
