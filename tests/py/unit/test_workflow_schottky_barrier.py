import pytest

from mat3ra.standata.data.workflows import workflows_data

WORKFLOW_FILENAME = "espresso/schottky_barrier.json"
CALC_SUBWORKFLOW_NAME = "Calculate Schottky Barrier"
INDEX_UNIT_NAME = "Set Semiconductor ESP Minimum Index"

FERMI_ENERGY = -1.0
VALENCE_BAND_MAXIMUM = -1.5
BAND_GAP_INDIRECT = {"type": "indirect", "value": 1.8, "eigenvalueValence": VALENCE_BAND_MAXIMUM}
AVG_ESP_INTERFACE = [-7.6, -9.0, -8.0]
AVG_ESP_SEMICONDUCTOR = [-7.5, -7.0]
PREVIOUS_SCOPE = {
    "fermi_energy": FERMI_ENERGY,
    "VBM": VALENCE_BAND_MAXIMUM,
    "BAND_GAP_INDIRECT": BAND_GAP_INDIRECT,
    "AVG_ESP_INTERFACE": AVG_ESP_INTERFACE,
    "AVG_ESP_SEMICONDUCTOR": AVG_ESP_SEMICONDUCTOR,
}

WORKFLOW_DEFAULT_INDEX = None
SEMICONDUCTOR_FILM_BARRIERS = (1.5, 0.3)
SEMICONDUCTOR_SUBSTRATE_INDEX = "0"
SEMICONDUCTOR_SUBSTRATE_BARRIERS = (0.6, 1.2)
PUBLISHED_RESULTS_BY_OPERAND = {
    "SCHOTTKY_BARRIER_P": ["schottky_barrier_height_p"],
    "SCHOTTKY_BARRIER_N": ["schottky_barrier_height_n"],
}


def _get_subworkflows():
    """Subworkflows of the shipped Schottky Barrier Height workflow."""
    return workflows_data["filesMapByName"][WORKFLOW_FILENAME]["subworkflows"]


def _evaluate_calc_assignments(index_override):
    """Global scope after the calc subworkflow's assignments, in order, on top of PREVIOUS_SCOPE."""
    calc_subworkflow = next(s for s in _get_subworkflows() if s["name"] == CALC_SUBWORKFLOW_NAME)
    scope = dict(PREVIOUS_SCOPE)
    for unit in calc_subworkflow["units"]:
        value = index_override if unit["name"] == INDEX_UNIT_NAME and index_override else unit["value"]
        scope[unit["operand"]] = eval(str(value), {"__builtins__": {}}, dict(scope))
    return scope


@pytest.mark.parametrize("subworkflow", _get_subworkflows(), ids=lambda subworkflow: subworkflow["name"])
def test_assignment_input_scopes_resolve_within_subworkflow_or_earlier(subworkflow):
    subworkflows = _get_subworkflows()
    subworkflows_so_far = subworkflows[: subworkflows.index(subworkflow) + 1]
    flowchart_ids = {unit["flowchartId"] for earlier in subworkflows_so_far for unit in earlier["units"]}
    scopes = {item["scope"] for unit in subworkflow["units"] for item in unit.get("input", []) if "scope" in item}
    assert scopes <= flowchart_ids


@pytest.mark.parametrize(
    "index_override, expected_barriers",
    [
        (WORKFLOW_DEFAULT_INDEX, SEMICONDUCTOR_FILM_BARRIERS),
        (SEMICONDUCTOR_SUBSTRATE_INDEX, SEMICONDUCTOR_SUBSTRATE_BARRIERS),
    ],
)
def test_calc_subworkflow_barriers(index_override, expected_barriers):
    scope = _evaluate_calc_assignments(index_override)
    assert (scope["SCHOTTKY_BARRIER_P"], scope["SCHOTTKY_BARRIER_N"]) == pytest.approx(expected_barriers)


@pytest.mark.parametrize("operand, expected_results", PUBLISHED_RESULTS_BY_OPERAND.items())
def test_calc_subworkflow_publishes_barrier_properties(operand, expected_results):
    calc_subworkflow = next(s for s in _get_subworkflows() if s["name"] == CALC_SUBWORKFLOW_NAME)
    unit = next(u for u in calc_subworkflow["units"] if u.get("operand") == operand)
    assert [result["name"] for result in unit["results"]] == expected_results
