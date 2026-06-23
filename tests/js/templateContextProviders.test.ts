import { expect } from "chai";

import { BUILD_CONFIG } from "../../build-config";
import { validateTemplateContextProviders } from "../../scripts/processors/utils/contextProviders";
import { readYAMLFileResolved, resolveFromRoot } from "../../scripts/utils";
import type { TemplateYAMLItem } from "../../src/js/types/application";

function templateAssetToSchema(templateData: TemplateYAMLItem) {
    return {
        name: templateData.name,
        contextProviders: templateData.contextProviders,
        content: templateData.content,
        applicationName: templateData.applicationName,
        executableName: templateData.executableName,
    };
}

function stripJinjaRawBlocks(templateContent: string): string {
    return templateContent.replace(/\{%\s*raw\s*%\}[\s\S]*?\{%\s*endraw\s*%\}/g, "");
}

function isJinjaKeyReferencedInTemplate(templateContent: string, jinjaKey: string): boolean {
    const searchableContent = stripJinjaRawBlocks(templateContent);
    const keyPattern = jinjaKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${keyPattern}\\b`).test(searchableContent);
}

describe("template context provider lint", () => {
    it("strips jinja raw blocks before searching for provider keys", () => {
        const content = [
            "before",
            "{% raw %}{{ kgrid.dimensions }}{% endraw %}",
            "after {{ qgrid.dimensions }}",
        ].join("\n");

        expect(stripJinjaRawBlocks(content)).to.not.include("kgrid");
        expect(isJinjaKeyReferencedInTemplate(content, "kgrid")).to.equal(false);
        expect(isJinjaKeyReferencedInTemplate(content, "qgrid")).to.equal(true);
    });

    it("reports no issues when template content references the provider jinja key", () => {
        expect(() =>
            validateTemplateContextProviders([
                {
                    name: "gw_bands_plasmon_pole.in",
                    applicationName: "espresso",
                    executableName: "gw.x",
                    content:
                        "kpt_grid = {{ kgrid.dimensions|join(', ') }}\nqpt_grid = {{ qgrid.dimensions|join(', ') }}",
                    contextProviders: [
                        { name: "KGridFormDataManager" },
                        { name: "QGridFormDataManager" },
                    ],
                },
            ]),
        ).to.not.throw();
    });

    it("reports missing jinja references for declared providers", () => {
        expect(() =>
            validateTemplateContextProviders([
                {
                    name: "INCAR",
                    applicationName: "vasp",
                    executableName: "vasp",
                    content: "ISMEAR = 0\nSIGMA = 0.05",
                    contextProviders: [{ name: "VASPInputDataManager" }],
                },
            ]),
        ).to.throw(/VASPInputDataManager.*Jinja key "input"/);
    });

    it("reports unknown provider class names", () => {
        expect(() =>
            validateTemplateContextProviders([
                {
                    name: "custom.in",
                    applicationName: "espresso",
                    executableName: "pw.x",
                    content: "{{ kgrid.dimensions }}",
                    contextProviders: [{ name: "NotARealProvider" }],
                },
            ]),
        ).to.throw(/unknown context provider "NotARealProvider"/);
    });

    it("throws a formatted error when validation fails", () => {
        expect(() =>
            validateTemplateContextProviders([
                {
                    name: "INCAR",
                    applicationName: "vasp",
                    executableName: "vasp",
                    content: "ISMEAR = 0",
                    contextProviders: [{ name: "VASPInputDataManager" }],
                },
            ]),
        ).to.throw(/Template context provider lint failed/);
    });

    it("passes for all standata application templates", () => {
        const sourcesRoot = resolveFromRoot(__dirname, BUILD_CONFIG.applications.assets.path);
        const templates = readYAMLFileResolved<TemplateYAMLItem[]>(
            BUILD_CONFIG.applications.assets.templates,
            sourcesRoot,
        ).map(templateAssetToSchema);

        expect(() => validateTemplateContextProviders(templates)).to.not.throw();
    });
});
