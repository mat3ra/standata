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


def _precision_expression():
    subworkflow = subworkflows_data["filesMapByName"]["espresso/formation_energy.json"]
    unit = next(u for u in subworkflow["units"] if u["name"] == "assign-precision-for-material")
    return unit["value"]


def test_precision_expression_handles_unit_context_without_kgrid():
    """A unit context only carries a kgrid entry when the grid was explicitly set, so the
    default path evaluates this expression against an empty scope and must not raise."""
    assert eval(_precision_expression(), {}, {"context": {}}) == {
        "precision_value": None,
        "precision_metric": None,
    }


def test_precision_expression_reports_explicitly_set_kgrid():
    context = {"kgrid": {"gridMetricValue": 128, "gridMetricType": "KPPRA"}}

    assert eval(_precision_expression(), {}, {"context": context}) == {
        "precision_value": 128,
        "precision_metric": "KPPRA",
    }
