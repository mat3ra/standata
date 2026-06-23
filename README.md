# Standata

Standard data (stan-data) for digital materials R&D entities in the [ESSE](https://github.com/Exabyte-io/esse) data format.

## 1. Installation

### 1.1. Python

The package is compatible with Python 3.10+. It can be installed as a Python package either via PyPI:

```shell
pip install mat3ra-standata
```

Or as an editable local installation in a virtual environment after cloning the repository:

```shell
virtualenv .venv
source .venv/bin/activate
pip install -e PATH_TO_STANDATA_REPOSITORY
```

### 1.2. JavaScript

Standata can be installed as a Node.js package via NPM (node package manager).

```shell
npm install @mat3ra/standata
```

## 2. Usage

### 2.1. Python

```python
from mat3ra.standata.materials import materials_data
# This returns a list of JSON configs for all materials.
materialConfigs = materials_data["filesMapByName"].values();
```

### 2.2. JavaScript

```javascript
// Direct import can be used to avoid importing all data at once.
import data from "@mat3ra/standata/lib/runtime_data/materials";
// This creates a list of JSON configs for all materials.
const materialConfigs = Object.values(data.filesMapByName);
```

## 3. Repository Structure

The repository is organized into the following top-level directories:

```
standata/
├── assets/              # YAML source files (version-controlled)
│   ├── materials/       # Material definitions and POSCAR files
│   ├── methods/         # Method definitions and units
│   ├── models/          # Model definitions
│   ├── applications/    # Application configurations, templates
│   ├── workflows/       # Workflow and subworkflow definitions
│   └── properties/      # Property definitions
├── scripts/             # Build scripts for generating entities
│   ├── materials/       # Material generation scripts
│   ├── methods/         # Method build scripts
│   ├── models/          # Model build scripts
│   ├── applications/    # Application build scripts
│   └── workflows/       # Workflow build scripts
├── data/                # Generated JSON files (git-ignored)
│   ├── materials/       # Individual material JSON files
│   ├── methods/         # Individual method JSON files
│   ├── models/          # Individual model JSON files
│   ├── applications/    # Individual application JSON files
│   ├── workflows/       # Individual workflow JSON files
│   └── properties/      # Individual property JSON files
├── build/standata/      # Aggregated maps and artifacts (git-ignored)
│   ├── models/          # Model-method compatibility maps
│   ├── applications/    # Application version maps
│   └── workflows/       # Workflow-subworkflow maps
├── dist/                # Transpiled JavaScript and runtime data
│   └── js/
│       └── runtime_data/  # Pre-loaded JSON data for client consumption
├── src/                 # Source code
│   ├── js/              # TypeScript/JavaScript source
│   └── py/              # Python source
└── tests/               # Test suites
    ├── js/              # JavaScript tests
    └── py/              # Python tests
```

### 3.1. Build Flow

Entity data flows through the build process as follows:

1. **Assets** (`assets/`) → YAML source files define entities
2. **Scripts** (`scripts/`) → Build scripts parse YAML and generate JSON
3. **Data** (`data/`) → Individual JSON files for each entity
4. **Build** (`build/standata/`) → Aggregated maps and compatibility data
5. **Distribution** (`dist/js/runtime_data/`) → Final runtime data for consumption

## 4. Conventions

#### 4.1. Runtime Modules

To avoid file system calls on the client, the entity categories and data structures are made available at runtime via
the files in `src/js/runtime_data`. These files are generated automatically using the following command:

```shell
npm run build:runtime-data
```

#### 4.2. CLI Scripts for Creating Symlinks

##### 4.2.1. Python

The Python package adds a command line script `create-symlinks` that creates a category-based file tree where
entity data files are symbolically linked in directories named after the categories associated with the entity.
The resulting file tree will be contained in a directory names `by_category`.
The script expects the (relative or absolute) path to an entity config file (`categories.yml`). The destination
of the file tree can be modified by passing the `--destination`/`-d` option.

```shell
# consult help page to view all options
create-symlinks --help
# creates symbolic links in materials/by_category
create-symlinks materials/categories.yml
# creates symbolic links for materials in tmp/by_category
create-symlinks materials/categories.yml -d tmp
```

##### 4.2.2. JavaScript/Node

Analogous to the command line script in Python, the repository also features a script in
TypeScript (`src/js/cli.ts`) and (after transpiling) in JavaScript (`lib/cli.js`).
The script takes the entity config file as a mandatory positional argument and the
alternative location for the directory containing the symbolic links (`--destination`/`-d`).

```shell
# creates symbolic links in materials/by_category (node)
node lib/cli.js materials/categories.yml
# creates symbolic links in materials/by_category (ts-node)
ts-node src/js/cli.ts materials/categories.yml
# creates symbolic links for materials in tmp/by_category
ts-node src/js/cli.ts -d tmp materials/categories.yml
# run via npm
npm run build:categories -- materials/categories.yml
```

## 5. Development

See [ESSE](https://github.com/Exabyte-io/esse) for the notes about development and testing.

To develop, first, create a virtual environment and install the dev dependencies:

```shell
python -m venv .venv
source .venv/bin/activate
pip install ".[dev]"
```

### 5.1. Materials Source

The materials data is sourced from the [Materials Project](https://next-gen.materialsproject.org) for 3D materials and [2dmatpedia](http://www.2dmatpedia.org) for 2D materials. The structural data in POSCAR format is stored in the `assets/materials` directory alongside the `manifest.yml` file that contains the additional description and metadata for each material.

To add new materials to Standata, place the POSCAR file in the `assets/materials` directory and update the `manifest.yml` file with the new material's metadata. Then run to create the materials data:

```shell
python scripts/materials/create_materials.py
```

### 5.2. Materials Naming Conventions

Our dataset's naming convention for materials is designed to provide a comprehensive description of each material, incorporating essential attributes such as chemical composition, common name, crystal structure, and unique identifiers.

#### 5.2.1. Name Property Format

The format for the material name property is a structured representation that includes the chemical formula, common name, crystal system, space group, dimensionality, specific structure details, and a unique identifier. Each element in the name is separated by a comma and space.

Format:

```
{Chemical Formula}, {Common Name}, {Crystal System} ({Space Group}) {Dimensionality} ({Structure Detail}), {Unique Identifier}
```

**Examples**:

- Ni, Nickel, FCC (Fm-3m) 3D (Bulk), mp-23
- ZrO2, Zirconium Dioxide, MCL (P2_1/c) 3D (Bulk), mp-2858
- C, Graphite, HEX (P6_3/mmc) 3D (Bulk), mp-48
- C, Graphene, HEX (P6/mmm) 2D (Monolayer), mp-1040425

#### 5.2.2. Filename Format

Filenames are derived from the name property through a slugification process, ensuring they are filesystem-friendly and easily accessible via URLs or command-line interfaces. This process involves converting the structured name into a standardized, URL-safe format that reflects the material's attributes.

Format:

```
{Chemical_Formula}-[{Common_Name}]-{Crystal_System}_[{Space_Group}]_
{Dimensionality}_[{Structure_Detail}]-[{Unique_Identifier}]
```

**Transformation Rules**:

Commas and Spaces: Replace `, ` (comma and space) with `-` (hyphen) and ` ` (space) with `_` (underscore).
Parentheses: Convert `(` and `)` into `[` and `]` respectively.
Special Characters: Encode characters such as `/` into URL-safe representations (e.g., `%2F`).
Brackets: Wrap common name and identifier parts in square brackets `[]`.

**Filename Examples**:

- Ni-[Nickel]-FCC_[Fm-3m]_3D_[Bulk]-[mp-23]
- ZrO2-[Zirconium_Dioxide]-MCL_[P2_1%2Fc]_3D_[Bulk]-[mp-2858]
- C-[Graphite]-HEX_[P6_3%2Fmmc]_3D_[Bulk]-[mp-48]
- C-[Graphene]-HEX_[P6%2Fmmm]_2D_[Monolayer]-[mp-1040425]

### 5.3. Adding New Entities (Models, Methods, Applications, Workflows)

Entity definitions (models, methods, applications, workflows) are compiled from YAML asset files using custom YAML types such as `!combine` to generate multiple entity configurations from a single definition.
Asset files are located in `assets/{entity-type}/` directories, and build scripts generate JSON files in corresponding `data/{entity-type}/` directories.

#### 5.3.1. Models

Models are defined in `assets/models/` directory. To add a new model:

1. Create or edit a YAML file in `assets/models/` (e.g., `assets/models/lda.yml`)
2. Use the `!combine` type to generate model configurations:

```yaml
modelConfigs: !combine
  name:
    template: 'DFT {{ categories.subtype | upper }} {{ parameters.functional }}'
  forEach:
    - !parameter
      key: parameters.functional
      values: ["pz", "pw", "vwn"]
  config:
    tags:
      - dft
      - lda
    categories:
      tier1: pb
      tier2: qm
      tier3: dft
      type: ksdft
      subtype: lda
```

3. Run the build command:

```shell
npm run build:models
```

#### 5.3.2. Methods

Methods are defined in `assets/methods/` directory with support for unit composition. To add a new method:

1. Create or edit a YAML file in `assets/methods/` (e.g., `assets/methods/pw_methods.yml`)
2. Define method units in `assets/methods/units/` if needed
3. Use `!combine` with `!parameter` to compose methods from units:

```yaml
!combine
name:
  template: '{{ units[0]["name"] }} Method'
forEach:
  - !parameter
    key: units
    action: push
    ref: assets/methods/units/pw.yml
config:
  categories:
    tier1: qm
    tier2: wf
```

4. Run the build command:

```shell
npm run build:methods
```

#### 5.3.3. Model-Method Compatibility

The model-method compatibility map is defined in `assets/models/modelMethodMap.yml`. To add compatibility rules:

1. Edit `assets/models/modelMethodMap.yml`
2. Define filter rules for model categories using nested structure:

```yaml
pb:
  qm:
    dft:
      ksdft:
        lda:
          - path: /qm/wf/none/pw/none
          - regex: /qm/wf/none/psp/.*
```

3. Run the build command:

```shell
npm run build:model-method-map
```

#### 5.3.4. Applications

Applications are defined in `assets/applications/` directory. To add a new application:

1. Add application configuration to `assets/applications/applications/application_data.yml`
2. Define templates in `assets/applications/templates/`
3. Run the build command:

```shell
npm run build:applications
```

#### 5.3.5. Workflows

Workflows and subworkflows are defined in `assets/workflows/` directory. To add new workflows:

1. Create YAML files in `assets/workflows/workflows/{application}/` for workflows
2. Create YAML files in `assets/workflows/subworkflows/{application}/` for subworkflows
3. Run the build command:

```shell
npm run build:workflows
```

#### 5.3.6. Custom YAML Types

The following custom YAML types are available for entity definitions:

- `!combine`: Creates multiple entity configurations from parameter combinations
- `!parameter`: Defines a parameter to iterate over with optional exclusions
- `!esse`: References ESSE schema definitions for validation and enum values
- `isOptional: true`: Makes a parameter optional, creating entities with and without it

For complete examples, see the asset files in the `assets/` directory.

For definitions of custom directives go to [code.js](https://github.com/Exabyte-io/code.js).

#### 5.3.7. Building All Entities

To rebuild all entities at once:

```shell
npm run build
```

### 5.4. UI Trees

UI trees are hierarchical data structures for generating RJSF schemas for model and method filters. They're built from YAML assets in `ui/assets/` and output as:
- **modelTree.json** - Model category hierarchy with parameters
- **methodTree.json** - Method category hierarchy with parameters
- **schemas.json** - UI schema titles for form labels

#### 5.4.1. Building

```shell
npm run build:ui
```

Outputs formatted JSON to `ui/data/` (development) and minified to `dist/js/ui/` (production).


#### 5.4.2. Adding New Categories

1. Create YAML file in `ui/assets/model/` (or `method/`) with `path`, `data`, and optional `staticOptions`
2. Add human-readable names to `ui/assets/manifest/names_map.yml`
3. Include in parent file using `!include`
4. Run `npm run build:ui`

See existing files in `ui/assets/` for examples. TypeScript types are in `ui/types/uiTree.ts`.

## 6. Important notes

### 6.1. Transpilation and Runtime Data Build

We want to keep the runtime_data files minified with no formatting for the sake of download size.
During build process, we run transpilation of TypeScript to JavaScript using `tsc` to make all runtime_data files available for src/js/ files. Later we build runtime_data files using `npm run build:runtime-data` command. They are copied to `dist/js/runtime_data` folder directly to preserve minified content. Do not run `tsc` transpilation on its own for commiting, only if needed for local development.
