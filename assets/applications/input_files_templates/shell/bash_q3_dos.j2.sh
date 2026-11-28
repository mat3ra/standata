#!/bin/bash

# ---------------------------------------------------------------- #
#                                                                  #
#  Density of states from a Quantum 3xplorer (q3) NSCF run         #
#                                                                  #
#  Reads the eigenvalues that the preceding q3_nscf unit wrote to  #
#  ./outdir/q3_results.json, applies Gaussian broadening with the  #
#  q3 Python package, and writes the curve back into that file as  #
#  ESSE's density_of_states record under properties.records (q3.   #
#  workflows.dos.add_density_of_states_to_results). Runs inside    #
#  the q3 container, which ships the q3 Python package.            #
#                                                                  #
#  Edit BROADENING_RY and ENERGY_STEPS in extract_dos.py to tune   #
#  the curve.                                                      #
#                                                                  #
# ---------------------------------------------------------------- #

# sets EXEC_CMD to the q3 container execution command
module load q3

# run the post-processing (extract_dos.py, the second input of this unit)
# inside the q3 container
$EXEC_CMD python extract_dos.py
