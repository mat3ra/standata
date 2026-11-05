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
MATERIAL_OPERANDS = ["INTERFACE", "BULK_LEFT", "BULK_RIGHT"]
VALENCE_BAND_MAXIMUM_OPERANDS = ["VBM_LEFT", "VBM_RIGHT"]
PLANE_POSITION_TOLERANCE = 1e-3  # crystal coordinate along the normal


class LayeredMaterial(Material):
    """A made Material read along c, the stacking axis of the interface: its atomic planes and their period."""

    @property
    def heights(self):
        """Crystal coordinates of the atoms along c."""
        return np.array(self.basis.coordinates.get_values_along_axis("z"))

    @property
    def cell_height(self):
        """Height of the cell normal to a, b (Å): the (001) interplanar spacing."""
        return 1 / self.lattice.reciprocal_vector_norms[2]

    def is_plane_shift(self, shift):
        """Whether moving every atom by `shift` along the normal lands it on an atom of the same element."""
        heights, elements = self.heights, np.array(self.basis.elements.values)
        distances = np.abs((heights[:, None] + shift - heights[None, :] + 0.5) % 1 - 0.5)
        distances[elements[:, None] != elements[None, :]] = 1
        return bool(np.all(distances.min(axis=1) < PLANE_POSITION_TOLERANCE))

    @property
    def plane_period(self):
        """Plane spacing along the normal: the cell height over the largest n for which a c/n shift is a plane shift."""
        counts = range(1, self.basis.number_of_atoms + 1)
        return self.cell_height / max(count for count in counts if self.is_plane_shift(1 / count))


def get_largest_gap_center(heights):
    """Centre of the widest interval free of the given crystal coordinates on the periodic cell."""
    sorted_heights = np.sort(heights % 1)
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


def check_materials(interface, left, right):
    """Raise when Interface Left/Right are off the Interface's a, b, or its blocks are thin for their plane periods."""
    in_plane_parameters = [
        [material.lattice.a, material.lattice.b, material.lattice.gamma] for material in (interface, left, right)
    ]
    if not np.allclose(in_plane_parameters[1:], in_plane_parameters[0]):
        raise ValueError("Interface Left/Right need the Interface's a, b: same lengths, angle and order.")
    if interface.cell_height <= 2 * (left.plane_period + right.plane_period):
        raise ValueError(
            "Each Interface block must be thicker than the two plane periods combined: check the material order."
        )


def get_valence_band_offset(interface, left, right, planar_averages, valence_band_maxima):
    """VBM left - VBM right (eV), aligned by the interface's potential; planar averages: interface, left, right."""
    interface_planar_average, left_planar_average, right_planar_average = planar_averages
    left_valence_band_maximum, right_valence_band_maximum = valence_band_maxima
    window_lengths = [left.plane_period, right.plane_period]
    macroscopic_average = get_macroscopic_average(interface_planar_average, interface.cell_height, window_lengths)
    sample_positions = np.arange(len(macroscopic_average)) / len(macroscopic_average)
    elements = np.array(interface.basis.elements.values)
    centers = get_block_centers(elements, interface.heights, left.basis.elements.values, right.basis.elements.values)
    left_block_potential, right_block_potential = np.interp(centers, sample_positions, macroscopic_average, period=1)
    left_bulk_term = left_valence_band_maximum - np.mean(left_planar_average)
    right_bulk_term = right_valence_band_maximum - np.mean(right_planar_average)
    return left_bulk_term - right_bulk_term + left_block_potential - right_block_potential


if __name__ == "__main__":
    with open(CHECKPOINT_FILE) as checkpoint_file:
        scope = json.load(checkpoint_file)["scope"]
    profiles = [scope["local"][flowchart_id]["average_potential_profile"] for flowchart_id in AVERAGE_FLOWCHART_IDS]
    planar_averages = [profile["yDataSeries"][0] for profile in profiles]
    interface, left, right = [LayeredMaterial.create(scope["global"][operand]) for operand in MATERIAL_OPERANDS]
    for material in (interface, left, right):
        material.to_crystal()
    valence_band_maxima = [scope["global"][operand] for operand in VALENCE_BAND_MAXIMUM_OPERANDS]
    check_materials(interface, left, right)
    valence_band_offset = get_valence_band_offset(interface, left, right, planar_averages, valence_band_maxima)
    print(json.dumps({"valence_band_offset": valence_band_offset}))
