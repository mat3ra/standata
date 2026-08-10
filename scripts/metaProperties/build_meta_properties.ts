import serverUtils from "@mat3ra/utils/server";
import * as fs from "fs";
import * as path from "path";

import { BUILD_CONFIG } from "../../build-config";

const rootDir = path.resolve(__dirname, "../..");
const sourcePath = path.resolve(rootDir, BUILD_CONFIG.metaProperties.assets.path, "pseudos.json");
const buildDir = path.resolve(rootDir, BUILD_CONFIG.metaProperties.build.path);
const distDir = path.resolve(rootDir, BUILD_CONFIG.distRuntimeDataDir, "metaProperties");
const destinationPaths = [
    path.resolve(buildDir, "pseudos.json"),
    path.resolve(distDir, "pseudos.json"),
];

if (!fs.existsSync(sourcePath)) {
    throw new Error(`Meta-properties asset not found: ${sourcePath}`);
}

const content = serverUtils.json.readJSONFileSync(sourcePath);

if (!Array.isArray(content)) {
    throw new Error(`Expected pseudos.json to be a JSON array, got ${typeof content}`);
}

destinationPaths.forEach((destinationPath) => {
    serverUtils.file.createDirIfNotExistsSync(path.dirname(destinationPath));
    serverUtils.json.writeJSONFileSync(destinationPath, content, {
        spaces: BUILD_CONFIG.buildJSONFormat.spaces,
    });
    console.log(`  Built: ${destinationPath}`);
});

console.log(`✅ metaProperties completed (${content.length} pseudopotentials).`);
