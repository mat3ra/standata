import { EntityCategories, EntityItem, RuntimeData, StandataConfig } from "./types/standata";

export class Standata<EntityType extends object = object> {
    static runtimeData: RuntimeData = {
        standataConfig: { entities: [], categories: {} },
        filesMapByName: {},
    };

    static getRuntimeDataConfigs(): any[] {
        return Object.values(this.runtimeData.filesMapByName);
    }

    entities: EntityItem[];

    categories: string[];

    protected categoryMap: EntityCategories;

    protected lookupTable: {
        [key: string]: Set<string>;
    };

    constructor(config?: StandataConfig) {
        const ctor = this.constructor as typeof Standata;
        this.categoryMap = config ? config.categories : ctor.runtimeData.standataConfig.categories;
        this.entities = config ? config.entities : ctor.runtimeData.standataConfig.entities;
        this.categories = this.flattenCategories();
        this.lookupTable = this.createLookupTable();
    }

    flattenCategories(separator = "/"): string[] {
        const categories = Object.entries(this.categoryMap)
            .flatMap(([type, tags]) => tags.map((t) => `${type}${separator}${t}`))
            .sort((a, b) => a.localeCompare(b));
        return [...new Set(categories)];
    }

    convertTagToCategory(...tags: string[]): string[] {
        return this.categories.filter((c) => tags.some((t) => c.split("/")[1] === t));
    }

    protected createLookupTable(): { [key: string]: Set<string> } {
        const lookupTable: { [key: string]: Set<string> } = {};
        // eslint-disable-next-line no-restricted-syntax
        for (const entity of this.entities) {
            const categories_ = this.convertTagToCategory(...entity.categories);
            const { filename } = entity;
            // eslint-disable-next-line no-restricted-syntax
            for (const category of categories_) {
                if (category in lookupTable) {
                    lookupTable[category].add(filename);
                } else {
                    lookupTable[category] = new Set([filename]);
                }
            }
        }
        return lookupTable;
    }

    protected loadEntity(filename: string): object | undefined {
        const ctor = this.constructor as typeof Standata;
        return (ctor.runtimeData?.filesMapByName as any)?.[filename];
    }

    protected filterByCategories(...categories: string[]): string[] {
        if (!categories.length) {
            return [];
        }
        let filenames = this.entities.map((e) => e.filename);
        // eslint-disable-next-line no-restricted-syntax
        for (const category of categories) {
            filenames = filenames.filter((f) => this.lookupTable[category]?.has(f));
        }
        return filenames;
    }

    findEntitiesByTags(...tags: string[]): EntityType[] {
        const categories_ = this.convertTagToCategory(...tags);
        const filenames = this.filterByCategories(...categories_) || [];
        return filenames
            .map((f) => this.loadEntity(f))
            .filter((e): e is EntityType => e !== undefined);
    }

    getAll(): EntityType[] {
        return this.entities
            .map((e) => this.loadEntity(e.filename))
            .filter((e): e is EntityType => e !== undefined);
    }
}
