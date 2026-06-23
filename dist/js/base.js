"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Standata = void 0;
class Standata {
    static getRuntimeDataConfigs() {
        return Object.values(this.runtimeData.filesMapByName);
    }
    constructor(config) {
        const ctor = this.constructor;
        this.categoryMap = config ? config.categories : ctor.runtimeData.standataConfig.categories;
        this.entities = config ? config.entities : ctor.runtimeData.standataConfig.entities;
        this.categories = this.flattenCategories();
        this.lookupTable = this.createLookupTable();
    }
    flattenCategories(separator = "/") {
        const categories = Object.entries(this.categoryMap)
            .flatMap(([type, tags]) => tags.map((t) => `${type}${separator}${t}`))
            .sort((a, b) => a.localeCompare(b));
        return [...new Set(categories)];
    }
    convertTagToCategory(...tags) {
        return this.categories.filter((c) => tags.some((t) => c.split("/")[1] === t));
    }
    createLookupTable() {
        const lookupTable = {};
        // eslint-disable-next-line no-restricted-syntax
        for (const entity of this.entities) {
            const categories_ = this.convertTagToCategory(...entity.categories);
            const { filename } = entity;
            // eslint-disable-next-line no-restricted-syntax
            for (const category of categories_) {
                if (category in lookupTable) {
                    lookupTable[category].add(filename);
                }
                else {
                    lookupTable[category] = new Set([filename]);
                }
            }
        }
        return lookupTable;
    }
    loadEntity(filename) {
        var _a, _b;
        const ctor = this.constructor;
        return (_b = (_a = ctor.runtimeData) === null || _a === void 0 ? void 0 : _a.filesMapByName) === null || _b === void 0 ? void 0 : _b[filename];
    }
    filterByCategories(...categories) {
        if (!categories.length) {
            return [];
        }
        let filenames = this.entities.map((e) => e.filename);
        // eslint-disable-next-line no-restricted-syntax
        for (const category of categories) {
            filenames = filenames.filter((f) => { var _a; return (_a = this.lookupTable[category]) === null || _a === void 0 ? void 0 : _a.has(f); });
        }
        return filenames;
    }
    findEntitiesByTags(...tags) {
        const categories_ = this.convertTagToCategory(...tags);
        const filenames = this.filterByCategories(...categories_) || [];
        return filenames
            .map((f) => this.loadEntity(f))
            .filter((e) => e !== undefined);
    }
    getAll() {
        return this.entities
            .map((e) => this.loadEntity(e.filename))
            .filter((e) => e !== undefined);
    }
}
exports.Standata = Standata;
Standata.runtimeData = {
    standataConfig: { entities: [], categories: {} },
    filesMapByName: {},
};
