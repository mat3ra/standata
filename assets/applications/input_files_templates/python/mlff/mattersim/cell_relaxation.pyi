# ---------------------------------------------------------------- #
#                                                                  #
#  Example MatterSim calculation on Mat3ra.com platform            #
#                                                                  #
#  Will be used as follows:                                        #
#                                                                  #
#    1. runtime directory for this calculation is created          #
#    2. requirements.txt is used to create a virtual environment   #
#    3. virtual environment is activated                           #
#    4. python process running this script is started              #
#                                                                  #
#  Adjust the content below to include your code.                  #
#                                                                  #
# ---------------------------------------------------------------- #

import os
import torch
from mat3ra.made.tools.convert import to_ase
from utils import get_material_from_context_variable, save_structure_png
from mattersim.forcefield.potential import MatterSimCalculator
from mattersim.applications.relax import Relaxer


# calculation parameters
MAX_STEPS = 500  # Maximum number of steps to relax for
FMAX = 0.05  # Force threshold
CELL_RELAXATION_TYPE = "fixed"  # or "variable"
OPTIMIZER_TYPE = "BFGS"  # or "FIRE"


if torch.cuda.is_available():
    device = "cuda"
    os.environ["PYTORCH_KERNEL_CACHE_PATH"] = os.path.expanduser("~/pytorch_kernel_cache")
    os.makedirs(os.environ["PYTORCH_KERNEL_CACHE_PATH"], exist_ok=True)
else:
    device = "cpu"
print(f"Running MatterSim on {device}")

ase_atoms = to_ase(get_material_from_context_variable())

# alternatively, material can be defined via ase, e.g.:
# from ase.build import bulk
# ase_atoms = bulk("Si", "diamond", a=5.43)
# ase_atoms = bulk("GaN", "wurtzite", a=3.189, c=5.185)

ase_atoms.calc = MatterSimCalculator(device=device)
initial_structure = ase_atoms.copy()  # make deep copy

# initialize the relaxation object
relaxer = Relaxer(
    optimizer=OPTIMIZER_TYPE,  # the optimization method
    filter="ExpCellFilter",  # filter to apply to the cell
    constrain_symmetry=True,  # whether to constrain the symmetry
)

# relaxed_structure is pointer to material object
is_converged, relaxed_structure = relaxer.relax(ase_atoms, steps=MAX_STEPS, fmax=FMAX)

# save the structures to file
initial_structure.write("initial_structure.cif")
initial_structure.write("initial_structure.poscar")

relaxed_structure.write("relaxed_structure.cif")
relaxed_structure.write("relaxed_structure.poscar")

# output filenames are hardcoded to display the structures in the web app
save_structure_png(initial_structure, "initial_structure.png")
save_structure_png(relaxed_structure, "relaxed_structure.png")
