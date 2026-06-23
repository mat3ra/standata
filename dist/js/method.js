"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodStandata = void 0;
const base_1 = require("./base");
const modelMethodFilter_1 = require("./modelMethodFilter");
const methods_json_1 = __importDefault(require("./runtime_data/methods.json"));
const category_1 = require("./utils/category");
class MethodStandata extends base_1.Standata {
    getByName(name) {
        const allMethods = this.getAll();
        return allMethods.find((method) => method.name === name);
    }
    getByUnitType(unitType) {
        const allMethods = this.getAll();
        return allMethods.filter((method) => method.units.some((unit) => (0, category_1.getCategoryValue)(unit.categories.type) === unitType));
    }
    getByUnitSubtype(unitSubtype) {
        const allMethods = this.getAll();
        return allMethods.filter((method) => method.units.some((unit) => (0, category_1.getCategoryValue)(unit.categories.subtype) === unitSubtype));
    }
    getByUnitTags(...tags) {
        const allMethods = this.getAll();
        return allMethods.filter((method) => method.units.some((unit) => tags.some((tag) => unit.tags.includes(tag))));
    }
    getByPath(path) {
        const allMethods = this.getAll();
        return allMethods.filter((method) => method.path === path);
    }
    getByUnitParameters(parameters) {
        const allMethods = this.getAll();
        return allMethods.filter((method) => method.units.some((unit) => {
            if (!unit.parameters)
                return false;
            return Object.entries(parameters).every(([key, value]) => unit.parameters[key] === value);
        }));
    }
    getAllMethodNames() {
        const allMethods = this.getAll();
        return allMethods.map((method) => method.name);
    }
    getAllMethodPaths() {
        const allMethods = this.getAll();
        return allMethods.map((method) => method.path);
    }
    getAllUnits() {
        const allMethods = this.getAll();
        return allMethods.flatMap((method) => method.units);
    }
    getUniqueUnitTypes() {
        const allUnits = this.getAllUnits();
        const types = new Set(allUnits
            .map((unit) => (0, category_1.getCategoryValue)(unit.categories.type))
            .filter((type) => type !== undefined));
        return Array.from(types);
    }
    getUniqueUnitSubtypes() {
        const allUnits = this.getAllUnits();
        const subtypes = new Set(allUnits
            .map((unit) => (0, category_1.getCategoryValue)(unit.categories.subtype))
            .filter((subtype) => subtype !== undefined));
        return Array.from(subtypes);
    }
    getCompatibleWithModel(model) {
        const filter = new modelMethodFilter_1.ModelMethodFilter();
        const allMethods = this.getAll();
        return filter.getCompatibleMethods(model, allMethods);
    }
}
exports.MethodStandata = MethodStandata;
MethodStandata.runtimeData = methods_json_1.default;
