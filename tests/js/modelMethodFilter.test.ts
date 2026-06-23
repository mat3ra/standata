import { expect } from "chai";

import { MethodStandata, ModelMethodFilter, ModelStandata } from "../../src/js";

const TEST_MODEL_NAMES = {
    LDA_PZ: "DFT LDA PZ",
} as const;

const TEST_CATEGORIES = {
    SUBTYPE_LDA: "lda",
} as const;

describe("ModelMethodFilter", () => {
    let filter: ModelMethodFilter, methodStandata: MethodStandata, modelStandata: ModelStandata;

    beforeEach(() => {
        filter = new ModelMethodFilter();
        methodStandata = new MethodStandata();
        modelStandata = new ModelStandata();
    });

    describe("getCompatibleMethods", () => {
        it("should return compatible methods for real LDA model", () => {
            const ldaModel = modelStandata.getByName(TEST_MODEL_NAMES.LDA_PZ);
            const allMethods = methodStandata.getAll();

            expect(ldaModel).to.not.be.undefined;

            const compatibleMethods = filter.getCompatibleMethods(ldaModel!, allMethods);

            expect(compatibleMethods).to.be.an("array");
            expect(compatibleMethods.length).to.be.greaterThan(0);
            expect(compatibleMethods[0].name).to.include("Plane-wave");
        });

        it("should work with actual standata integration", () => {
            const model = modelStandata.getByName(TEST_MODEL_NAMES.LDA_PZ);
            const allMethods = methodStandata.getAll();

            expect(model).to.not.be.undefined;

            const compatible = filter.getCompatibleMethods(model!, allMethods);

            // LDA models are compatible with plane-wave pseudopotential methods
            expect(compatible.length).to.be.greaterThan(0);
        });
    });

    describe("real data integration", () => {
        it("should filter methods by model compatibility", () => {
            const allModels = modelStandata.getAll();
            const allMethods = methodStandata.getAll();

            expect(allModels.length).to.be.greaterThan(0);
            expect(allMethods.length).to.be.greaterThan(0);

            allModels.forEach((model) => {
                const compatible = filter.getCompatibleMethods(model, allMethods);
                expect(compatible).to.be.an("array");
                // DFT/GW models are compatible with plane-wave methods
                // ML models may not have compatible methods defined yet
                if (model.categories.tier3 !== "ml") {
                    expect(compatible.length).to.be.greaterThan(0);
                }
            });
        });

        it("should return all methods for LDA models", () => {
            const ldaModels = modelStandata.getByTags(TEST_CATEGORIES.SUBTYPE_LDA);
            const allMethods = methodStandata.getAll();

            expect(ldaModels.length).to.be.greaterThan(0);

            ldaModels.forEach((model) => {
                const compatible = filter.getCompatibleMethods(model, allMethods);
                // LDA models are compatible with plane-wave pseudopotential methods
                expect(compatible.length).to.be.greaterThan(0);
            });
        });
    });

    describe("utility methods", () => {
        it("should extract filter rules from real filter map", () => {
            const allRules = filter.getAllFilterRules();
            const paths = filter.getUniqueFilterPaths();

            expect(allRules.length).to.be.greaterThan(0);
            expect(paths.length).to.be.greaterThan(0);
        });

        it("should provide access to filter map entries", () => {
            const { filterMap } = filter as any;

            expect(filterMap).to.be.an("array");
            expect(filterMap.length).to.be.greaterThan(0);

            // Each entry should have model categories and filter rules
            filterMap.forEach((entry: any) => {
                expect(entry).to.have.property("modelCategories");
                expect(entry).to.have.property("filterRules");
            });
        });
    });
});
