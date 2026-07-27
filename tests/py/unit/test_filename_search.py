import pytest

from mat3ra.standata.filename_search import rank_filenames
from mat3ra.standata.materials import Materials

WORKFLOW_BAND_GAP = "espresso/band_gap.json"
WORKFLOW_BAND_GAP_HSE = "espresso/band_gap_dos_hse.json"
WORKFLOW_FORMATION_ENERGY = "espresso/formation_energy.json"
WORKFLOW_DEFECT_FORMATION_ENERGY = "espresso/defect_formation_energy.json"
MATERIAL_OXYGEN = "O2-[Oxygen]-MCLC_[C2%2Fm]_3D_[Bulk]-[mp-12957].json"
MATERIAL_SILICA = "SiO2-[Quartz]-HEX_[P3_121]_3D_[Bulk]-[mp-7000].json"

QUERY_BAND_GAP = "band_gap"
QUERY_OXYGEN = "O2"
QUERY_BAD_GAP = "bad_gap"

FORMATION_ENERGY_CANDIDATES = [WORKFLOW_DEFECT_FORMATION_ENERGY, WORKFLOW_FORMATION_ENERGY]


@pytest.mark.parametrize(
    ("query", "filenames", "expected_order"),
    [
        (QUERY_BAND_GAP, [WORKFLOW_BAND_GAP_HSE, WORKFLOW_BAND_GAP], [WORKFLOW_BAND_GAP, WORKFLOW_BAND_GAP_HSE]),
        (QUERY_OXYGEN, [MATERIAL_SILICA, MATERIAL_OXYGEN], [MATERIAL_OXYGEN, MATERIAL_SILICA]),
        (
            "formation_energy",
            FORMATION_ENERGY_CANDIDATES,
            [WORKFLOW_FORMATION_ENERGY, WORKFLOW_DEFECT_FORMATION_ENERGY],
        ),
    ],
)
def test_rank_filenames_ranks_the_intended_match_first(query, filenames, expected_order):
    assert rank_filenames(query, filenames) == expected_order


@pytest.mark.parametrize(
    ("query_with_extension", "query_bare"),
    [
        ("formation_energy.json", "formation_energy"),
        ("defect_formation_energy.json", "defect_formation_energy"),
        ("band_gap.json", "band_gap"),
    ],
)
def test_rank_filenames_ignores_trailing_extension(query_with_extension, query_bare):
    candidates = FORMATION_ENERGY_CANDIDATES + [WORKFLOW_BAND_GAP, WORKFLOW_BAND_GAP_HSE]
    assert rank_filenames(query_with_extension, candidates) == rank_filenames(query_bare, candidates)
    assert rank_filenames(query_with_extension, candidates), "extension-suffixed query must still match"


def test_rank_filenames_rejects_typo_queries():
    assert rank_filenames(QUERY_BAD_GAP, [WORKFLOW_BAND_GAP_HSE, WORKFLOW_BAND_GAP]) == []


def test_materials_get_by_name_first_match_prefers_exact_formula():
    material = Materials.get_by_name_first_match(QUERY_OXYGEN)
    assert material["name"].startswith("O2, Oxygen")
