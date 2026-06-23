import { ApplicationSchema } from "@mat3ra/esse/dist/js/types";
import { ApplicationConfigItem, ApplicationVersion } from "../types/application";
export declare class ApplicationVersionsMap implements ApplicationConfigItem {
    shortName: string;
    summary: string;
    isLicensed?: boolean | undefined;
    defaultVersion: string;
    versions: ApplicationVersion[];
    map: ApplicationConfigItem;
    constructor(config: ApplicationConfigItem);
    get name(): string;
    get nonVersionProperties(): {
        name: string;
        shortName: string;
        summary: string;
        isLicensed?: boolean | undefined;
    };
    get versionConfigs(): ApplicationVersion[];
    get versionConfigsFull(): ApplicationSchema[];
    getSlugForVersionConfig(versionConfigFull: ApplicationSchema): string;
}
