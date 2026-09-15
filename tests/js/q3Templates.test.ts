import { expect } from "chai";
import * as yaml from "js-yaml";
import { Environment, FileSystemLoader } from "nunjucks";
import * as path from "path";

import { setupNunjucksEnvironment } from "../../src/js/utils/template";

type Q3Input = {
    method: {
        pseudopotentials: Record<string, string>;
    };
};

describe("Q3 Template Rendering", () => {
    const templateDirectory = path.join(
        __dirname,
        "../../assets/applications/input_files_templates/q3",
    );
    const environment = setupNunjucksEnvironment(
        new Environment(new FileSystemLoader(templateDirectory)),
    );

    it("renders selected pseudopotential paths for every atomic species", () => {
        const templateName = "scf.inp";
        const template = environment.getTemplate(templateName);
        const ironPseudopotentialPath =
            "/export/share/pseudo/fe/gga/pbe/gbrv/1.0/us/fe_pbe_gbrv_1.0.upf";
        const oxygenPseudopotentialPath =
            "/export/share/pseudo/o/gga/pbe/gbrv/1.2/us/o_pbe_gbrv_1.2.upf";
        const renderedInput = template.render({
            input: {
                ATOMIC_SPECIES: [
                    { X: "Fe", Mass_X: 55.845, PseudoPot_X: ironPseudopotentialPath },
                    { X: "O", Mass_X: 15.999, PseudoPot_X: oxygenPseudopotentialPath },
                ],
            },
        });
        const input = yaml.load(renderedInput) as Q3Input;

        expect(input.method.pseudopotentials).to.deep.equal({
            Fe: ironPseudopotentialPath,
            O: oxygenPseudopotentialPath,
        });
    });
});
