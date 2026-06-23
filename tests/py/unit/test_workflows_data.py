from types import SimpleNamespace

from mat3ra.standata.data.workflows import workflows_data
from mat3ra.standata.workflows import WorkflowStandata

APP = SimpleNamespace(ESPRESSO="espresso")
WORKFLOW = SimpleNamespace(
    SEARCH_NAME="band_gap",
    FILENAME="espresso/band_gap.json",
    EXACT_NAME="Band Gap",
    FILTERED_NAME="Band Gap + DoS - HSE",
)


def test_get_by_name():
    workflow = WorkflowStandata.get_by_name_first_match(WORKFLOW.SEARCH_NAME)
    assert type(workflow) == dict
    assert "name" in workflow
    assert WORKFLOW.FILTERED_NAME in workflow["name"]


def test_get_by_categories():
    workflows = WorkflowStandata.get_by_categories(APP.ESPRESSO)
    assert isinstance(workflows, list)
    assert len(workflows) >= 1
    assert isinstance(workflows[0], dict)


def test_get_workflow_data():
    workflow = workflows_data["filesMapByName"][WORKFLOW.FILENAME]
    assert type(workflow) == dict
    assert "name" in workflow
    assert workflow["name"] == WORKFLOW.EXACT_NAME


def test_get_by_name_and_categories():
    workflow = WorkflowStandata.get_by_name_and_categories(WORKFLOW.SEARCH_NAME, APP.ESPRESSO)
    assert type(workflow) == dict
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
    assert type(workflow) == dict
    assert "name" in workflow
    assert workflow["name"] == WORKFLOW.FILTERED_NAME
    assert APP.ESPRESSO in str(workflow.get("application", {})).lower()
