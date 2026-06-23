import serverUtils from "@mat3ra/utils/server";
import * as fs from "fs";
import * as path from "path";

import { BUILD_CONFIG } from "../../build-config";

export function buildApplicationVersionsMapByApplicationPythonModule(): void {
    const sourceFile = path.resolve(
        BUILD_CONFIG.applications.build.path,
        BUILD_CONFIG.applications.build.applicationVersionsMapByApplication,
    );
    const applicationVersionsMapByApplication = serverUtils.json.readJSONFileSync(sourceFile);

    const pyTargetFile = path.resolve(
        BUILD_CONFIG.srcPythonRuntimeDataDir,
        "application_versions_map_by_application.py",
    );
    const pyContent = `import json

application_versions_map_by_application = json.loads(r'''${JSON.stringify(
        applicationVersionsMapByApplication,
    )}''')
`;
    fs.writeFileSync(pyTargetFile, pyContent, "utf8");
    console.log(`Written Python Module to "${pyTargetFile}"`);
}

if (require.main === module) {
    buildApplicationVersionsMapByApplicationPythonModule();
}
