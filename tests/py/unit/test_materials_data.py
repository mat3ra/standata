import pytest
from mat3ra.esse.models.apse.db.third_party_sources import Source
from mat3ra.standata.data.materials import materials_data
from mat3ra.standata.materials import Materials

EQUAL_PARAMETERS_BY_LATTICE_TYPE = {
    "CUB": {"b": "a", "c": "a"},
    "FCC": {"b": "a", "c": "a"},
    "BCC": {"b": "a", "c": "a"},
    "RHL": {"b": "a", "c": "a", "beta": "alpha", "gamma": "alpha"},
    "HEX": {"b": "a"},
    "TET": {"b": "a"},
    "BCT": {"b": "a", "c": "a", "beta": "alpha"},
}
ANGLES_BY_LATTICE_TYPE = {
    "CUB": {"alpha": 90.0, "beta": 90.0, "gamma": 90.0},
    "FCC": {"alpha": 60.0, "beta": 60.0, "gamma": 60.0},
    "BCC": {"alpha": 109.4712, "beta": 109.4712, "gamma": 109.4712},
    "RHL": {},
    "HEX": {"alpha": 90.0, "beta": 90.0, "gamma": 120.0},
    "TET": {"alpha": 90.0, "beta": 90.0, "gamma": 90.0},
    "BCT": {},
}


@pytest.mark.parametrize(
    "filename",
    [
        filename
        for filename, material in materials_data["filesMapByName"].items()
        if material["external"]["source"] == Source.MaterialsProject.value
        and material["lattice"]["type"] in ANGLES_BY_LATTICE_TYPE
    ],
)
def test_lattice_type_equalities(filename):
    lattice = materials_data["filesMapByName"][filename]["lattice"]
    for key, equal_key in EQUAL_PARAMETERS_BY_LATTICE_TYPE[lattice["type"]].items():
        assert lattice[key] == lattice[equal_key]
    for key, angle in ANGLES_BY_LATTICE_TYPE[lattice["type"]].items():
        assert lattice[key] == angle


def test_standata_materials_init():
    """Materials class is initialized with data based on materials_data"""
    assert Materials.data.standataConfig.entities is not None
    assert len(Materials.data.standataConfig.entities) >= 1
    assert isinstance(Materials.data.filesMapByName.dictionary, dict)
    assert len(Materials.data.filesMapByName.dictionary) >= 1


def test_categories_data():
    """Category map has at least one group of tags."""
    std_materials = Materials
    assert Materials.data.standataConfig.categories is not None
    assert len(std_materials.data.standataConfig.categories) >= 1


def test_get_by_name():
    material = Materials.get_by_name_first_match("Graphene")
    assert type(material) is dict
    assert material["name"] == "C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993"
    assert material["isNonPeriodic"] is False


def test_get_by_categories():
    material = Materials.get_by_categories("2D")
    assert isinstance(material, list)
    assert material[0]["name"] == "C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993"


def test_get_material_data():
    material = materials_data["filesMapByName"]["C-[Graphene]-HEX_[P6%2Fmmm]_2D_[Monolayer]-[2dm-3993].json"]
    assert type(material) is dict
    assert material["name"] == "C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993"
    assert material["isNonPeriodic"] is False


def test_get_by_name_and_categories():
    material = Materials.get_by_name_and_categories("MoS2", "2D")
    assert type(material) is dict
    assert material["name"] == "MoS2, Molybdenum Disulfide, HEX (P-6m2) 2D (Monolayer), 2dm-3150"
    assert material["isNonPeriodic"] is False
