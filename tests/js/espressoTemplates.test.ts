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
        templateNames.forEach((templateName) => {
            it(`should correctly render ${templateName} with ${context.name} context and match expected output`, () => {
                const renderedTemplateFile = getRenderedTemplateFile(context.name, templateName);
                const output = env.getTemplate(renderedTemplateFile.name).render(context.context);
                expect(normalizeOutput(output)).to.equal(renderedTemplateFile.content);
            });
        });
    });
});
