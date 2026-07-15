from types import SimpleNamespace

import pytest

from mat3ra.standata.subworkflows import SubworkflowStandata
from mat3ra.standata.workflows import WorkflowStandata

APP = SimpleNamespace(ESPRESSO="espresso", SHELL="shell")
WORKFLOW = SimpleNamespace(
    NAME="Defect Formation Energy",
    FILENAME="espresso/defect_formation_energy.json",
    PROPERTY="defect_formation_energy",
)
SUBWORKFLOW = SimpleNamespace(
    COMPUTE_NAME="Defect Formation Energy",
    COMPUTE_FILENAME="espresso/defect_formation_energy.json",
    RESOLVE_NAME="Resolve Elemental Materials",
    RESOLVE_FILENAME="shell/utils/resolve_elemental_materials.json",
)

# Vacancy sign check: ΔN = −1 ⇒ E_defect = E_defective − E_pristine + μ
ENERGY_DEFECTIVE_ELECTRON_VOLTS = -10.0
ENERGY_PRISTINE_ELECTRON_VOLTS = -12.0
CHEMICAL_POTENTIAL_ELECTRON_VOLTS = 4.0
DELTA_N_VACANCY = -1
EXPECTED_DEFECT_FORMATION_ENERGY_ELECTRON_VOLTS = (
    ENERGY_DEFECTIVE_ELECTRON_VOLTS
    - ENERGY_PRISTINE_ELECTRON_VOLTS
    - DELTA_N_VACANCY * CHEMICAL_POTENTIAL_ELECTRON_VOLTS
)


def test_defect_formation_energy_workflow_resolves():
    workflow = WorkflowStandata.filter_by_application(APP.ESPRESSO).get_by_name_first_match(
        WORKFLOW.FILENAME
    )
    assert workflow["name"] == WORKFLOW.NAME
    assert workflow.get("isMultiMaterial") is True
    assert WORKFLOW.PROPERTY in workflow["properties"]


def test_defect_formation_energy_compute_subworkflow_resolves():
    subworkflow = SubworkflowStandata.filter_by_application(APP.ESPRESSO).get_by_name_first_match(
        SUBWORKFLOW.COMPUTE_FILENAME
    )
    assert subworkflow["name"] == SUBWORKFLOW.COMPUTE_NAME
    assert WORKFLOW.PROPERTY in subworkflow["properties"]


def test_resolve_elemental_materials_subworkflow_resolves():
    subworkflow = SubworkflowStandata.filter_by_application(APP.SHELL).get_by_name_first_match(
        SUBWORKFLOW.RESOLVE_FILENAME
    )
    assert subworkflow["name"] == SUBWORKFLOW.RESOLVE_NAME


@pytest.mark.parametrize(
    "energy_defective, energy_pristine, delta_n, chemical_potential, expected",
    [
        (
            ENERGY_DEFECTIVE_ELECTRON_VOLTS,
            ENERGY_PRISTINE_ELECTRON_VOLTS,
            DELTA_N_VACANCY,
            CHEMICAL_POTENTIAL_ELECTRON_VOLTS,
            EXPECTED_DEFECT_FORMATION_ENERGY_ELECTRON_VOLTS,
        ),
    ],
)
def test_defect_formation_energy_vacancy_formula(
    energy_defective, energy_pristine, delta_n, chemical_potential, expected
):
    defect_formation_energy = energy_defective - energy_pristine - delta_n * chemical_potential
    assert defect_formation_energy == expected
    assert expected == 6.0
