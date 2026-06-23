import type {
    ApplicationSchema,
    AssertionUnitSchema,
    AssignmentUnitSchema,
    ConditionUnitSchema,
    DataIOUnitSchema,
    DFTModelSchema,
    LegacyMethodPseudopotential,
    RuntimeItemNameObjectSchema,
    SubworkflowSchema,
    UnknownModelSchema,
    WorkflowBaseUnitSchema,
} from "@mat3ra/esse/dist/js/types";
import {
    default_methods as MethodConfigs,
    default_models as ModelConfigs,
    MethodConversionHandler,
    MethodFactory,
    ModelFactory,
} from "@mat3ra/mode";

import { ApplicationMethodStandata } from "../../../src/js/applicationMethod";
import ApplicationRegistry from "../../../src/js/ApplicationRegistry";
import { setUnitLinks } from "../../../src/js/utils/unit";
import {
    defaultAssertionUnit,
    defaultAssignmentUnit,
    defaultConditionUnit,
    defaultIOUnit,
} from "./defaults";
import { dynamicSubworkflowsByApp, getSurfaceEnergySubworkflowUnits } from "./dynamicSubworkflows";
import ExecutionUnitConfigBuilder, {
    type ExecutionConfig,
} from "./unitBuilders/ExecutionUnitConfigBuilder";
import {
    type FunctionsConfig,
    applyFunctionsFromConfig,
    generateFlowChartId,
    generateSubworkflowId,
    validateData,
} from "./utils";

type UnitConfig<T extends { type: string }> = {
    type: T["type"];
    config: Partial<Omit<T, "type">>;
};

type AssignmentConfig = UnitConfig<AssignmentUnitSchema>;
type IOConfig = UnitConfig<DataIOUnitSchema>;
type ConditionConfig = UnitConfig<ConditionUnitSchema>;
type AssertionConfig = UnitConfig<AssertionUnitSchema>;
type ExecutionBuilderConfig = ExecutionBuilderFunctionsConfig &
    AttributesConfig & {
        type: "executionBuilder";
        config: ExecutionConfig;
    };

export type AnyUnitConfig = AttributesConfig &
    (ExecutionBuilderConfig | AssignmentConfig | IOConfig | ConditionConfig | AssertionConfig);

type MethodConfig =
    | {
          name: "PseudopotentialMethod";
          config?: Pick<LegacyMethodPseudopotential, "type" | "subtype">;
          setSearchText?: string;
      }
    | {
          name: "UnknownMethod" | "LocalOrbitalMethod";
          setSearchText?: string;
          config?: object;
      };

type ModelConfig =
    | {
          name: "UnknownModel";
          config?: Pick<UnknownModelSchema, "type" | "subtype">;
      }
    | {
          name: "DFTModel";
          config?: Pick<DFTModelSchema, "type" | "subtype" | "functional">;
      };

export type AttributesConfig = {
    attributes?: {
        name?: string;
        [key: string]: unknown;
    };
};

type ExecutionBuilderFunctionsConfig = {
    functions?: {
        addResults?: RuntimeItemNameObjectSchema[];
        head?: boolean;
    };
};

type DynamicSubworkflow = {
    name: "surfaceEnergy" | "getQpointIrrep";
    subfolder?: "espresso";
};

type SubworkflowConfig = AttributesConfig & Partial<SubworkflowSchema> & FunctionsConfig;

export type SubworkflowData = {
    name: string;
    application: Pick<ApplicationSchema, "name" | "version">;
    model: ModelConfig;
    method: MethodConfig;
    units: AnyUnitConfig[];
    config?: SubworkflowConfig;
    dynamicSubworkflow?: DynamicSubworkflow;
};

function createModel(model: ModelConfig) {
    const { name, config } = model;

    const modelConfigs = {
        DFTModel: ModelConfigs.DFTModelConfig,
        UnknownModel: ModelConfigs.UnknownModelConfig,
    };

    const defaultConfig =
        modelConfigs[name as keyof typeof modelConfigs] || modelConfigs.UnknownModel;

    return ModelFactory.create({ ...defaultConfig, ...config });
}

