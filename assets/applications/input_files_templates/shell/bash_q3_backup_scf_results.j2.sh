#!/bin/bash

# ---------------------------------------------------------------- #
#                                                                  #
#  Keep the Quantum 3xplorer (q3) SCF results file                 #
#                                                                  #
#  q3 always writes <outdir>/<prefix>_results.json, and the NSCF   #
#  run that follows overwrites the SCF one. This keeps a copy      #
#  beside it in outdir. The copy's name does not end in            #
#  _results.json, so the result parsers keep reading the NSCF      #
#  file.                                                           #
#                                                                  #
# ---------------------------------------------------------------- #

cp outdir/q3_results.json outdir/q3_results_scf.json
