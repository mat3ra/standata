import serverUtils from "@mat3ra/utils/server";

import { BUILD_CONFIG } from "../../build-config";
import { CategorizedEntityProcessor } from "./CategorizedEntityProcessor";

export class MaterialsProcessor extends CategorizedEntityProcessor {
    private static defaultCategoryKeys = [
        "common_name",
        "lattice_type",
        "dimensionality",
        "form_factor",
        "source",
    ];

    constructor(rootDir: string) {
        super({
            rootDir,
            entityNamePlural: "materials",
            assetsDir: BUILD_CONFIG.materials.assets.path,
            dataDir: BUILD_CONFIG.materials.data.path,
            buildDir: BUILD_CONFIG.materials.build?.path,
            categoriesRelativePath: BUILD_CONFIG.materials.assets.categories,
            categoryKeys: MaterialsProcessor.defaultCategoryKeys,
            excludedAssetFiles: [BUILD_CONFIG.materials.assets.manifest],
            areKeysSorted: false,
            categoryCollectOptions: {
                includeUnits: false,
                includeTags: true,
                includeEntitiesMap: true,
            },
        });
    }

    public readAssets() {
        console.log("  Reading generated materials from data directory...");
        const dataFiles = serverUtils.file.getFilesInDirectory(this.resolvedPaths.dataDir, [
            ".json",
        ]);
        console.log(`  Found ${dataFiles.length} generated material files`);
    }

    public cleanDataDirectory(): void {
        console.log("  Skipping data cleanup (materials generated externally by Python)");
    }

    public writeDataDirectoryContent(): void {
        console.log(
            "  Skipping data generation (run 'npm run create:materials' to generate from POSCAR files)",
        );
    }

    public writeBuildDirectoryContent(): void {
        console.log("  Copying materials to build directory (minified)...");
        this.copyAndMinifyFromDataToBuild();
    }

    public updateCategoriesFile(): void {
        console.log("  Skipping categories file update (manually maintained)");
    }
}
