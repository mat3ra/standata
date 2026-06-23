import serverUtils from "@mat3ra/utils/server";
import fs from "fs";
import path from "path";

import { BUILD_CONFIG } from "../../build-config";

const sourceJsonPath = path.resolve(
    BUILD_CONFIG.applications.build.path,
    BUILD_CONFIG.applications.build.executableFlavorMapByApplication,
);

if (!fs.existsSync(sourceJsonPath)) {
    throw new Error(
        `Executable tree runtime data not found at ${sourceJsonPath}. Run npm run build:applications first.`,
    );
}

const content = serverUtils.json.readJSONFileSync(sourceJsonPath);

const targetPyPath = path.resolve(
    BUILD_CONFIG.srcPythonRuntimeDataDir,
    "executable_flavor_map_by_application.py",
);

const pyContent = `import json

executable_flavor_map_by_application_data = json.loads(r'''${JSON.stringify(content)}''')
`;

fs.writeFileSync(targetPyPath, pyContent, "utf8");
// eslint-disable-next-line no-console
console.log(`Written Python Module to "${targetPyPath}"`);
