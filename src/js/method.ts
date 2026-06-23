import { Standata } from "./base";
import { ModelMethodFilter } from "./modelMethodFilter";
import METHODS from "./runtime_data/methods.json";
import { MethodConfig, UnitMethod } from "./types/method";
import { ModelConfig } from "./types/model";
import { getCategoryValue } from "./utils/category";

export class MethodStandata extends Standata<MethodConfig> {
    static runtimeData = METHODS;

    getByName(name: string): MethodConfig | undefined {
        const allMethods = this.getAll();
        return allMethods.find((method) => method.name === name);
    }

    getByUnitType(unitType: string): MethodConfig[] {
        const allMethods = this.getAll();
        return allMethods.filter((method) =>
            method.units.some((unit) => getCategoryValue(unit.categories.type) === unitType),
        );
    }

    getByUnitSubtype(unitSubtype: string): MethodConfig[] {
        const allMethods = this.getAll();
        return allMethods.filter((method) =>
            method.units.some((unit) => getCategoryValue(unit.categories.subtype) === unitSubtype),
        );
    }

    getByUnitTags(...tags: string[]): MethodConfig[] {
        const allMethods = this.getAll();
        return allMethods.filter((method) =>
            method.units.some((unit) => tags.some((tag) => unit.tags.includes(tag))),
        );
    }

    getByPath(path: string): MethodConfig[] {
        const allMethods = this.getAll();
        return allMethods.filter((method) => method.path === path);
    }

    getByUnitParameters(parameters: Record<string, any>): MethodConfig[] {
        const allMethods = this.getAll();
        return allMethods.filter((method) =>
            method.units.some((unit) => {
                if (!unit.parameters) return false;
                return Object.entries(parameters).every(
                    ([key, value]) => unit.parameters[key] === value,
                );
            }),
        );
    }

    getAllMethodNames(): string[] {
        const allMethods = this.getAll();
        return allMethods.map((method) => method.name);
    }

    getAllMethodPaths(): string[] {
        const allMethods = this.getAll();
        return allMethods.map((method) => method.path);
    }

    getAllUnits(): UnitMethod[] {
        const allMethods = this.getAll();
        return allMethods.flatMap((method) => method.units);
    }

    getUniqueUnitTypes(): string[] {
        const allUnits = this.getAllUnits();
        const types = new Set(
            allUnits
                .map((unit) => getCategoryValue(unit.categories.type))
                .filter((type): type is string => type !== undefined),
        );
        return Array.from(types);
    }

    getUniqueUnitSubtypes(): string[] {
        const allUnits = this.getAllUnits();
        const subtypes = new Set(
            allUnits
                .map((unit) => getCategoryValue(unit.categories.subtype))
                .filter((subtype): subtype is string => subtype !== undefined),
        );
        return Array.from(subtypes);
    }

    getCompatibleWithModel(model: ModelConfig): MethodConfig[] {
        const filter = new ModelMethodFilter();
        const allMethods = this.getAll();
        return filter.getCompatibleMethods(model, allMethods);
    }
}
