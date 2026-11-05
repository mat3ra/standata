import json
from pathlib import Path

import pytest
from mat3ra.standata.data.workflows import workflows_data
from mat3ra.standata.materials import Materials

SUBWORKFLOWS = workflows_data["filesMapByName"]["espresso/valence_band_offset_bulk.json"]["subworkflows"]
UNITS = [unit for subworkflow in SUBWORKFLOWS for unit in subworkflow["units"]]
SCRIPT_UNIT = next(unit for unit in UNITS if unit["name"] == "Calculate VBO (Bulk Method)")
SCRIPT = next(item["template"]["content"] for item in SCRIPT_UNIT["input"] if item["template"]["name"] == "script.py")
RESULT_UNIT = next(unit for unit in UNITS if unit["name"] == "Valence Band Offset")
# job y9NnPhvRqdWN4hX8N: cubic SiO2/HfO2 (001) superlattice and its two bulks, profiles downsampled above the FFT grid
CHECKPOINT = (Path(__file__).parent.parent / "fixtures" / "valence_band_offset_bulk_checkpoint.json").read_text()
SCOPE_GLOBAL = json.loads(CHECKPOINT)["scope"]["global"]


@pytest.fixture(autouse=True)
def working_directory(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)


def run_script(**materials):
    """The shipped script on the job's checkpoint, with the given materials in place of the job's."""
    checkpoint = json.loads(CHECKPOINT)
    checkpoint["scope"]["global"].update(materials)
    Path(".mat3ra").mkdir()
    Path(".mat3ra/checkpoint").write_text(json.dumps(checkpoint))
    exec(SCRIPT, {"__name__": "__main__"})


def test_valence_band_offset(capsys):
    run_script()
    stdout_scope = {"STDOUT": capsys.readouterr().out}
    assert eval(RESULT_UNIT["value"], {"json": json}, stdout_scope) == pytest.approx(-0.3602, abs=1e-4)


# Interface Left: Beta Cristobalite as stored (fcc primitive cell), not in the a, b of the superlattice
def test_bulk_off_the_interface_plane():
    with pytest.raises(ValueError, match="Interface's a, b"):
        run_script(BULK_LEFT=Materials.get_by_name_first_match("mp-8352"))


# The SiO2 bulk as the Interface and the superlattice as Interface Left
def test_materials_in_the_wrong_order():
    with pytest.raises(ValueError, match="material order"):
        run_script(INTERFACE=SCOPE_GLOBAL["BULK_LEFT"], BULK_LEFT=SCOPE_GLOBAL["INTERFACE"])
