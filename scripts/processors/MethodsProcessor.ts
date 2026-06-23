import { BUILD_CONFIG } from "../../build-config";
import { encodeDataAsURLPath } from "../utils";
import { BaseModelMethodProcessor } from "./BaseModelMethodProcessor";
import type { EntityWithPathAndUnits } from "./types";

export class MethodsProcessor extends BaseModelMethodProcessor {
    private static defaultCategoryKeys = ["tier1", "tier2", "tier3", "type", "subtype"];

    constructor(rootDir: string) {
        super({
            rootDir,
            entityNamePlural: "methods",
            assetsDir: BUILD_CONFIG.methods.assets.path,
            dataDir: BUILD_CONFIG.methods.data.path,
            buildDir: BUILD_CONFIG.methods.build?.path,
            categoriesRelativePath: BUILD_CONFIG.methods.assets.categories,
            categoryKeys: MethodsProcessor.defaultCategoryKeys,
            categoryCollectOptions: {
                includeUnits: true,
                includeTags: true,
                includeEntitiesMap: true,
            },
        });
    }

    protected transformEntity(entity: EntityWithPathAndUnits): EntityWithPathAndUnits {
        if (entity?.units) {
            const categoryKeys = this.options.categoryKeys || [];
            entity.units.forEach((unit) => {
                unit.path = encodeDataAsURLPath(unit, categoryKeys);
                delete unit.schema;
            });
            entity.path = entity.units.map((u) => u.path).join("::");
        }
        return entity;
    }

    protected getDataSubdirectory(entity: EntityWithPathAndUnits): string {
        return super.getDataSubdirectory(entity).split("::")[0];
    }
}
