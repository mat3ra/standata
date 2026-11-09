import { expect } from "chai";
import * as fs from "fs";
import { Environment, FileSystemLoader } from "nunjucks";
import * as path from "path";

import { setupNunjucksEnvironment } from "../../src/js/utils/template";

const TEMPLATES_ROOT = path.join(__dirname, "../../assets/applications/input_files_templates");
const WFN_BANDS_TEMPLATE = "espresso/pw_bands_bgw_wfn.j2.in";
const WFNQ_BANDS_TEMPLATE = "espresso/pw_bands_bgw_wfnq.j2.in";
const WFN_CONVERSION_TEMPLATE = "espresso/pw2bgw_wfn.j2.in";
const WFNQ_CONVERSION_TEMPLATE = "espresso/pw2bgw_wfnq.j2.in";
const EPSILON_TEMPLATE = "berkeleygw/epsilon.j2.inp";
const Q0_SHIFT_TEMPLATES = [WFNQ_BANDS_TEMPLATE, WFNQ_CONVERSION_TEMPLATE, EPSILON_TEMPLATE];

/// pw2bgw.x real_or_complex value for the complex flavor of BerkeleyGW (*.cplx.x)
const COMPLEX_FLAVOR = 2;

const KGRID_DIMENSIONS = [2, 3, 4];
const NUMBER_OF_KPOINTS = KGRID_DIMENSIONS[0] * KGRID_DIMENSIONS[1] * KGRID_DIMENSIONS[2];

const environment = setupNunjucksEnvironment(new Environment(new FileSystemLoader(TEMPLATES_ROOT)));

const context = {
    input: {
        RESTART_MODE: "from_scratch",
        IBRAV: 0,
        NAT: 2,
        NTYP: 1,
        ATOMIC_SPECIES: [{ X: "Si", Mass_X: 28.0855, PseudoPot_X: "si_pbe_dojo-oncv.upf" }],
        ATOMIC_POSITIONS: [
            { X: "Si", x: 0, y: 0, z: 0, "if_pos(1)": 1, "if_pos(2)": 1, "if_pos(3)": 1 },
            { X: "Si", x: 0.25, y: 0.25, z: 0.25, "if_pos(1)": 1, "if_pos(2)": 1, "if_pos(3)": 1 },
        ],
        CELL_PARAMETERS: { v1: [0, 2.715, 2.715], v2: [2.715, 0, 2.715], v3: [2.715, 2.715, 0] },
    },
    cutoffs: { wavefunction: 40, density: 160 },
    kgrid: { dimensions: KGRID_DIMENSIONS, shifts: [0, 0, 0] },
};

function render(templatePath: string): string {
    return environment.getTemplate(templatePath).render(context);
}

/**
 * Reads the q0 shift declared as `{% set q0_shift = <value> %}` in a template source.
 */
function readQ0Shift(templatePath: string): number {
    const source = fs.readFileSync(path.join(TEMPLATES_ROOT, templatePath), "utf8");
    const match = source.match(/set\s+q0_shift\s*=\s*([0-9.eE+-]+)/);
    if (!match) throw new Error(`q0_shift is not declared in ${templatePath}`);
    return Number(match[1]);
}

/**
 * Reads an integer parameter written as `<name> = <value>` or `<name> <value>`.
 */
function readIntegerParameter(renderedInput: string, parameterName: string): number {
    const pattern = new RegExp(`^\\s*${parameterName}\\s*=?\\s*(\\d+)\\s*$`, "m");
    const match = renderedInput.match(pattern);
    if (!match) throw new Error(`${parameterName} not found in rendered input`);
    return Number(match[1]);
}

function parseNumericRows(lines: string[]): number[][] {
    return lines.map((line) => line.trim().split(/\s+/).map(Number));
}

/**
 * Returns the full, unshifted grid points in crystal coordinates, in loop order.
 */
function fullGridPoints(): number[][] {
    const [n1, n2, n3] = KGRID_DIMENSIONS;
    const points: number[][] = [];
    for (let i = 0; i < n1; i += 1) {
        for (let j = 0; j < n2; j += 1) {
            for (let k = 0; k < n3; k += 1) points.push([i / n1, j / n2, k / n3]);
        }
    }
    return points;
}

function extractKPoints(renderedInput: string): number[][] {
    const lines = renderedInput.split("\n");
    const headerIndex = lines.findIndex((line) => line.startsWith("K_POINTS crystal"));
    expect(headerIndex).to.be.greaterThan(-1);
    expect(Number(lines[headerIndex + 1])).to.equal(NUMBER_OF_KPOINTS);
    return parseNumericRows(lines.slice(headerIndex + 2).filter((line) => line.trim().length > 0));
}

function extractQPoints(renderedInput: string): number[][] {
    const qpointsBlock = renderedInput.split("begin qpoints\n")[1].split("\nend")[0];
    return parseNumericRows(qpointsBlock.split("\n").filter((line) => line.trim().length > 0));
}

