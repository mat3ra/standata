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
#  Edit BROADENING_RY and ENERGY_STEPS in extract_dos.py to tune   #
#  the curve.                                                      #
#                                                                  #
# ---------------------------------------------------------------- #

# sets EXEC_CMD to the q3 container execution command
module load q3

# run the post-processing (extract_dos.py, the second input of this unit)
# inside the q3 container
$EXEC_CMD python extract_dos.py
