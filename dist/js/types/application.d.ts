import { type RuntimeItemsSchema, type TemplateSchema, ApplicationSchema, ExecutableSchema, FlavorSchema } from "@mat3ra/esse/dist/js/types";
type VersionFields = "isDefault" | "build" | "hasAdvancedComputeOptions" | "version";
type ApplicationFields = "name" | "shortName" | "summary" | "isLicensed" | "isUsingMaterial" | "runConfig";
type RuntimeItemsFields = keyof RuntimeItemsSchema;
type PartialPick<T, K extends keyof T> = Partial<Pick<T, K>>;
type ApplicationVersion = Pick<ApplicationSchema, VersionFields> & {
    buildConfig: object;
};
export type ApplicationYAMLItem = Pick<ApplicationSchema, ApplicationFields> & {
    defaultVersion: string;
    versions: ApplicationVersion[];
};
export type FlavorYAMLItem = Pick<FlavorSchema, "input" | "isDefault"> & PartialPick<FlavorSchema, RuntimeItemsFields> & {
    supportedApplicationVersions?: string;
};
export type ExecutableYAMLItem = Pick<ExecutableSchema, "hasAdvancedComputeOptions" | "isDefault"> & PartialPick<ExecutableSchema, RuntimeItemsFields> & {
    flavors: Record<string, FlavorYAMLItem>;
    supportedApplicationVersions?: string;
};
export type TemplateYAMLItem = Pick<TemplateSchema, "name" | "content" | "contextProviders"> & {
    applicationName: string;
    executableName: string;
    supportedApplicationVersions?: string;
};
type OptionalExecutableSchema = Partial<ExecutableSchema>;
type RequiredExecutableFields = "hasAdvancedComputeOptions" | "isDefault" | "monitors" | "results";
type OptionalExecutableFields = "postProcessors";
type ExecutableTreeItem = Pick<ExecutableSchema, RequiredExecutableFields> & Pick<OptionalExecutableSchema, OptionalExecutableFields> & {
    flavors: Record<string, FlavorYAMLItem>;
    supportedApplicationVersions?: string[];
};
export type ApplicationExecutableTree = Record<string, Record<string, ExecutableTreeItem>>;
export {};
