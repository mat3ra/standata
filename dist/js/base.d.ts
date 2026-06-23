import { EntityCategories, EntityItem, RuntimeData, StandataConfig } from "./types/standata";
export declare class Standata<EntityType extends object = object> {
    static runtimeData: RuntimeData;
    static getRuntimeDataConfigs(): any[];
    entities: EntityItem[];
    categories: string[];
    protected categoryMap: EntityCategories;
    protected lookupTable: {
        [key: string]: Set<string>;
    };
    constructor(config?: StandataConfig);
    flattenCategories(separator?: string): string[];
    convertTagToCategory(...tags: string[]): string[];
    protected createLookupTable(): {
        [key: string]: Set<string>;
    };
    protected loadEntity(filename: string): object | undefined;
    protected filterByCategories(...categories: string[]): string[];
    findEntitiesByTags(...tags: string[]): EntityType[];
    getAll(): EntityType[];
}
