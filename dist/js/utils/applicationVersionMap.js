"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationVersionsMap = void 0;
class ApplicationVersionsMap {
    constructor(config) {
        this.map = config;
        this.defaultVersion = config.defaultVersion;
        this.versions = config.versions;
        this.shortName = config.shortName;
        this.summary = config.summary;
        this.isLicensed = config.isLicensed;
    }
    get name() {
        return this.map.name;
    }
    get nonVersionProperties() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { versions: _, defaultVersion: __, ...rest } = this.map;
        return rest;
    }
    get versionConfigs() {
        return this.map.versions;
    }
    get versionConfigsFull() {
        return this.versionConfigs.map((versionConfig) => {
            return {
                ...this.nonVersionProperties,
                ...versionConfig,
            };
        });
    }
    getSlugForVersionConfig(versionConfigFull) {
        const buildSuffix = versionConfigFull.build
            ? `_${versionConfigFull.build.toLowerCase()}`
            : "";
        const versionSuffix = versionConfigFull.version;
        return `${this.name}${buildSuffix}_${versionSuffix}.json`;
    }
}
exports.ApplicationVersionsMap = ApplicationVersionsMap;
