"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationVersionSatisfiesSupportedRange = applicationVersionSatisfiesSupportedRange;
const compare_versions_1 = require("compare-versions");
/**
 * Whether concrete `applicationVersion` satisfies a template / executable range spec.
 * Delegates to [`compare-versions`](https://www.npmjs.com/package/compare-versions): npm-style ranges work for
 * dot-separated numeric versions (including short semver like `7.5` and CalVer like `2025.07.22.2`).
 *
 * Empty string and `*` mean “any version”.
 */
function applicationVersionSatisfiesSupportedRange(applicationVersion, rangeSpec) {
    const range = rangeSpec.trim();
    if (range === "*" || range === "") {
        return true;
    }
    if (!(0, compare_versions_1.validate)(applicationVersion)) {
        return false;
    }
    try {
        return (0, compare_versions_1.satisfies)(applicationVersion, range);
    }
    catch (_a) {
        return false;
    }
}
