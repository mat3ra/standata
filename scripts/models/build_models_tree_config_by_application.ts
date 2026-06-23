import * as fs from "fs";
import * as path from "path";

import { deepClone } from "@mat3ra/code/dist/js/utils";
import serverUtils from "@mat3ra/utils/server";
import _ from "underscore";

import { BUILD_CONFIG } from "../../build-config";
import { MODEL_TREE, ModelTree } from "./modelTreeConstants";

type DftOnlyTree = { dft: any };

function buildModelsTreeConfigs(): Record<string, ModelTree> {
    const VASP_MODELS_TREE = deepClone(_.pick(MODEL_TREE, "dft")) as DftOnlyTree;
    const ESPRESSO_MODELS_TREE = deepClone(_.pick(MODEL_TREE, "dft")) as DftOnlyTree;
    const NWCHEM_MODELS_TREE = deepClone(_.pick(MODEL_TREE, "dft")) as DftOnlyTree;

    (["gga", "lda"] as const).forEach((approximation) => {
        VASP_MODELS_TREE.dft[approximation].methods.pseudopotential = VASP_MODELS_TREE.dft[
            approximation
        ].methods.pseudopotential.splice(0, 1);

        ESPRESSO_MODELS_TREE.dft[approximation].methods.pseudopotential =
            ESPRESSO_MODELS_TREE.dft[approximation].methods.pseudopotential.reverse();
    });

    const UNKNOWN_MODELS_TREE = _.pick(MODEL_TREE, "unknown") as ModelTree;

    return {
        vasp: VASP_MODELS_TREE,
        espresso: ESPRESSO_MODELS_TREE,
        python: UNKNOWN_MODELS_TREE,
        shell: UNKNOWN_MODELS_TREE,
        jupyterLab: UNKNOWN_MODELS_TREE,
        nwchem: NWCHEM_MODELS_TREE,
        deepmd: UNKNOWN_MODELS_TREE,
    };
}

export function buildModelsTreeConfigByApplication(): void {
    const targetFile = `./${BUILD_CONFIG.models.build.path}/${BUILD_CONFIG.models.build.modelsTreeConfigByApplication}`;

    console.log(`Building models tree config by application...`);

    const modelsTreeConfigByApplication = buildModelsTreeConfigs();

    serverUtils.json.writeJSONFileSync(targetFile, modelsTreeConfigByApplication);
    console.log(`Generated: ${targetFile}`);

    const pyTargetFile = path.resolve(
        BUILD_CONFIG.srcPythonRuntimeDataDir,
        "models_tree_config_by_application.py",
    );
    const pyContent = `import json

models_tree_config_by_application = json.loads(r'''${JSON.stringify(
        modelsTreeConfigByApplication,
    )}''')
`;
    fs.writeFileSync(pyTargetFile, pyContent, "utf8");
    console.log(`Written Python Module to "${pyTargetFile}"`);

    console.log(
        `Models tree config built successfully with ${
            Object.keys(modelsTreeConfigByApplication).length
        } applications`,
    );
}

if (require.main === module) {
    buildModelsTreeConfigByApplication();
}
