import { getRenderedTemplateFile, getTemplateContexts } from "@mat3ra/fixtures";
import { expect } from "chai";
import * as fs from "fs";
import { Environment, FileSystemLoader } from "nunjucks";
import * as path from "path";

import { setupNunjucksEnvironment } from "../../src/js/utils/template";

/**
 * Normalize template output for comparison
 * - Removes trailing whitespace from each line (templates may produce it)
 * - Normalizes line endings for cross-platform compatibility
 */
function normalizeOutput(output: string): string {
    return output
        .split("\n")
        .map((line) => line.replace(/\s+$/, ""))
        .join("\n")
        .replace(/\r\n/g, "\n");
}

describe("Espresso Template Rendering", () => {
    const templatePath = path.join(
        __dirname,
        "../../assets/applications/input_files_templates/espresso",
    );
    const templateNames = fs
        .readdirSync(templatePath)
        .filter(
            (fileName) => fileName.endsWith(".j2.in") && fileName !== "pw_scf_volume_scaled.j2.in",
        )
        .map((fileName) => fileName.replace(/\.j2\.in$/, ""))
        .sort();
    const env = setupNunjucksEnvironment(new Environment(new FileSystemLoader(templatePath)));

    getTemplateContexts().forEach((context) => {
        ["pw_scf", "pw_scf_volume_scaled"].forEach((templateName) => {
            it(`selects string and numeric material indices in ${templateName} with ${context.name} context`, () => {
                const template = env.getTemplate(`${templateName}.j2.in`);
                const perMaterial = [0, 1].map((index) => ({
                    ...context.context.input,
                    NAT: 10 + index,
                }));
                ["0", "1", 0, 1].forEach((materialIndex) => {
                    const output = template.render({
                        ...context.context,
                        input: { ...context.context.input, perMaterial },
                        subworkflowContext: { MATERIAL_INDEX: materialIndex },
                    });
                    const expected = template.render({
                        ...context.context,
                        input: perMaterial[Number(materialIndex)],
                    });
                    expect(output).to.equal(expected);
                });
            });
        });
        it(`accepts an explicit EOS functional with ${context.name} context`, () => {
            const output = env.getTemplate("pw_scf_volume_scaled.j2.in").render({
                ...context.context,
                input: { ...context.context.input, INPUT_DFT: "XC-000I-000I-101L-130L" },
            });
            expect(output).to.contain("input_dft = 'XC-000I-000I-101L-130L'");
        });
        it(`scales EOS cell vectors at runtime with ${context.name} context`, () => {
            const baseline = getRenderedTemplateFile(context.name, "pw_scf").content;
            const output = env.getTemplate("pw_scf_volume_scaled.j2.in").render(context.context);
            const cellPattern = /CELL_PARAMETERS angstrom\n([\s\S]*?)K_POINTS/;
            const baselineMatch = baseline.match(cellPattern);
            const runtimeMatch = output.match(cellPattern);
            if (!baselineMatch || !runtimeMatch) throw new Error("Missing cell vectors");
            const baselineCell = baselineMatch[1];
            const runtimeCell = runtimeMatch[1];
            // All non-cell input, including constrained fractional positions, is unchanged.
            expect(
                normalizeOutput(
                    output.replace(
                        cellPattern,
                        `CELL_PARAMETERS angstrom\n${baselineCell}K_POINTS`,
                    ),
                ),
            ).to.equal(baseline);
            const originalComponents = baselineCell.trim().split(/\s+/).map(Number);
            [0.88, 1.0, 1.12].forEach((volumeScale) => {
                const components = env
                    .renderString(runtimeCell, { VOLUME_SCALE: volumeScale })
                    .trim()
                    .split(/\s+/)
                    .map(Number);
                expect(components.length).to.equal(9);
                components.forEach((value, index) => {
                    expect(value).to.be.closeTo(
                        originalComponents[index] * Math.cbrt(volumeScale),
                        1e-8,
                    );
                });
            });
        });
        it(`keeps ordinary SCF unscaled with ${context.name} volume context`, () => {
            const output = env.getTemplate("pw_scf.j2.in").render({
                ...context.context,
                subworkflowContext: { ...context.context.subworkflowContext, VOLUME_SCALE: 1.12 },
            });
            expect(normalizeOutput(output)).to.equal(
                getRenderedTemplateFile(context.name, "pw_scf").content,
            );
        });
        templateNames.forEach((templateName) => {
            it(`should correctly render ${templateName} with ${context.name} context and match expected output`, () => {
                const renderedTemplateFile = getRenderedTemplateFile(context.name, templateName);
                const output = env.getTemplate(renderedTemplateFile.name).render(context.context);
                expect(normalizeOutput(output)).to.equal(renderedTemplateFile.content);
            });
        });
    });
});
