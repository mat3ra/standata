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
import shutil
from pathlib import Path
import numpy as np
import torch
from mat3ra.made.tools.convert import to_ase
from utils import get_material_from_context_variable
from mattersim.forcefield.potential import MatterSimCalculator
from mattersim.applications.phonon import PhononWorkflow


if torch.cuda.is_available():
    device = "cuda"
    os.environ["PYTORCH_KERNEL_CACHE_PATH"] = os.path.expanduser("~/pytorch_kernel_cache")
    os.makedirs(os.environ["PYTORCH_KERNEL_CACHE_PATH"], exist_ok=True)
else:
    device = "cpu"
print(f"Running MatterSim on {device}")

# this way material is obtained from the job context
ase_atoms = to_ase(get_material_from_context_variable())

# alternatively, material can be defined via ase, e.g.:
# from ase.build import bulk
# ase_atoms = bulk("Si", "diamond", a=5.43)
# ase_atoms = bulk("GaN", "wurtzite", a=3.189, c=5.185)

ase_atoms.calc = MatterSimCalculator(device=device)

# Configure the Phonon Workflow
work_dir = "./"

ph = PhononWorkflow(
    atoms=ase_atoms,
    find_prim = False,
    work_dir = work_dir,
    amplitude = 0.01,
    supercell_matrix = np.diag([4, 4, 4]),
)

has_imag, phonons = ph.run()
print(f"Has imaginary phonon: {has_imag}")

# Files: work_dir/Si2_phonon_dos.png -> ./phonon_dos.png
# output filenames are hardcoded to display the results in the web app
for f in Path(work_dir).glob("*_phonon_*.png"):
    new_name = f.name.split('_', 1)[1]
    shutil.copy2(f, new_name)
