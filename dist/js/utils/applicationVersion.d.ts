/**
 * Whether concrete `applicationVersion` satisfies a template / executable range spec.
 * Delegates to [`compare-versions`](https://www.npmjs.com/package/compare-versions): npm-style ranges work for
 * dot-separated numeric versions (including short semver like `7.5` and CalVer like `2025.07.22.2`).
 *
 * Empty string and `*` mean “any version”.
 */
export declare function applicationVersionSatisfiesSupportedRange(applicationVersion: string, rangeSpec: string): boolean;
