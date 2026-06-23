// @ts-ignore
import { buildJSONFromYAMLInDir } from "../../scripts/utils";
import { BUILD_CONFIG as ROOT_BUILD_CONFIG } from "../../build-config";
import { BUILD_CONFIG } from "../build-config";

BUILD_CONFIG.assets.forEach(({ source, target }) => {
    buildJSONFromYAMLInDir({
        assetPath: source,
        targetPath: `${BUILD_CONFIG.dataDir}/${target}`,
        workingDir: BUILD_CONFIG.assetsDir,
        spaces: ROOT_BUILD_CONFIG.dataJSONFormat.spaces,
    });

    buildJSONFromYAMLInDir({
        assetPath: source,
        targetPath: `${BUILD_CONFIG.distDir}/${target}`,
        workingDir: BUILD_CONFIG.assetsDir,
        spaces: ROOT_BUILD_CONFIG.buildJSONFormat.spaces,
    });
});
