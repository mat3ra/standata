# Valence band offset of a periodic superlattice from its two bulks (bulk method):
#   VBO = (E_VBM - V)_left - (E_VBM - V)_right + (V_left - V_right)_interface
# V of a bulk: the mean of its planar-averaged electrostatic potential. V in the interface: the planar average smoothed
# by a double convolution with the bulks' plane periods (Junquera et al. 2007), at the centre of each block.
import json

import numpy as np
from mat3ra.made.material import Material

# Data From Context
# -----------------
# rupy writes CHECKPOINT_FILE. scope.local: average_potential_profile of each average.x unit (AVERAGE_FLOWCHART_IDS).
# scope.global: the materials from "Get Material By Index" (MATERIAL_OPERANDS) and VBM_LEFT/RIGHT from "Set Valence
# Band Maximum".
CHECKPOINT_FILE = "./.mat3ra/checkpoint"
AVERAGE_FLOWCHART_IDS = [
    "average-electrostatic-potential",
    "average-electrostatic-potential-left",
    "average-electrostatic-potential-right",
]
MATERIAL_OPERANDS = ["INTERFACE", "LEFT_BULK", "RIGHT_BULK"]
VALENCE_BAND_MAXIMUM_OPERANDS = ["VBM_LEFT", "VBM_RIGHT"]
PLANE_POSITION_TOLERANCE = 1e-3  # crystal coordinate along the normal


def get_heights(material):
    """Crystal coordinates of the atoms along c."""
    material.to_crystal()
    return np.array(material.basis.coordinates.get_values_along_axis("z"))


def get_cell_height(material):
    """Height of the cell normal to a, b (Å): its volume over the area spanned by a and b."""
    vector_a, vector_b, _ = material.lattice.vector_arrays
    return material.lattice.cell_volume / np.linalg.norm(np.cross(vector_a, vector_b))


def is_plane_shift(material, shift):
    """Whether moving every atom by `shift` along the normal lands it on an atom of the same element."""
    heights, elements = get_heights(material), np.array(material.basis.elements.values)
    distances = np.abs((heights[:, None] + shift - heights[None, :] + 0.5) % 1 - 0.5)
    distances[elements[:, None] != elements[None, :]] = 1
    return bool(np.all(distances.min(axis=1) < PLANE_POSITION_TOLERANCE))


def get_plane_period(material):
    """Plane spacing along the normal: cell height over the largest n whose c/n shift maps the atoms onto themselves."""
    counts = range(1, material.basis.number_of_atoms + 1)
    return get_cell_height(material) / max(count for count in counts if is_plane_shift(material, 1 / count))


def get_largest_gap_center(heights):
    """Centre of the widest interval free of the given crystal coordinates on the periodic cell."""
    sorted_heights = np.sort(heights)
    gaps = np.diff(sorted_heights, append=sorted_heights[0] + 1)
    return (sorted_heights[np.argmax(gaps)] + gaps.max() / 2) % 1


def get_block_center(heights, is_own_marker, is_other_marker):
    """Centre of a block: the middle of its marker atoms, or of the gap between the other block's."""
    if is_own_marker.any():
        return (get_largest_gap_center(heights[is_own_marker]) + 0.5) % 1
    return get_largest_gap_center(heights[is_other_marker])


def get_block_centers(elements, heights, left_elements, right_elements):
    """Crystal coordinates of the centres of the left and right blocks of the interface."""
    if not set(left_elements) | set(right_elements) <= set(elements):
        raise ValueError("Interface Left/Right hold an element the Interface lacks: check the material order.")
    is_left_marker = np.isin(elements, list(set(left_elements) - set(right_elements)))
    is_right_marker = np.isin(elements, list(set(right_elements) - set(left_elements)))
    if not is_left_marker.any() and not is_right_marker.any():
        raise ValueError("No element of the interface occurs in only one bulk: the blocks cannot be located.")
    return [
        get_block_center(heights, is_left_marker, is_right_marker),
        get_block_center(heights, is_right_marker, is_left_marker),
    ]


def get_macroscopic_average(planar_average, cell_height, window_lengths):
    """Planar average convolved on the periodic cell with a box window of each length."""
    coefficients = np.fft.rfft(planar_average)
    for window_length in window_lengths:
        coefficients *= np.sinc(np.arange(len(coefficients)) * window_length / cell_height)
    return np.fft.irfft(coefficients, len(planar_average))


def get_valence_band_offset(profiles, materials, valence_band_maxima):
    """VBM left - VBM right (eV), aligned by the interface's potential; profiles, materials: interface, left, right."""
    interface, left, right = materials
    in_plane_parameters = [[material.lattice.a, material.lattice.b, material.lattice.gamma] for material in materials]
    if not np.allclose(in_plane_parameters[1:], in_plane_parameters[0]):
        raise ValueError("Interface Left/Right need the Interface's a, b: same lengths, angle and order.")
    plane_periods = [get_plane_period(bulk) for bulk in (left, right)]
    cell_height = get_cell_height(interface)
    if cell_height <= 2 * sum(plane_periods):
        raise ValueError(
            "Each Interface block must be thicker than the two plane periods combined: check the material order."
        )
    macroscopic_average = get_macroscopic_average(profiles[0]["yDataSeries"][0], cell_height, plane_periods)
    sample_positions = np.arange(len(macroscopic_average)) / len(macroscopic_average)
    elements = [material.basis.elements.values for material in materials]
    centers = get_block_centers(np.array(elements[0]), get_heights(interface), *elements[1:])
    left_block_potential, right_block_potential = np.interp(centers, sample_positions, macroscopic_average, period=1)
    left_bulk_potential, right_bulk_potential = [np.mean(profile["yDataSeries"][0]) for profile in profiles[1:]]
    bulk_term = (valence_band_maxima[0] - left_bulk_potential) - (valence_band_maxima[1] - right_bulk_potential)
    return bulk_term + left_block_potential - right_block_potential


if __name__ == "__main__":
    with open(CHECKPOINT_FILE) as checkpoint_file:
        scope = json.load(checkpoint_file)["scope"]
    profiles = [scope["local"][flowchart_id]["average_potential_profile"] for flowchart_id in AVERAGE_FLOWCHART_IDS]
    materials = [Material.create(scope["global"][operand]) for operand in MATERIAL_OPERANDS]
    valence_band_maxima = [scope["global"][operand] for operand in VALENCE_BAND_MAXIMUM_OPERANDS]
    print(json.dumps({"valence_band_offset": get_valence_band_offset(profiles, materials, valence_band_maxima)}))
