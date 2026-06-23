"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelStandata = void 0;
const base_1 = require("./base");
const models_json_1 = __importDefault(require("./runtime_data/models.json"));
const category_1 = require("./utils/category");
class ModelStandata extends base_1.Standata {
    getByName(name) {
        const allModels = this.getAll();
        return allModels.find((model) => model.name === name);
    }
    getByCategory(category) {
        const allModels = this.getAll();
        return allModels.filter((model) => {
            const categoryPath = `${model.categories.tier1 || "none"}/${model.categories.tier2 || "none"}/${model.categories.tier3 || "none"}/${model.categories.type || "none"}/${model.categories.subtype || "none"}`;
            return categoryPath.includes(category);
        });
    }
    getBySubtype(subtype) {
        const allModels = this.getAll();
        return allModels.filter((model) => model.categories.subtype === subtype);
    }
    getByTags(...tags) {
        const tagSet = new Set(tags);
        const allModels = this.getAll();
        return allModels.filter((model) => {
            const values = (0, category_1.getModelCategoryTags)(model);
            return values.some((v) => tagSet.has(v));
        });
    }
    getByPath(path) {
        const allModels = this.getAll();
        return allModels.filter((model) => model.path === path);
    }
    getByParameters(parameters) {
        const allModels = this.getAll();
        return allModels.filter((model) => {
            if (!model.parameters)
                return false;
            return Object.entries(parameters).every(([key, value]) => model.parameters[key] === value);
        });
    }
    getAllModelNames() {
        const allModels = this.getAll();
        return allModels.map((model) => model.name);
    }
    getAllModelPaths() {
        const allModels = this.getAll();
        return allModels.map((model) => model.path);
    }
    getUniqueSubtypes() {
        const allModels = this.getAll();
        const subtypes = new Set(allModels
            .map((model) => model.categories.subtype)
            .filter((subtype) => subtype !== undefined));
        return Array.from(subtypes);
    }
}
exports.ModelStandata = ModelStandata;
ModelStandata.runtimeData = models_json_1.default;
