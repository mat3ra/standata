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
get_block_centers, get_structure = SCRIPT_NAMESPACE["get_block_centers"], SCRIPT_NAMESPACE["get_structure"]
get_valence_band_offset = SCRIPT_NAMESPACE["get_valence_band_offset"]
FIXTURES_DIRECTORY = Path(__file__).parent.parent / "fixtures"
# job y9NnPhvRqdWN4hX8N: cubic SiO2/HfO2 (001) superlattice, profiles downsampled above the FFT grid
VALENCE_BAND_OFFSET_BY_CHECKPOINT = {"valence_band_offset_bulk_checkpoint.json": -0.3602}
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


# Interface Left with the a, b of Beta Cristobalite as stored (fcc primitive cell), not those of the superlattice
@pytest.mark.parametrize("checkpoint_name", VALENCE_BAND_OFFSET_BY_CHECKPOINT)
def test_get_valence_band_offset_with_bulk_off_the_interface_plane(checkpoint_name):
    workflow = json.loads((FIXTURES_DIRECTORY / checkpoint_name).read_text())["scope"]["global"]["WORKFLOW"]
    rendered_pw_inputs = [subworkflow["units"][0]["input"][0]["rendered"] for subworkflow in workflow["subworkflows"]]
    interface, left, right = [get_structure(rendered_pw_input) for rendered_pw_input in rendered_pw_inputs]
    in_plane_cell = np.loadtxt(Path(__file__).parents[3] / "assets/materials/mp-8352.poscar", skiprows=2, max_rows=2)
    with pytest.raises(ValueError, match="Interface's a, b"):
        get_valence_band_offset([], [interface, (*left[:3], in_plane_cell @ in_plane_cell.T), right], [])
