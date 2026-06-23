/**
 * Centralized configuration for build process file names and paths
 * This ensures consistency across all build scripts and makes renaming easier
 *
 * Structure Convention:
 * --------------------
 * Top-level folders organize by purpose:
 * - assets/      YAML source files that define entities (human-editable, version-controlled)
 * - scripts/     Build scripts for generating entities
 * - data/        Individual JSON files generated from assets (one file per entity)
 * - build/standata/  Aggregated JSON maps and build artifacts (git-ignored, for runtime consumption)
 *
 * Each entity type (models, methods, applications, workflows, materials, properties) has subdirectories within these top-level folders.
 *
 * Example flow:
 *   assets/models/*.yml  →  [scripts/models/build_*.ts]  →  data/models/*.json  →  [copied to]  →  dist/js/runtime_data/
 *                                                         →  build/standata/models/*.json  →  [copied to]  →  dist/js/runtime_data/
 */

export const BUILD_CONFIG = {
    models: {
        assets: {
            path: "assets/models",
            modelMethodMap: "modelMethodMap.yml",
            categories: "categories.yml",
        },
        data: {
            path: "data/models",
        },
        build: {
            path: "build/standata/models",
            modelMethodMap: "modelMethodMap.json",
            modelTree: "modelTree.json",
            modelsTreeConfigByApplication: "modelsTreeConfigByApplication.json",
        },
    },

    methods: {
        assets: {
            path: "assets/methods",
            categories: "categories.yml",
        },
        data: {
            path: "data/methods",
        },
        build: {
            path: "build/standata/methods",
        },
    },

    applications: {
        assets: {
            path: "assets/applications",
            templates: "templates/templates.yml",
            applicationData: "applications/application_data.yml",
            executableTree: "executables/tree.yml",
            applications: "applications",
            models: "models",
            methods: "methods",
            inputFilesTemplatesDir: "input_files_templates",
            categories: "categories.yml",
        },
        data: {
            path: "data/applications",
        },
        build: {
            path: "build/standata/applications",
            templatesList: "templatesList.json",
            executablesList: "executablesList.json",
            flavorsList: "flavorsList.json",
            applicationsList: "applicationsList.json",
            applicationVersionsMapByApplication: "applicationVersionsMapByApplication.json",
            executableFlavorMapByApplication: "executableFlavorMapByApplication.json",
            modelMethodMapByApplication: "modelMethodMapByApplication.json",
        },
    },

    workflows: {
        assets: {
            path: "assets/workflows/workflows",
            categories: "categories.yml",
        },
        data: {
            path: "data/workflows/workflows",
        },
        build: {
            path: "build/standata/workflows",
            workflowSubworkflowMapByApplication: "workflowSubworkflowMapByApplication.json",
        },
    },

    subworkflows: {
        assets: {
            path: "assets/workflows/subworkflows",
            categories: "categories.yml",
        },
        data: {
            path: "data/workflows/subworkflows",
        },
        build: {
            path: "build/standata/subworkflows",
        },
    },

    materials: {
        assets: {
            path: "assets/materials",
            manifest: "manifest.yml",
            categories: "categories.yml",
        },
        data: {
            path: "data/materials",
        },
        build: {
            path: "build/standata/materials",
        },
    },

    properties: {
        assets: {
            path: "assets/properties",
            categories: "categories.yml",
        },
        data: {
            path: "data/properties",
        },
        build: {
            path: "build/standata/properties",
        },
    },

    scripts: {
        models: "scripts/models",
        methods: "scripts/methods",
        applications: "scripts/applications",
        executables: "scripts/executables",
        workflows: "scripts/workflows",
        materials: "scripts/materials",
        properties: "scripts/properties",
    },

    distRuntimeDataDir: "./dist/js/runtime_data",
    srcPythonRuntimeDataDir: "./src/py/mat3ra/standata/data",

    dataJSONFormat: {
        spaces: 4,
    },

    buildJSONFormat: {
        spaces: 0,
    },

    yamlFormat: {
        indent: 2,
        lineWidth: -1,
        sortKeys: false,
    },
} as const;

// sometimes we need to define certain keys prior to using them later in another
// key, e.g., environment variables, which must be excluded from sorting
export const EXCLUDE_KEYS_FROM_SORTING = [
    "SOFTWARE_LIBRARIES_PATH",
    "SOFTWARE_COMPILERS_PATH",
] as const;
