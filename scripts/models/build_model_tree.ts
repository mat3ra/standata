import serverUtils from "@mat3ra/utils/server";
import * as fs from "fs";
import * as path from "path";

import { BUILD_CONFIG } from "../../build-config";
import { MODEL_NAMES, MODEL_TREE } from "./modelTreeConstants";

export function buildModelTree(): void {
    const targetFile = `./${BUILD_CONFIG.models.build.path}/${BUILD_CONFIG.models.build.modelTree}`;

    console.log(`Building model tree...`);

    const modelTreeData = {
        MODEL_TREE,
        MODEL_NAMES,
    };

    serverUtils.json.writeJSONFileSync(targetFile, modelTreeData);
    console.log(`Generated: ${targetFile}`);

    const pyTargetFile = path.resolve(BUILD_CONFIG.srcPythonRuntimeDataDir, "model_tree.py");
    const pyContent = `import json

model_tree_data = json.loads(r'''${JSON.stringify(modelTreeData)}''')
MODEL_TREE = model_tree_data.get("MODEL_TREE", {})
MODEL_NAMES = model_tree_data.get("MODEL_NAMES", {})
`;
    fs.writeFileSync(pyTargetFile, pyContent, "utf8");
    console.log(`Written Python Module to "${pyTargetFile}"`);

    console.log(`Model tree built successfully`);
}

if (require.main === module) {
    buildModelTree();
}
