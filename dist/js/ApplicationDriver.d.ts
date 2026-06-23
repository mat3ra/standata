import type { ApplicationSchema, ExecutableSchema, FlavorSchema, TemplateSchema } from "@mat3ra/esse/dist/js/types";
export declare class ApplicationDriver {
    private applications;
    private templates;
    private flavors;
    private executables;
    getApplications(): ApplicationSchema[];
    getTemplates(): TemplateSchema[];
    getFlavors(): FlavorSchema[];
    getExecutables(): ExecutableSchema[];
}
