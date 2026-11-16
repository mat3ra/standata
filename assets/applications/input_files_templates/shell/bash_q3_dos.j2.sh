#!/bin/bash

# ---------------------------------------------------------------- #
#                                                                  #
#  Density of states from a Quantum 3xplorer (q3) NSCF run         #
#                                                                  #
#  Reads the eigenvalues that the preceding q3_nscf unit wrote to  #
#  ./outdir/q3_results.json, applies Gaussian broadening with the  #
#  q3 Python package (q3.io.output_writer.extract_dos), and writes #
#  the curve to q3_dos.json. Runs inside the q3 container, which   #
#  ships the q3 Python package on its PATH.                        #
#                                                                  #
#  Edit BROADENING_RY and ENERGY_STEPS below to tune the curve.    #
#                                                                  #
# ---------------------------------------------------------------- #

# sets EXEC_CMD to the q3 container execution command
module load q3

cat > q3_dos.py <<'EOF'
"""Gaussian-broadened density of states from a q3 NSCF results file."""

import json
import logging
from pathlib import Path

from q3.io.output_writer import extract_dos
from q3.io.results.classes import Results

RESULTS_PATH = Path("outdir") / "q3_results.json"
OUTPUT_PATH = Path("q3_dos.json")
BROADENING_RY = 0.01
ENERGY_STEPS = 1000
RYDBERG_TO_ELECTRONVOLT = 13.605693122994

logger = logging.getLogger("q3_dos")


def compute_density_of_states(results_path: Path) -> dict:
    """Broaden the eigenvalues of *results_path* and add the energies in eV."""
    results = Results.read(results_path)
    density_of_states = extract_dos(
        results, broadening_ry=BROADENING_RY, energy_steps=ENERGY_STEPS
    )
    density_of_states["energies_ev"] = [
        energy * RYDBERG_TO_ELECTRONVOLT for energy in density_of_states["energies_ry"]
    ]
    density_of_states["fermi_energy_ev"] = (
        density_of_states["fermi_energy_ry"] * RYDBERG_TO_ELECTRONVOLT
    )
    return density_of_states


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    density_of_states = compute_density_of_states(RESULTS_PATH)
    with open(OUTPUT_PATH, "w") as output_file:
        json.dump(density_of_states, output_file, indent=4)
    logger.info("Density of states written to %s", OUTPUT_PATH)
    logger.info("Energy points: %d", len(density_of_states["energies_ry"]))
    logger.info("Fermi energy: %.6f eV", density_of_states["fermi_energy_ev"])


if __name__ == "__main__":
    main()
EOF

# run the post-processing inside the q3 container
$EXEC_CMD python q3_dos.py
