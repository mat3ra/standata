import pytest
from types import SimpleNamespace

from mat3ra.standata.data.subworkflows import subworkflows_data
from mat3ra.standata.data.workflows import workflows_data
from mat3ra.standata.workflows import WorkflowStandata

APP = SimpleNamespace(ESPRESSO="espresso")
WORKFLOW = SimpleNamespace(
    SEARCH_NAME="band_gap",
    FILENAME="espresso/band_gap.json",
    EXACT_NAME="Band Gap",
    HSE_NAME="Band Gap + DoS - HSE",
)


def test_get_by_name():
    workflow = WorkflowStandata.get_by_name_first_match(WORKFLOW.SEARCH_NAME)
    assert type(workflow) is dict
    assert "name" in workflow
    assert workflow["name"] == WORKFLOW.EXACT_NAME


def test_get_by_categories():
    workflows = WorkflowStandata.get_by_categories(APP.ESPRESSO)
    assert isinstance(workflows, list)
    assert len(workflows) >= 1
    assert isinstance(workflows[0], dict)


def test_get_workflow_data():
    workflow = workflows_data["filesMapByName"][WORKFLOW.FILENAME]
    assert type(workflow) is dict
    assert "name" in workflow
    assert workflow["name"] == WORKFLOW.EXACT_NAME


def test_get_by_name_and_categories():
    workflow = WorkflowStandata.get_by_name_and_categories(WORKFLOW.SEARCH_NAME, APP.ESPRESSO)
    assert type(workflow) is dict
    assert "name" in workflow
    assert APP.ESPRESSO in str(workflow.get("application", {})).lower() or APP.ESPRESSO in str(workflow)


def test_get_as_list():
    workflows_list = WorkflowStandata.get_as_list()
    assert isinstance(workflows_list, list)
    assert len(workflows_list) >= 1
    assert isinstance(workflows_list[0], dict)
    assert "name" in workflows_list[0]


def test_filter_by_application_and_get_by_name():
    workflow = WorkflowStandata.filter_by_application(APP.ESPRESSO).get_by_name_first_match(WORKFLOW.SEARCH_NAME)
    assert type(workflow) is dict
    assert "name" in workflow
    assert workflow["name"] == WORKFLOW.EXACT_NAME
    assert APP.ESPRESSO in str(workflow.get("application", {})).lower()


def _precision_expressions():
    """Both shipped copies of the assign-precision-for-material expression: the standalone
    subworkflow and the one embedded in the workflow a submitted job actually carries."""
    subworkflow = subworkflows_data["filesMapByName"]["espresso/formation_energy.json"]
    workflow = workflows_data["filesMapByName"]["espresso/formation_energy.json"]
    units = list(subworkflow["units"])
    for nested in workflow["subworkflows"]:
        units.extend(nested["units"])

    expressions = [u["value"] for u in units if u["name"] == "assign-precision-for-material"]
    assert len(expressions) == 2, "expected the expression in both shipped copies"
    return expressions


@pytest.mark.parametrize("expression", _precision_expressions())
def test_precision_expression_falls_back_when_kgrid_absent(expression):
    """A unit context only carries a kgrid entry when the grid was explicitly set. On the
    default path the expression must not raise, and must emit the schema defaults for an
    unreported precision -- null is not permitted by core/reusable/formation-energy-contribution."""
    assert eval(expression, {"__builtins__": {}}, {"context": {}}) == {
        "precision_value": -1,
        "precision_metric": "unknown",
    }


@pytest.mark.parametrize("expression", _precision_expressions())
def test_precision_expression_reports_explicitly_set_kgrid(expression):
    context = {"kgrid": {"gridMetricValue": 128, "gridMetricType": "KPPRA"}}

    assert eval(expression, {"__builtins__": {}}, {"context": context}) == {
        "precision_value": 128,
        "precision_metric": "KPPRA",
    }
