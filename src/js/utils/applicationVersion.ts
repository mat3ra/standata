import {
    satisfies as versionSatisfiesRange,
    validate as isValidApplicationVersion,
} from "compare-versions";

/**
 * Whether concrete `applicationVersion` satisfies a template / executable range spec.
 * Delegates to [`compare-versions`](https://www.npmjs.com/package/compare-versions): npm-style ranges work for
 * dot-separated numeric versions (including short semver like `7.5` and CalVer like `2025.07.22.2`).
 *
 * Empty string and `*` mean “any version”.
 */
export function applicationVersionSatisfiesSupportedRange(
    applicationVersion: string,
    rangeSpec: string,
): boolean {
    const range = rangeSpec.trim();
    if (range === "*" || range === "") {
        return true;
    }
    if (!isValidApplicationVersion(applicationVersion)) {
        return false;
    }
    try {
        return versionSatisfiesRange(applicationVersion, range);
    } catch {
        return false;
    }
}