function createMethod(config: MethodConfig, application: ApplicationSchema) {
    const { name } = config;
    const defaultConfig = MethodConfigs[`${name}Config`] || MethodConfigs.UnknownMethodConfig;

    const defaultConfigForApp =
        new ApplicationMethodStandata().getDefaultMethodConfigForApplication(application);

    const defaultConfigForAppSimple =
        defaultConfigForApp && defaultConfigForApp.units
            ? MethodConversionHandler.convertToSimple(defaultConfigForApp)
            : defaultConfigForApp;

    const method = MethodFactory.create({
        ...defaultConfig,
        ...defaultConfigForAppSimple,
        ...config.config,
    });

    return method;
}

function createUnitSchema<T extends WorkflowBaseUnitSchema>(
    config: UnitConfig<T>,
    defaultUnitConfig: Partial<Omit<T, "flowchartId">> & { name: string },
) {
    const name = config.config.name || defaultUnitConfig.name;
    const flowchartId = config.config.flowchartId || generateFlowChartId(name);

    return {
        ...defaultUnitConfig,
        ...config.config,
        name,
        flowchartId,
    } as T;
}

function createUnits(units: AnyUnitConfig[], application: ApplicationSchema, cache: string[] = []) {
    return units.map((unitConfig) => {
        if (unitConfig.type === "executionBuilder") {
            return new ExecutionUnitConfigBuilder(unitConfig.config, application, cache)
                .applyFunctions(unitConfig.functions)
                .build(unitConfig.attributes);
        }

        if (unitConfig.type === "assignment") {
            return createUnitSchema(unitConfig, defaultAssignmentUnit);
        }
        if (unitConfig.type === "io") {
            return createUnitSchema(unitConfig, defaultIOUnit);
        }
        if (unitConfig.type === "condition") {
            return createUnitSchema(unitConfig, defaultConditionUnit);
        }
        if (unitConfig.type === "assertion") {
            return createUnitSchema(unitConfig, defaultAssertionUnit);
        }

        throw new Error(`Unit not recognized`);
    });
}

function createDynamicUnits<T extends WorkflowBaseUnitSchema>(
    subworkflow: DynamicSubworkflow,
    unit: T,
    application: ApplicationSchema,
) {
    const { name, subfolder } = subworkflow;

    if (name === "surfaceEnergy") {
        return getSurfaceEnergySubworkflowUnits(unit);
    }

    if (name === "getQpointIrrep") {
        return subfolder ? dynamicSubworkflowsByApp[subfolder].getQpointIrrep(application) : [];
    }

    throw new Error(`dynamicSubworkflow=${name} not recognized`);
}

export default function createSubworkflow(subworkflowData: SubworkflowData, cache: string[] = []) {
    const application = new ApplicationRegistry().findApplication(subworkflowData.application);

    const model = createModel(subworkflowData.model);
    const method = createMethod(subworkflowData.method, application);
    const units = createUnits(subworkflowData.units, application, cache);

    const { config, dynamicSubworkflow } = subworkflowData;

    const finalUnits = dynamicSubworkflow
        ? createDynamicUnits(dynamicSubworkflow, units[0], application)
        : units;

    const subworkflow: SubworkflowSchema = {
        ...config,
        _id: generateSubworkflowId(
            config?.attributes?.name || subworkflowData.name,
            application,
            model,
            method,
        ),
        name: subworkflowData.name,
        application,
        properties: Array.from(
            new Set(
                finalUnits
                    .map((x) => x.results?.map((r) => r.name) || [])
                    .flat()
                    .sort(),
            ),
        ),
        model: {
            ...model._json,
            method: {
                ...method._json,
                data: {
                    ...method.data,
                    searchText: subworkflowData.method.setSearchText,
                },
            },
        } as SubworkflowSchema["model"],
        units: setUnitLinks(finalUnits),
        ...config?.attributes,
    };

    const finalSubworkflow = applyFunctionsFromConfig(subworkflow, config?.functions);

    return validateData(finalSubworkflow, "workflow/subworkflow");
}
