### Note on Python input files templates

`.pyi` extension is used instead of `.py` for Python input files templates
because often the input templates contain Jinja placeholders for the input
variables, which causes linter errors.