function expectPointsClose(actual: number[][], expected: number[][]) {
    expect(actual).to.have.lengthOf(expected.length);
    actual.forEach((point, pointIndex) => {
        point.forEach((value, axisIndex) => {
            expect(value).to.be.closeTo(expected[pointIndex][axisIndex], 1e-8);
        });
    });
}

describe("BerkeleyGW Template Rendering", () => {
    const q0Shift = readQ0Shift(EPSILON_TEMPLATE);

    describe("consistency across templates", () => {
        it("declares the same q0 shift in WFNq, its conversion and Epsilon", () => {
            const q0ShiftsByTemplate = Object.fromEntries(
                Q0_SHIFT_TEMPLATES.map((templatePath) => [templatePath, readQ0Shift(templatePath)]),
            );
            Object.values(q0ShiftsByTemplate).forEach((value) => {
                expect(value, JSON.stringify(q0ShiftsByTemplate)).to.equal(q0Shift);
            });
            expect(q0Shift).to.be.greaterThan(0);
        });

        it("keeps Epsilon and vxc band counts within the bands computed for WFN", () => {
            const numberOfWfnBands = readIntegerParameter(render(WFN_BANDS_TEMPLATE), "nbnd");
            const numberOfEpsilonBands = readIntegerParameter(
                render(EPSILON_TEMPLATE),
                "number_bands",
            );
            const maximumVxcBand = readIntegerParameter(
                render(WFN_CONVERSION_TEMPLATE),
                "vxc_diag_nmax",
            );

            expect(numberOfEpsilonBands).to.be.at.most(numberOfWfnBands);
            expect(maximumVxcBand).to.be.at.most(numberOfWfnBands);
        });

        it("writes WFN and WFNq for the complex flavor used by epsilon.cplx.x", () => {
            [WFN_CONVERSION_TEMPLATE, WFNQ_CONVERSION_TEMPLATE].forEach((templatePath) => {
                const realOrComplex = readIntegerParameter(render(templatePath), "real_or_complex");
                expect(realOrComplex, templatePath).to.equal(COMPLEX_FLAVOR);
            });
        });
    });

    describe("mean-field (Quantum ESPRESSO)", () => {
        it("renders a bands run on the full unshifted k-grid for WFN", () => {
            const renderedInput = render(WFN_BANDS_TEMPLATE);
            expect(renderedInput).to.include("calculation = 'bands'");

            const expectedKPoints = fullGridPoints().map((point) => [...point, 1]);
            expectPointsClose(extractKPoints(renderedInput), expectedKPoints);
        });

        it("renders the k-grid shifted by q0 for WFNq without fixing the number of bands", () => {
            const renderedInput = render(WFNQ_BANDS_TEMPLATE);
            expect(renderedInput).to.include("calculation = 'bands'");
            expect(renderedInput).to.not.include("nbnd");

            const expectedKPoints = fullGridPoints().map(([x, y, z]) => [x, y, z + q0Shift, 1]);
            expectPointsClose(extractKPoints(renderedInput), expectedKPoints);
        });

        it("converts WFN, RHO and vxc into the job working directory", () => {
            const renderedInput = render(WFN_CONVERSION_TEMPLATE);
            expect(renderedInput).to.include("wfng_file = '../WFN'");
            expect(renderedInput).to.include("rhog_file = '../RHO'");
            expect(renderedInput).to.include("vxc_file = '../vxc.dat'");
            KGRID_DIMENSIONS.forEach((dimension, axisIndex) => {
                const parameterName = `wfng_nk${axisIndex + 1}`;
                expect(readIntegerParameter(renderedInput, parameterName)).to.equal(dimension);
            });
            expect(renderedInput).to.include("wfng_dk3 = 0.0\n");
        });

        it("converts WFNq with the q0 offset in units of the grid spacing", () => {
            const renderedInput = render(WFNQ_CONVERSION_TEMPLATE);
            expect(renderedInput).to.include("wfng_file = '../WFNq'");

            const match = renderedInput.match(/wfng_dk3 = ([0-9.]+)/);
            if (!match) throw new Error("wfng_dk3 not found in rendered input");
            expect(Number(match[1])).to.be.closeTo(q0Shift * KGRID_DIMENSIONS[2], 1e-8);
        });
    });

    describe("Epsilon (BerkeleyGW)", () => {
        it("renders q-points as the k-grid with q = 0 replaced by the flagged q0", () => {
            const expectedQPoints = [
                [0, 0, q0Shift, 1, 1],
                ...fullGridPoints()
                    .slice(1)
                    .map((point) => [...point, 1, 0]),
            ];
            expectPointsClose(extractQPoints(render(EPSILON_TEMPLATE)), expectedQPoints);
        });
    });
});
