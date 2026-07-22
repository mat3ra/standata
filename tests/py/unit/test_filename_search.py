import pytest

from mat3ra.standata.filename_search import rank_filenames
from mat3ra.standata.materials import Materials

WORKFLOW_BAND_GAP = "espresso/band_gap.json"
WORKFLOW_BAND_GAP_HSE = "espresso/band_gap_dos_hse.json"
MATERIAL_OXYGEN = "O2-[Oxygen]-MCLC_[C2%2Fm]_3D_[Bulk]-[mp-12957].json"
MATERIAL_SILICA = "SiO2-[Quartz]-HEX_[P3_121]_3D_[Bulk]-[mp-7000].json"

QUERY_BAND_GAP = "band_gap"
QUERY_OXYGEN = "O2"
QUERY_BAD_GAP = "bad_gap"


@pytest.mark.parametrize(
    ("query", "filenames", "expected_order"),
    [
        (QUERY_BAND_GAP, [WORKFLOW_BAND_GAP_HSE, WORKFLOW_BAND_GAP], [WORKFLOW_BAND_GAP, WORKFLOW_BAND_GAP_HSE]),
        (QUERY_OXYGEN, [MATERIAL_SILICA, MATERIAL_OXYGEN], [MATERIAL_OXYGEN, MATERIAL_SILICA]),
    ],
)
def test_rank_filenames_ranks_the_intended_match_first(query, filenames, expected_order):
    assert rank_filenames(query, filenames) == expected_order


def test_rank_filenames_rejects_typo_queries():
    assert rank_filenames(QUERY_BAD_GAP, [WORKFLOW_BAND_GAP_HSE, WORKFLOW_BAND_GAP]) == []


def test_materials_get_by_name_first_match_prefers_exact_formula():
    material = Materials.get_by_name_first_match(QUERY_OXYGEN)
    assert material["name"].startswith("O2, Oxygen")
