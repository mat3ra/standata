import type { ApplicationSchema, ExecutableSchema, FlavorSchema, TemplateSchema } from "@mat3ra/esse/dist/js/types";
export declare enum TAGS {
    DEFAULT = "default",
    DEFAULT_VERSION = "default_version",
    DEFAULT_BUILD = "default_build"
}
export interface ApplicationDriver {
    getApplications(): ApplicationSchema[];
    getTemplates(): TemplateSchema[];
    getFlavors(): FlavorSchema[];
    getExecutables(): ExecutableSchema[];
}
export default class ApplicationRegistry {
    static driver: ApplicationDriver;
    private driver;
    static setDriver(driver: ApplicationDriver): void;
    constructor(driver?: ApplicationDriver);
    getApplications(): ApplicationSchema[];
    getTemplates(): TemplateSchema[];
    getFlavors(): FlavorSchema[];
    getExecutables(): ExecutableSchema[];
    findApplication({ name, version, build }: {
        name: string;
        version?: string;
        build?: string;
    }): ApplicationSchema;
    getDefaultApplication(): ApplicationSchema | undefined;
    getExecutablesByApplication(application: Pick<ApplicationSchema, "name" | "version">): ExecutableSchema[];
    getFlavorsByApplicationExecutable(application: Pick<ApplicationSchema, "name" | "version">, executable: Pick<ExecutableSchema, "name">): FlavorSchema[];
    getDefaultFlavor(application: Pick<ApplicationSchema, "name" | "version">, executable: Pick<ExecutableSchema, "name">): FlavorSchema;
    getInput(application: Pick<ApplicationSchema, "name" | "version">, flavor: FlavorSchema): TemplateSchema[];
}
