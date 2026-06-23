import serverUtils from "@mat3ra/utils/server";

import { BUILD_CONFIG } from "../../build-config";
import { CategorizedEntityProcessor } from "./CategorizedEntityProcessor";

export class PropertiesProcessor extends CategorizedEntityProcessor {
    private static defaultCategoryKeys = [
        "type",
        "property_class",
        "value_type",
        "measurement",
        "application",
    ];

    constructor(rootDir: string) {
        super({
            rootDir,
            entityNamePlural: "properties",
            assetsDir: BUILD_CONFIG.properties.assets.path,
            dataDir: BUILD_CONFIG.properties.data.path,
            buildDir: BUILD_CONFIG.properties.build?.path,
            categoriesRelativePath: BUILD_CONFIG.properties.assets.categories,
            categoryKeys: PropertiesProcessor.defaultCategoryKeys,
            excludedAssetFiles: [],
            categoryCollectOptions: {
                includeUnits: false,
                includeTags: true,
                includeEntitiesMap: true,
            },
        });
    }

    public readAssets() {
        console.log("  Reading existing property JSON files from data directory...");
        const files = serverUtils.file.getFilesInDirectory(this.resolvedPaths.dataDir, [".json"]);
        console.log(`  Found ${files.length} property files`);
        return [];
    }

    protected cleanDataDirectory(): void {
        console.log("  Skipping data directory cleanup (manually maintained)");
    }

    public writeDataDirectoryContent(): void {
        console.log("  Skipping data directory write (manually maintained)");
    }

    public writeBuildDirectoryContent(): void {
        console.log("  Copying properties to build directory (minified)...");
        this.copyAndMinifyFromDataToBuild();
    }

    public updateCategoriesFile(): void {
        console.log("  Skipping categories file update (manually maintained)");
    }

    public getCategoryCollectOptions() {
        return {
            includeUnits: false,
            includeTags: true,
            includeEntitiesMap: true,
        };
    }
}
