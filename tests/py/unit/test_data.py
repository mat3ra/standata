from mat3ra.standata.data.applications import applications_data
from mat3ra.standata.data.materials import materials_data
from mat3ra.standata.data.methods import methods_data
from mat3ra.standata.data.models import models_data
from mat3ra.standata.data.properties import properties_data
from mat3ra.standata.data.subworkflows import subworkflows_data
from mat3ra.standata.data.workflows import workflows_data


def test_standata_data_import():
    """Test that all standata data modules are imported correctly."""
    assert applications_data is not None
    assert materials_data is not None
    assert subworkflows_data is not None
    assert workflows_data is not None
    assert methods_data is not None
    assert models_data is not None
    assert properties_data is not None
