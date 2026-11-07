# ----------------------------------------------------------- #
# This script averages an array along c over each bulk block  #
# of an interface, in a window as tall as that bulk's cell,   #
# centred on the block's own atoms.                           #
# Note: This template expects the array and the materials to  #
# be defined in the context (see details below).              #
# ----------------------------------------------------------- #
import json

import numpy as np

# Data From Context
# -----------------
# 'array_from_context': the profile along c of the interface, a 1D list sampled over its cell.
# INTERFACE, BULK_LEFT, BULK_RIGHT: the materials assigned by preceding units.
{% raw %}profile = np.array({{array_from_context}})
INTERFACE, BULK_LEFT, BULK_RIGHT = json.loads(r"""{{ [INTERFACE, BULK_LEFT, BULK_RIGHT] | tojson }}"""){% endraw %}


def get_cell_height(lattice):
    """Cell height normal to a, b (Å): V / |a x b| from the lattice parameters."""
    cosines = np.cos(np.radians([lattice["alpha"], lattice["beta"], lattice["gamma"]]))
    return lattice["c"] * np.sqrt(1 - cosines @ cosines + 2 * cosines.prod()) / np.sqrt(1 - cosines[2] ** 2)


# Find Block Averages
# -------------------
interface_elements, left_elements, right_elements = [
    np.array([element["value"] for element in material["basis"]["elements"]])
    for material in (INTERFACE, BULK_LEFT, BULK_RIGHT)
]
coordinates = np.array([coordinate["value"] for coordinate in INTERFACE["basis"]["coordinates"]])
if INTERFACE["basis"]["units"] == "cartesian":
    coordinates = coordinates @ np.linalg.inv([INTERFACE["lattice"]["vectors"][axis] for axis in "abc"])
heights = coordinates[:, 2] % 1
positions = np.arange(len(profile)) / len(profile)
averages = []
for bulk, own_elements, other_elements in (
    (BULK_LEFT, left_elements, right_elements),
    (BULK_RIGHT, right_elements, left_elements),
):
    block_heights = np.sort(heights[np.isin(interface_elements, np.setdiff1d(own_elements, other_elements))])
    # the block's centre is the middle of its atoms: half a cell from the middle of the widest gap between them
    gaps = np.diff(block_heights, append=block_heights[0] + 1)
    center = (block_heights[np.argmax(gaps)] + gaps.max() / 2 + 0.5) % 1
    window = get_cell_height(bulk["lattice"]) / get_cell_height(INTERFACE["lattice"])
    averages.append(profile[np.abs((positions - center + 0.5) % 1 - 0.5) <= window / 2].mean())

# print final values to standard output (STDOUT),
# so that they can be read by a subsequent assignment unit (using value=STDOUT)
print(json.dumps({"averages": averages}, indent=4))
