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
# INTERFACE, BULK_LEFT, BULK_RIGHT: the materials, in crystal coordinates, assigned by preceding units.
{% raw %}Y = np.array({{array_from_context}})
INTERFACE, BULK_LEFT, BULK_RIGHT = json.loads(r"""{{ [INTERFACE, BULK_LEFT, BULK_RIGHT] | tojson }}"""){% endraw %}


def get_height(lattice):
    """Cell height normal to a, b (Å): V / |a x b| from the lattice parameters."""
    cosines = np.cos(np.radians([lattice["alpha"], lattice["beta"], lattice["gamma"]]))
    return lattice["c"] * np.sqrt(1 - cosines @ cosines + 2 * cosines.prod()) / np.sqrt(1 - cosines[2] ** 2)


# Find Block Averages
# -------------------
elements = [np.array([e["value"] for e in m["basis"]["elements"]]) for m in (INTERFACE, BULK_LEFT, BULK_RIGHT)]
heights = np.array([coordinate["value"][2] for coordinate in INTERFACE["basis"]["coordinates"]]) % 1
positions = np.arange(len(Y)) / len(Y)
averages = []
for bulk, own, other in ((BULK_LEFT, elements[1], elements[2]), (BULK_RIGHT, elements[2], elements[1])):
    is_own, is_other = np.isin(elements[0], np.setdiff1d(own, other)), np.isin(elements[0], np.setdiff1d(other, own))
    markers, shift = (heights[is_own], 0.5) if is_own.any() else (heights[is_other], 0)
    sorted_markers = np.sort(markers)
    gaps = np.diff(sorted_markers, append=sorted_markers[0] + 1)
    center = (sorted_markers[np.argmax(gaps)] + gaps.max() / 2 + shift) % 1
    window = get_height(bulk["lattice"]) / get_height(INTERFACE["lattice"])
    averages.append(Y[np.abs((positions - center + 0.5) % 1 - 0.5) <= window / 2].mean())

# print final values to standard output (STDOUT),
# so that they can be read by a subsequent assignment unit (using value=STDOUT)
print(json.dumps({"averages": averages}, indent=4))
