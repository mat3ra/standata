import { expect } from "chai";
import { readFileSync } from "fs";
import path from "path";

// This is a workaround for __dirname not being defined in ES modules.
// Mocha/Node may load this file as ESM in some envs; fallback keeps fixture paths stable.
const currentDirectory =
    typeof __dirname !== "undefined" ? __dirname : path.resolve(process.cwd(), "tests/js");

const baseUiSchemas = JSON.parse(
    readFileSync(path.join(currentDirectory, "fixtures", "schemas.json"), "utf8"),
);
const methodTree = JSON.parse(
    readFileSync(path.join(currentDirectory, "fixtures", "methodTree.json"), "utf8"),
);
const modelTree = JSON.parse(
    readFileSync(path.join(currentDirectory, "fixtures", "modelTree.json"), "utf8"),
);

function validateTree(tree: any): void {
    expect(tree.path).to.be.a("string");
    expect(tree.data === null || typeof tree.data?.key === "string").to.be.true;

    if (tree.data) {
        expect(tree.data.value).to.be.a("string");
        expect(tree.data.name).to.be.a("string");
    }

    if (tree.children) {
        tree.children.forEach(validateTree);
    }

    if (tree.staticOptions) {
        tree.staticOptions.forEach((opt: any) => {
            expect(opt.key).to.be.a("string");
            expect(opt.values).to.be.an("array");
            if (opt.namesMap) {
                Object.keys(opt.namesMap).forEach((k) => expect(opt.values).to.include(k));
            }
        });
    }
}

describe("UI Trees", () => {
    [
        { name: "modelTree", tree: modelTree, expectedCategories: ["pb"] },
        { name: "methodTree", tree: methodTree, expectedCategories: ["qm", "linalg"] },
    ].forEach(({ name, tree, expectedCategories }) => {
        describe(name, () => {
            it("should have valid structure", () => {
                expect(tree.path).to.equal("/");
                expect(tree.data).to.be.null;
                expect(tree.children).to.be.an("array").and.not.empty;
                validateTree(tree);
            });

            it("should include expected categories", () => {
                const tier1Values = tree.children?.map((c: any) => c.data?.value) || [];
                expect(tier1Values).to.include.members(expectedCategories);
            });
        });
    });

    describe("baseUiSchemas", () => {
        it("should have required sections", () => {
            expect(baseUiSchemas).to.have.all.keys([
                "categories",
                "modelParameters",
                "methodParameters",
            ]);
        });

        it("should have ui:title properties", () => {
            Object.values(baseUiSchemas.categories).forEach((prop: any) => {
                expect(prop).to.have.property("ui:title");
            });
        });
    });
});
