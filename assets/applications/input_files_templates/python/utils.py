# ---------------------------------------------------------------- #
#                                                                  #
#  Utility functions for Mat3ra.com platform Python applications.  #
#                                                                  #
#  Will be used as follows:                                        #
#                                                                  #
#    1. organize all the utility functions in this single file     #
#                                                                  #
#  Add additional utility functions as needed.                     #
#                                                                  #
# ---------------------------------------------------------------- #

import json
import matplotlib.pyplot as plt
import numpy as np
from ase.data import covalent_radii
from ase.io.utils import PlottingVariables
from ase.visualize.plot import plot_atoms


def get_material_from_context_variable() -> dict:
    """Return the job's input material as a plain Python `dict`.

    The MATERIAL Jinja2 expression below is substituted by rupy at job
    submission; the surrounding raw markers shield it from the Standata
    build's Nunjucks pass, the raw triple-quoted Python string keeps Python
    from re-parsing the JSON's backslashes, and `json.loads` converts JSON
    true/false/null to Python.
    """
    return json.loads(r"""{% raw %}{{ MATERIAL | default({}) | tojson }}{% endraw %}""")


def _fmt_coord(v: float, sig_digits: int = 4, zero_below: float = 1e-4) -> str:
    """Format `v` with `sig_digits` significant digits; collapse near-zero to '0'.

    Avoids the scientific notation that `.4g` would otherwise produce for very
    small magnitudes (e.g. numerical-noise coordinates near the origin).
    """
    if abs(v) < zero_below:
        return "0"
    return f"{v:.{sig_digits}g}"


def save_structure_png(atoms, filename):
    """Render an ASE `Atoms` object to a PNG with annotated lattice info.

    The unit cell is shown in mode `2` (all twelve edges drawn).

    Parameters
    ----------
    atoms : ase.Atoms
        Structure to visualize. Must have a defined cell for the lattice
        caption to be meaningful.
    filename : str | os.PathLike
        Output path for the rendered PNG. Saved at 150 dpi with a tight
        bounding box.
    """
    rotation = "15x,45y,15z"
    show_unit_cell = 2

    fig, ax = plt.subplots(figsize=(8, 8))

    # Use smaller radii for atoms visualization
    current_radii = np.array([covalent_radii[a.number] * 0.5 for a in atoms])

    plot_atoms(atoms, ax, radii=current_radii, rotation=rotation, show_unit_cell=show_unit_cell)

    ax.set_axis_off()

    # Replicate plot_atoms' internal rotation + offset + scale
    pv = PlottingVariables(
        atoms,
        scale=1.0,
        rotation=rotation,
        show_unit_cell=show_unit_cell,
        radii=current_radii,
    )

    projected_xy = pv.positions[: len(atoms), :2]

    for (x, y), a in zip(projected_xy, atoms):
        label = f"{a.symbol} ({_fmt_coord(a.position[0])}, {_fmt_coord(a.position[1])}, {_fmt_coord(a.position[2])})"
        ax.text(
            x,
            y,
            label,
            fontsize=9,
            ha="center",
            va="bottom",
            bbox=dict(facecolor="white", alpha=0.7, edgecolor="none", pad=1),
        )

    # Add lattice vectors below the plot
    cell = atoms.get_cell()
    caption_text = (
        f"Lattice Vectors:\n"
        f"a: [{cell[0,0]:.4f}, {cell[0,1]:.4f}, {cell[0,2]:.4f}]\n"
        f"b: [{cell[1,0]:.4f}, {cell[1,1]:.4f}, {cell[1,2]:.4f}]\n"
        f"c: [{cell[2,0]:.4f}, {cell[2,1]:.4f}, {cell[2,2]:.4f}]"
    )

    ax.text(
        0.5,
        -0.05,
        caption_text,
        transform=ax.transAxes,
        fontsize=10,
        ha="center",
        va="top",
        ma="left",
        family="monospace",
        bbox=dict(facecolor="ghostwhite", alpha=0.8, edgecolor="gray", boxstyle="round"),
    )

    plt.savefig(filename, dpi=150, bbox_inches="tight")
    plt.close(fig)
