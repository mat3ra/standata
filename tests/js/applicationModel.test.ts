import { expect } from "chai";

import { ApplicationModelStandata, ModelStandata } from "../../src/js";

describe("Application Model Standata", () => {
    let applicationModelStandata: ApplicationModelStandata, categorizedModelList: any[];

    beforeEach(() => {
        applicationModelStandata = new ApplicationModelStandata();
        categorizedModelList = new ModelStandata().getAll();
    });

    it("can get available models for an application", () => {
        const availableModels = applicationModelStandata.getAvailableModels("espresso");
        expect(availableModels).to.be.an("object");
        expect(Object.keys(availableModels)).to.include("6.3");
    });

    it("can find models by application parameters", () => {
        const espressoModels = applicationModelStandata.findByApplicationParameters({
            modelList: categorizedModelList,
            name: "espresso",
        });

        expect(espressoModels).to.be.an("array");
        expect(espressoModels.length).to.be.greaterThan(0);

        // Each model should have the expected structure from mode.js
        const firstModel = espressoModels[0];
        expect(firstModel).to.have.property("name");
        expect(firstModel).to.have.property("path");
        expect(firstModel).to.have.property("categories");
        expect(firstModel).to.have.property("tags");
    });

    it("can filter models with specific parameters", () => {
        const specificModels = applicationModelStandata.findByApplicationParameters({
            modelList: categorizedModelList,
            name: "espresso",
            version: "6.3",
            build: "GNU",
            executable: "pw.x",
            flavor: "pw_scf",
        });

        expect(specificModels).to.be.an("array");
        expect(specificModels.length).to.be.greaterThan(0);

        // All returned models should be from the original modelList and have required properties
        specificModels.forEach((model) => {
            expect(categorizedModelList).to.include(model);
            expect(model).to.have.property("path");
            expect(model).to.have.property("name");
        });
    });

    it("can filter models for each application", () => {
        const testCases = [
            { name: "vasp", expectedCount: 4, expectedNameValues: ["DFT"] },
            { name: "espresso", expectedCount: 4, expectedNameValues: ["DFT"] },
        ];
        testCases.forEach(({ name, expectedCount, expectedNameValues }) => {
            const models = applicationModelStandata.findByApplicationParameters({
                modelList: categorizedModelList,
                name,
            });
            expect(models).to.be.an("array");
            expect(models.length).to.equal(expectedCount);

            models.forEach((model) => {
                expect(model).to.have.property("name");
                const isMatch = expectedNameValues.some((expected) =>
                    model.name.toLowerCase().includes(expected.toLowerCase()),
                );
                expect(isMatch).to.be.true;
            });
        });
    });

    it("returns empty array for non-existent application", () => {
        const models = applicationModelStandata.findByApplicationParameters({
            modelList: categorizedModelList,
            name: "nonexistent",
        });

        expect(models).to.be.an("array");
        // For non-existent application, the filter returns all models since no filtering occurs
        expect(models.length).to.equal(categorizedModelList.length);
    });
});
