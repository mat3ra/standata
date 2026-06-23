import { JsYamlAllSchemas } from "@mat3ra/code/dist/js/utils";
import serverUtils from "@mat3ra/utils/server";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as lodash from "lodash";
import * as path from "path";

const IGNORE_MARKER = Symbol("YAML_IGNORE");

const ignoreType = new yaml.Type("!ignore", {
    kind: "mapping",
    construct: (data) => ({ ...data, [IGNORE_MARKER]: true }),
});

const schemaWithIgnore = JsYamlAllSchemas.extend([ignoreType]);

/**
 * Loads YAML with shared schema (e.g. !ignore). When `sourcesRoot` is set, temporarily
 * `chdir`s there so `!include` paths resolve consistently (they use process.cwd()).
 */
export function readYAMLFileResolved<T extends object>(filePath: string, sourcesRoot?: string): T {
    if (!sourcesRoot) {
        return serverUtils.yaml.readYAMLFile(filePath, { schema: schemaWithIgnore }) as T;
    }
    const originalCwd = process.cwd();
    try {
        process.chdir(sourcesRoot);
        const resolvedFilePath = path.resolve(sourcesRoot, filePath);
        return serverUtils.yaml.readYAMLFile(resolvedFilePath, { schema: schemaWithIgnore }) as T;
    } finally {
        process.chdir(originalCwd);
    }
}

export function hasIgnoreDirective(data?: { [IGNORE_MARKER]?: boolean }): boolean {
    return data?.[IGNORE_MARKER] === true;
}

export function resolveFromRoot(scriptDirname: string, ...pathSegments: string[]): string {
    return path.resolve(scriptDirname, "../..", ...pathSegments);
}

type BuildJSONOptions = {
    assetPath: string;
    targetPath: string;
    workingDir?: string;
    spaces?: number;
};

/**
 * Converts YAML file to JSON, optionally resolving relative includes from a working directory
 */
export function buildJSONFromYAMLInDir<T extends object>({
    assetPath,
    targetPath,
    workingDir,
    spaces = 0,
}: BuildJSONOptions) {
    const originalCwd = process.cwd();
    try {
        if (workingDir) {
            process.chdir(workingDir);
        }

        const data = readYAMLFileResolved<T>(assetPath);
        const resolvedTargetPath = workingDir ? path.resolve(originalCwd, targetPath) : targetPath;

        serverUtils.json.writeJSONFileSync(resolvedTargetPath, data, {
            spaces,
        });
        console.log(`Written asset "${assetPath}" to "${targetPath}"`);
        return data;
    } finally {
        if (workingDir) {
            process.chdir(originalCwd);
        }
    }
}

function isYAMLFile(filePath: string): boolean {
    return /\.(yml|yaml)$/i.test(filePath);
}

function removeYAMLExtension(filePath: string): string {
    return filePath.replace(/\.(yml|yaml)$/i, "");
}

/**
 * Processes a single YAML file with a callback.
 * Skips files marked with !ignore directive.
 */
function processYAMLFile<T extends object>(
    filePath: string,
    callback: (filePath: string, data: T) => void,
): void {
    try {
        const data = readYAMLFileResolved<T>(filePath);
        if (hasIgnoreDirective(data)) {
            console.log(`  Ignoring: ${filePath} (marked with !ignore)`);
            return;
        }
        callback(filePath, data);
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
    }
}

/**
 * Recursively traverses a path and processes YAML files.
 */
function traversePath<T extends object>(
    currentPath: string,
    callback: (filePath: string, data: T) => void,
): void {
    if (!fs.existsSync(currentPath)) return;

    const stat = fs.statSync(currentPath);

    if (stat.isDirectory()) {
        const items = fs.readdirSync(currentPath);
        items.forEach((item) => traversePath<T>(path.join(currentPath, item), callback));
    } else if (stat.isFile() && isYAMLFile(currentPath)) {
        processYAMLFile<T>(currentPath, callback);
    }
}

/**
 * Traverses a directory and processes YAML files with a callback.
 * Skips files marked with !ignore directive.
 */
export function traverseYAMLFiles<T extends object>(
    rootPath: string,
    callback: (filePath: string, data: T) => void,
): void {
    traversePath<T>(rootPath, callback);
}

/**
 * Loads a directory tree of YAML files into a nested object structure.
 * Uses lodash-compatible object paths for nested structure.
 */
export function loadYAMLTree<T extends object>(rootPath: string): Record<string, T> {
    const tree: Record<string, T> = {};

    traverseYAMLFiles<T>(rootPath, (filePath, data) => {
        const objectPath = serverUtils.file.createObjectPathFromFilePath(filePath, rootPath);
        lodash.set(tree, objectPath, data);
    });

    return tree;
}

/**
 * Encodes entity data as a URL path with categories and parameters.
 */
export function encodeDataAsURLPath(
    data: any,
    categoryKeys: string[] = [],
    placeholder = "none",
): string {
    const pathSegments = categoryKeys.map((key) => data.categories?.[key] || placeholder).join("/");

    const params = new URLSearchParams();
    if (data.parameters) {
        Object.entries(data.parameters).forEach(([key, value]) => {
            const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
            params.append(key, stringValue);
        });
    }

    return params.toString() ? `/${pathSegments}?${params.toString()}` : `/${pathSegments}`;
}

/**
 * Loads YAML files from a directory and stores them in a map keyed by filename (without extension).
 * Recursively searches subdirectories. Adds __path__ metadata with the relative path.
 *
 * Example:
 *   Input: assets/workflows/subworkflows/python/
 *     - python_script.yml
 *     - ml/classification_tail.yml
 *   Output: {
 *     python_script: { __path__: "python_script", ... },
 *     classification_tail: { __path__: "ml/classification_tail", ... }
 *   }
 */
export function loadYAMLFilesAsMap<T extends object>(dirPath: string) {
    const result: Record<string, T & { __path__: string }> = {};

    traverseYAMLFiles<T>(dirPath, (filePath, data) => {
        const key = removeYAMLExtension(path.basename(filePath));
        const relativePath = removeYAMLExtension(path.relative(dirPath, filePath));
        result[key] = { __path__: relativePath, ...data };
    });

    return result;
}

export function findJsonFilesRecursively(dir: string): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) {
        return results;
    }
    const items = fs.readdirSync(dir);
    items.forEach((item) => {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            results.push(...findJsonFilesRecursively(full));
        } else if (stat.isFile() && item.endsWith(".json")) {
            results.push(full);
        }
    });
    return results;
}
