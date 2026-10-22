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
        .filter((fileName) => fileName.endsWith(".j2.in"))
        .map((fileName) => fileName.replace(/\.j2\.in$/, ""))
        .sort();
    const env = setupNunjucksEnvironment(new Environment(new FileSystemLoader(templatePath)));

    getTemplateContexts().forEach((context) => {
        it(`scales EOS cell vectors at runtime with ${context.name} context`, () => {
            const baseline = getRenderedTemplateFile(context.name, "pw_scf").content;
            const output = env.getTemplate("pw_scf.j2.in").render({
                ...context.context,
                subworkflowContext: {
                    ...context.context.subworkflowContext,
                    VOLUME_SCALE: "INITIAL_VOLUME_SCALE + VOLUME_INDEX * VOLUME_SCALE_INCREMENT",
                },
            });
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
        templateNames.forEach((templateName) => {
            it(`should correctly render ${templateName} with ${context.name} context and match expected output`, () => {
                const renderedTemplateFile = getRenderedTemplateFile(context.name, templateName);
                const output = env.getTemplate(renderedTemplateFile.name).render(context.context);
                expect(normalizeOutput(output)).to.equal(renderedTemplateFile.content);
            });
        });
    });
});
