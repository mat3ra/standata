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

type Q3NonSelfConsistentInput = {
    control: {
        calculation: string;
        prefix: string;
        kpoints_list: [number, number, number, number][];
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
            cutoffs: { wavefunction: 30, density: 240 },
            kgrid: { dimensions: [3, 3, 3], shifts: [0, 0, 0] },
        });
        const input = yaml.load(renderedInput) as Q3Input;

        expect(input.method.pseudopotentials).to.deep.equal({
            Fe: ironPseudopotentialPath,
            O: oxygenPseudopotentialPath,
        });
    });

    it("renders the full Monkhorst-Pack grid as the NSCF k-point list", () => {
        const template = environment.getTemplate("nscf.inp");
        const renderedInput = template.render({
            input: {
                ATOMIC_SPECIES: [{ X: "Cu", Mass_X: 63.546, PseudoPot_X: "/pseudo/cu.upf" }],
            },
            cutoffs: { wavefunction: 40, density: 320 },
            kgrid: { dimensions: [4, 3, 2], shifts: [0, 1, 0] },
        });
        const input = yaml.load(renderedInput) as Q3NonSelfConsistentInput;
        const kpointsList = input.control.kpoints_list;
        const weightSum = kpointsList.reduce((sum, kpoint) => sum + kpoint[3], 0);
        const coordinates = kpointsList.flatMap((kpoint) => kpoint.slice(0, 3));

        expect(input.control.calculation).to.equal("nscf");
        expect(input.control.prefix).to.equal("q3");
        expect(kpointsList).to.have.lengthOf(4 * 3 * 2);
        expect(weightSum).to.be.closeTo(2.0, 1.0e-9);
        expect(coordinates.every((value) => value >= -0.5 && value < 0.5)).to.equal(true);
        // Unshifted 4-point axis folds 0.5 to -0.5; shifted 3-point axis starts at 1/6
        const [foldedX, shiftedY, unshiftedZ] = kpointsList[2 * 3 * 2];
        expect(foldedX).to.equal(-0.5);
        expect(shiftedY).to.be.closeTo(1 / 6, 1.0e-9);
        expect(unshiftedZ).to.equal(0);
    });
});
