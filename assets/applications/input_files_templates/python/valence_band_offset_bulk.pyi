# Valence band offset of a periodic superlattice from its two bulks (bulk method):
#   VBO = (E_VBM - V)_left - (E_VBM - V)_right + (V_left - V_right)_interface
# V of a bulk: the mean of its planar-averaged electrostatic potential. V in the interface: the planar average smoothed
# by a double convolution with the bulks' plane periods (Junquera et al. 2007), at the centre of each block.
import json

import numpy as np
from mat3ra.made.material import Material

PLANE_POSITION_TOLERANCE = 1e-3  # crystal coordinate along c


def get_plane_period(bulk):
    """Spacing of the (001) planes over the largest n whose c/n shift maps every atom onto one of its element."""
    heights = np.array(bulk.basis.coordinates.get_values_along_axis("z"))
    elements = np.array(bulk.basis.elements.values)
    for count in range(len(elements), 0, -1):
        distances = np.abs((heights[:, None] + 1 / count - heights + 0.5) % 1 - 0.5)
        if np.all(np.where(elements[:, None] == elements, distances, 1).min(axis=1) < PLANE_POSITION_TOLERANCE):
            return 1 / bulk.lattice.reciprocal_vector_norms[2] / count


def get_block_center(own_heights, other_heights):
    """Centre of a block: opposite the widest gap between its own atoms, or in the widest gap between the other's."""
    marker_heights, shift = (own_heights, 0.5) if len(own_heights) else (other_heights, 0)
    sorted_heights = np.sort(marker_heights % 1)
    gaps = np.diff(sorted_heights, append=sorted_heights[0] + 1)
    return (sorted_heights[np.argmax(gaps)] + gaps.max() / 2 + shift) % 1


# The checkpoint rupy writes: the three materials, VBM_LEFT/RIGHT and each average.x unit's average_potential_profile.
with open("./.mat3ra/checkpoint") as checkpoint_file:
    scope = json.load(checkpoint_file)["scope"]
materials = [Material.create(scope["global"][operand]) for operand in ("INTERFACE", "BULK_LEFT", "BULK_RIGHT")]
for material in materials:
    material.to_crystal()
interface, left, right = materials
interface_profile, left_profile, right_profile = [
    scope["local"][f"average-electrostatic-potential{side}"]["average_potential_profile"]["yDataSeries"][0]
    for side in ("", "-left", "-right")
]
bulk_in_plane = [[bulk.lattice.a, bulk.lattice.b, bulk.lattice.gamma] for bulk in (left, right)]
if not np.allclose(bulk_in_plane, [interface.lattice.a, interface.lattice.b, interface.lattice.gamma]):
    raise ValueError("Interface Left/Right need the Interface's a, b: same lengths, angle and order.")
cell_height = 1 / interface.lattice.reciprocal_vector_norms[2]
plane_periods = [get_plane_period(bulk) for bulk in (left, right)]
elements = np.array(interface.basis.elements.values)
left_elements, right_elements = set(left.basis.elements.values), set(right.basis.elements.values)
if not left_elements | right_elements <= set(elements) or cell_height <= 2 * sum(plane_periods):
    raise ValueError("Interface too thin or missing a bulk element: check the material order.")
heights = np.array(interface.basis.coordinates.get_values_along_axis("z"))
left_heights = heights[np.isin(elements, list(left_elements - right_elements))]
right_heights = heights[np.isin(elements, list(right_elements - left_elements))]
centers = [get_block_center(left_heights, right_heights), get_block_center(right_heights, left_heights)]
coefficients = np.fft.rfft(interface_profile)
for plane_period in plane_periods:
    coefficients *= np.sinc(np.arange(len(coefficients)) * plane_period / cell_height)
macroscopic_average = np.fft.irfft(coefficients, len(interface_profile))
sample_positions = np.arange(len(macroscopic_average)) / len(macroscopic_average)
left_block, right_block = np.interp(centers, sample_positions, macroscopic_average, period=1)
bulk_term = scope["global"]["VBM_LEFT"] - np.mean(left_profile) - scope["global"]["VBM_RIGHT"] + np.mean(right_profile)
print(json.dumps({"valence_band_offset": bulk_term + left_block - right_block}))
