from types import SimpleNamespace

import pytest

from mat3ra.standata.applications import ApplicationStandata
from mat3ra.standata.data.subworkflows import subworkflows_data
from mat3ra.standata.subworkflows import SubworkflowStandata
from mat3ra.utils.assertion import assert_deep_almost_equal

APP = SimpleNamespace(ESPRESSO="espresso", VASP="vasp", PYTHON="python", SHELL="shell", NWCHEM="nwchem")
SUBWORKFLOW = SimpleNamespace(
    SEARCH_NAME="pw_scf",
    FILENAME="espresso/pw_scf.json",
    EXACT_NAME="pw-scf",
    RELAXATION_NAME="Variable-cell Relaxation",
)


def test_get_by_name():
    subworkflow = SubworkflowStandata.get_by_name_first_match(SUBWORKFLOW.SEARCH_NAME)
    assert type(subworkflow) == dict
    assert "name" in subworkflow
    assert SUBWORKFLOW.EXACT_NAME in subworkflow["name"]


def test_get_by_categories():
    subworkflows = SubworkflowStandata.get_by_categories(APP.ESPRESSO)
    assert isinstance(subworkflows, list)
    assert len(subworkflows) >= 1
    assert isinstance(subworkflows[0], dict)


def test_get_subworkflow_data():
    subworkflow = subworkflows_data["filesMapByName"][SUBWORKFLOW.FILENAME]
    assert type(subworkflow) == dict
    assert "name" in subworkflow
    assert subworkflow["name"] == SUBWORKFLOW.EXACT_NAME


def test_get_by_name_and_categories():
    subworkflow = SubworkflowStandata.get_by_name_and_categories(SUBWORKFLOW.SEARCH_NAME, APP.ESPRESSO)
    assert type(subworkflow) == dict
    assert "name" in subworkflow
    assert APP.ESPRESSO in str(subworkflow.get("application", {})).lower() or APP.ESPRESSO in str(subworkflow)


def test_get_as_list():
    subworkflows_list = SubworkflowStandata.get_as_list()
    assert isinstance(subworkflows_list, list)
    assert len(subworkflows_list) >= 1
    assert isinstance(subworkflows_list[0], dict)
    assert "name" in subworkflows_list[0]


def test_filter_by_application_and_get_by_name():
    subworkflow = SubworkflowStandata.filter_by_application(APP.ESPRESSO).get_by_name_first_match(
        SUBWORKFLOW.SEARCH_NAME)
    assert type(subworkflow) == dict
    assert "name" in subworkflow
    assert subworkflow["name"] == SUBWORKFLOW.EXACT_NAME
    assert APP.ESPRESSO in str(subworkflow.get("application", {})).lower()


@pytest.mark.parametrize(
    "application,expected_name",
    [
        (APP.ESPRESSO, SUBWORKFLOW.RELAXATION_NAME),
        (APP.VASP, SUBWORKFLOW.RELAXATION_NAME),
        (APP.PYTHON, None),
        (APP.SHELL, None),
        (APP.NWCHEM, None),
    ],
)
def test_get_relaxation_by_application(application, expected_name):
    result = SubworkflowStandata.get_relaxation_by_application(application)
    assert isinstance(result, dict)
    if expected_name is None:
        assert result == {}
    else:
        assert result.get("name") == expected_name
        assert application in str(result.get("application", {})).lower()

        expected_app_data = ApplicationStandata.get_by_name_first_match(application)
        actual_app_data = result.get("application", {})
        assert_deep_almost_equal(expected_app_data, actual_app_data)


def test_get_default():
    result = SubworkflowStandata.get_default()
    assert isinstance(result, dict)
    assert result.get("name") == "Total Energy"
