import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterfaceServer";
import type { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import type {
    ApplicationSchema,
    BaseMethod,
    BaseModel,
    ComputeArgumentsSchema,
    ComputePropertySchema,
    SubworkflowSchema,
} from "@mat3ra/esse/dist/js/types";
import * as ajv from "@mat3ra/esse/dist/js/utils/ajv";
import { getDefaultComputeConfig } from "@mat3ra/ide";
import { Utils } from "@mat3ra/utils";

export type FunctionsConfig = {
    functions?: {
        setDefaultCompute: null;
    };
};

/**
 * Applies optional post-build hooks declared in workflow/subworkflow YAML `config.functions`.
 *
 * Keys are hook names; values are ignored (`null` in YAML marks presence only). Each enabled
 * hook merges its return value into the entity. Used when building standata workflows and
 * subworkflows (e.g. `setDefaultCompute` injects default `compute` from `@mat3ra/ide`).
 */
export function applyFunctionsFromConfig<T extends Partial<ComputePropertySchema>>(
    entity: T,
    functionsConfig?: FunctionsConfig["functions"],
): T {
    const functions = {
        setDefaultCompute: (): ComputePropertySchema => {
            return { compute: getDefaultComputeConfig() as ComputeArgumentsSchema };
        },
    };

    return Object.entries(functionsConfig || {}).reduce((acc, [funcName]) => {
        return {
            ...acc,
            ...functions[funcName as keyof typeof functions]?.(),
        };
    }, entity);
}

export function validateData<T extends object>(data: T, schemaId: string): T {
    const jsonSchema = JSONSchemasInterface.getSchemaById(schemaId);
    if (!jsonSchema) {
        throw new Error(`Schema not found for ${schemaId}`);
    }
    const result = ajv.validateAndClean(data as AnyObject, jsonSchema, { coerceTypes: false });

    if (!result.isValid) {
        throw new Error(JSON.stringify({ error: result?.errors, json: data, schema: jsonSchema }));
    }

    return data;
}

export function generateDefaultWorkflowId(): string {
    return Utils.uuid.getUUID();
}

export function generateFlowChartId(unitName: string): string {
    return Utils.uuid.getUUIDFromNamespace(`flowchart-${unitName}`);
}

export function generateBuilderFlowChartId(seed: string, cache: string[] = []): string {
    const countInCache = cache.filter((s) => s === seed).length;
    cache.push(seed);

    const suffix = countInCache > 0 ? `-${countInCache}` : "";
    const seedWithSuffix = `${seed}${suffix}`;
    return Utils.uuid.getUUIDFromNamespace(seedWithSuffix);
}

export function generateWorkflowId(subworkflow: SubworkflowSchema): string {
    const { name, properties, application } = subworkflow;
    const propsInfo = properties?.length ? properties.sort().join(",") : "";
    const swInfo = [subworkflow].map((sw) => sw.name || "unknown").join(",");
    const seed = [`workflow-${name}`, application.name, propsInfo, swInfo]
        .filter((p) => p)
        .join("-");

    return Utils.uuid.getUUIDFromNamespace(seed);
}

export function generateSubworkflowId(
    name: string,
    application?: ApplicationSchema,
    model?: BaseModel,
    method?: BaseMethod,
): string {
    const appName = application?.name || "";
    const modelInfo = model ? `${model.type}-${model.subtype || ""}` : "";
    const methodInfo = method ? `${method.type}-${method.subtype || ""}` : "";
    const seed = [`subworkflow-${name}`, appName, modelInfo, methodInfo].filter((p) => p).join("-");

    return Utils.uuid.getUUIDFromNamespace(seed);
}
