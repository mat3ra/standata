import { BUILD_CONFIG } from "../../build-config";
import { BaseModelMethodProcessor } from "./BaseModelMethodProcessor";

export class ModelsProcessor extends BaseModelMethodProcessor {
    private static defaultCategoryKeys = ["tier1", "tier2", "tier3", "type", "subtype"];

    constructor(rootDir: string) {
        super({
            rootDir,
            entityNamePlural: "models",
            assetsDir: BUILD_CONFIG.models.assets.path,
            dataDir: BUILD_CONFIG.models.data.path,
            buildDir: BUILD_CONFIG.models.build?.path,
            categoriesRelativePath: BUILD_CONFIG.models.assets.categories,
            categoryKeys: ModelsProcessor.defaultCategoryKeys,
            excludedAssetFiles: [BUILD_CONFIG.models.assets.modelMethodMap],
            categoryCollectOptions: {
                includeUnits: false,
                includeTags: true,
                includeEntitiesMap: true,
            },
        });
    }
}
