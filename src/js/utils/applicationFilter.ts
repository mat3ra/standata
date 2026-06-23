import {
    FilterableEntity,
    FilterEntityListParams,
    FilterObject,
    FilterObjectsParams,
    FilterTree,
} from "../types/applicationFilter";

export enum FilterMode {
    ANY_MATCH = "ANY", // OR logic - at least one filter must match (for models)
    ALL_MATCH = "ALL", // AND logic - all filters must match (for methods)
}

function safelyGet(obj: any, ...args: string[]): any {
    let current = obj;
    // We use for instead of forEach to allow early return on undefined
    // eslint-disable-next-line no-restricted-syntax
    for (const arg of args) {
        if (current && typeof current === "object" && arg in current) {
            current = current[arg];
        } else {
            return undefined;
        }
    }
    return current;
}

function mergeTerminalNodes(obj: any): any[] {
    if (!obj || typeof obj !== "object") {
        return [];
    }

    const results: any[] = [];

    function traverse(current: any) {
        if (Array.isArray(current)) {
            results.push(...current);
        } else if (current && typeof current === "object") {
            Object.values(current).forEach(traverse);
        }
    }

    traverse(obj);
    return results;
}

function extractUniqueBy(filterObjects: FilterObject[], name: string): FilterObject[] {
    const seen = new Set();
    return filterObjects.filter((obj) => {
        let value: string | undefined;
        if (name === "path" && "path" in obj) {
            value = obj.path;
        } else if (name === "regex" && "regex" in obj) {
            value = obj.regex;
        }

        if (!obj || !value || seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

function getFilterObjects({
    filterTree,
    name = "",
    version = "",
    build = "",
    executable = "",
    flavor = "",
}: FilterObjectsParams): FilterObject[] {
    let filterList: FilterObject[];

    if (!name) {
        filterList = mergeTerminalNodes(filterTree);
    } else if (!version) {
        filterList = mergeTerminalNodes(safelyGet(filterTree, name));
    } else if (!build) {
        filterList = mergeTerminalNodes(safelyGet(filterTree, name, version));
    } else if (!executable) {
        filterList = mergeTerminalNodes(safelyGet(filterTree, name, version, build));
    } else if (!flavor) {
        filterList = mergeTerminalNodes(safelyGet(filterTree, name, version, build, executable));
    } else {
        filterList = safelyGet(filterTree, name, version, build, executable, flavor) || [];
    }

    return [...extractUniqueBy(filterList, "path"), ...extractUniqueBy(filterList, "regex")];
}

const matchesFilter = (entityPath: string, filter: FilterObject): boolean => {
    if ("path" in filter) {
        return entityPath === filter.path || entityPath.includes(filter.path);
    }
    if ("regex" in filter) {
        try {
            const regex = new RegExp(filter.regex);
            return regex.test(entityPath);
        } catch {
            return false;
        }
    }
    return false;
};

/**
 * Filters a list of entities and returns the default one based on filter criteria.
 *
 * This function performs a two-step process:
 * 1. Marks entities as default if they match a filter's `defaultPath`
 * 2. Returns the first marked entity that matches ALL filters
 *
 * @param entitiesOrPaths - Array of entity paths (strings) or entity objects with path property
 * @param filterObjects - Array of filters to apply (can include path, regex, and defaultPath)
 *
 * @returns The default entity (as string or object) that matches all filters, or the first entity if none match
 *
 * @example
 * // Given entities: ["models/dft/gga/pbe", "models/dft/lda/pz", "models/dft/gga/pbesol"]
 * // And filter: { regex: "gga", defaultPath: "models/dft/gga/pbe" }
 * // Returns: "models/dft/gga/pbe" (marked as default and matches the regex filter)
 *
 * @example
 * // Given entities: [{ path: "method/pw", name: "PW" }, { path: "method/lcao", name: "LCAO" }]
 * // And filter: { path: "method/pw", defaultPath: "method/pw" }
 * // Returns: { path: "method/pw", name: "PW", isDefault: true }
 */
function filterEntityListGetDefault({
    entitiesOrPaths,
    filterObjects,
}: FilterEntityListParams): string | FilterableEntity {
    if (!filterObjects || filterObjects.length === 0) {
        return entitiesOrPaths[0];
    }

    const arrayToMark = [...entitiesOrPaths];

    arrayToMark.forEach((entity, index, array) => {
        filterObjects.forEach((filter) => {
            const entityPath = typeof entity === "string" ? entity : entity.path;
            if (!entityPath) return;

            if ("defaultPath" in filter) {
                if (
                    entityPath === filter.defaultPath ||
                    entityPath.includes(<string>filter.defaultPath)
                ) {
                    if (typeof entity === "string") {
                        array[index] = { path: entityPath, isDefault: true };
                    } else {
                        array[index] = { ...entity, isDefault: true };
                    }
                }
            }
        });
    });

    const result = arrayToMark.filter((entity) => {
        if (typeof entity === "string") {
            return false;
        }
        return (
            entity.isDefault === true &&
            filterObjects.every((filter) => matchesFilter(entity.path, filter))
        );
    });

    if (result.length === 0) {
        return entitiesOrPaths[0];
    }
    if (typeof entitiesOrPaths[0] === "string" && typeof result[0] === "object") {
        return result[0].path;
    }

    return result[0];
}

function filterEntityList({
    entitiesOrPaths,
    filterObjects,
    filterMode = FilterMode.ANY_MATCH,
}: FilterEntityListParams & { filterMode?: FilterMode }): (string | FilterableEntity)[] {
    if (!filterObjects || filterObjects.length === 0) {
        return entitiesOrPaths;
    }

    return entitiesOrPaths.filter((entity) => {
        const entityPath = typeof entity === "string" ? entity : entity.path;
        if (!entityPath) return false;

        return filterMode === FilterMode.ALL_MATCH
            ? filterObjects.every((filter) => matchesFilter(entityPath, filter))
            : filterObjects.some((filter) => matchesFilter(entityPath, filter));
    });
}

export abstract class ApplicationFilterStandata {
    protected filterTree: FilterTree;

    protected filterMode: FilterMode;

    constructor(filterTree: FilterTree, filterMode = FilterMode.ANY_MATCH) {
        this.filterTree = filterTree || {};
        this.filterMode = filterMode;
    }

    protected filterByApplicationParameters(
        entityList: any[],
        name: string,
        version?: string,
        build?: string,
        executable?: string,
        flavor?: string,
    ): any[] {
        const filterObjects = getFilterObjects({
            filterTree: this.filterTree,
            name,
            version,
            build,
            executable,
            flavor,
        });

        return filterEntityList({
            entitiesOrPaths: entityList,
            filterObjects,
            filterMode: this.filterMode,
        });
    }

    getAvailableEntities(name: string): any {
        return this.filterTree[name] || {};
    }

    protected filterByApplicationParametersGetDefault(
        entityList: any[],
        name: string,
        version?: string,
        build?: string,
        executable?: string,
        flavor?: string,
    ): any {
        const filterObjects = getFilterObjects({
            filterTree: this.filterTree,
            name,
            version,
            build,
            executable,
            flavor,
        });

        return filterEntityListGetDefault({
            entitiesOrPaths: entityList,
            filterObjects,
        });
    }
}
