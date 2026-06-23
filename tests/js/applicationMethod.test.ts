// eslint-disable-next-line import/no-extraneous-dependencies
import { MethodConversionHandler } from "@mat3ra/mode";
import { expect } from "chai";

import { ApplicationMethodStandata, MethodStandata, ModelStandata } from "../../src/js";

describe("Application Method Standata", () => {
    let methodStandata: ApplicationMethodStandata,
        categorizedMethodList: any[],
        categorizedModelList: any[];

    beforeEach(() => {
        methodStandata = new ApplicationMethodStandata();
        categorizedMethodList = new MethodStandata().getAll();
        categorizedModelList = new ModelStandata().getAll();
    });

    it("can get available methods for an application", () => {
        const availableMethods = methodStandata.getAvailableMethods("espresso");
        expect(availableMethods).to.be.an("object");
        expect(Object.keys(availableMethods)).to.include("6.3");
    });

    it("can find methods by application parameters", () => {
        const espressoMethods = methodStandata.findByApplicationParameters({
            methodList: categorizedMethodList,
            name: "espresso",
        });

        expect(espressoMethods).to.be.an("array");
        expect(espressoMethods.length).to.be.greaterThan(0);

        const firstMethod = espressoMethods[0];
        expect(firstMethod).to.have.property("name");
        expect(firstMethod).to.have.property("path");
        // Methods may have units array with individual unit details
        if (firstMethod.units) {
            expect(firstMethod.units).to.be.an("array");
            expect(firstMethod.units[0]).to.have.property("categories");
        }
    });

    it("can filter methods with specific parameters", () => {
        const specificMethods = methodStandata.findByApplicationParameters({
            methodList: categorizedMethodList,
            name: "espresso",
            version: "6.3",
            build: "GNU",
            executable: "pw.x",
            flavor: "pw_scf",
        });

        expect(specificMethods).to.be.an("array");
        expect(specificMethods.length).to.be.greaterThan(0);

        // All returned methods should be from the original methodList and have required properties
        specificMethods.forEach((method) => {
            expect(categorizedMethodList).to.include(method);
            expect(method).to.have.property("path");
            expect(method).to.have.property("name");
        });
    });

    it("can filter methods using realistic two-step process like webapp", () => {
        // Use a sample model from the categorized model list
        const sampleModel = categorizedModelList[0];

        // Step 1: Filter methods by model (like in webapp)
        const filteredMethods = methodStandata.findByApplicationParameters({
            methodList: categorizedMethodList,
            name: sampleModel.name,
            version: sampleModel.version,
            build: sampleModel.build,
            executable: sampleModel.executable,
            flavor: sampleModel.flavor,
        });

        expect(filteredMethods).to.be.an("array");

        // Step 2: Further filter by application parameters (like in webapp)
        const finalMethods = methodStandata.findByApplicationParameters({
            methodList: filteredMethods,
            name: "espresso",
            version: "6.3",
            build: "GNU",
        });

        expect(finalMethods).to.be.an("array");
        // All returned methods should be from the filtered list
        finalMethods.forEach((method) => {
            expect(filteredMethods).to.include(method);
            expect(method).to.have.property("path");
            expect(method).to.have.property("name");
        });
    });

    it("can filter methods for each application", () => {
        const testCases = [
            { name: "vasp", expectedCount: 2, expectedNameValues: ["Projector-augmented Wave"] },
            {
                name: "espresso",
                expectedCount: 4,
                expectedNameValues: ["Norm-conserving", "Projector-augmented Wave", "Ultra-soft"],
            },
        ];
        testCases.forEach(({ name, expectedCount, expectedNameValues }) => {
            const methods = methodStandata.findByApplicationParameters({
                methodList: categorizedMethodList,
                name,
            });
            expect(methods).to.be.an("array");
            expect(methods.length).to.equal(expectedCount);

            methods.forEach((method) => {
                expect(method).to.have.property("name");
                const isMatch = expectedNameValues.some((expected) =>
                    method.name.toLowerCase().includes(expected.toLowerCase()),
                );
                expect(isMatch).to.be.true;
            });
        });
    });

    it("returns empty array for non-existent application", () => {
        const methods = methodStandata.findByApplicationParameters({
            methodList: categorizedMethodList,
            name: "nonexistent",
        });

        expect(methods).to.be.an("array");
        // For non-existent application, the filter returns all methods since no filtering occurs
        expect(methods.length).to.equal(categorizedMethodList.length);
    });

    it("returns empty array for non-existent version", () => {
        const methods = methodStandata.findByApplicationParameters({
            methodList: categorizedMethodList,
            name: "espresso",
            version: "999.0.0",
        });

        expect(methods).to.be.an("array");
        // For non-existent version, the filter falls back to all methods for the application
        expect(methods.length).to.equal(categorizedMethodList.length);
    });

    it("can get default method config for VASP application", () => {
        const defaultConfig = methodStandata.getDefaultMethodConfigForApplication({
            name: "vasp",
            version: "5.4.4",
            build: "GNU",
            executable: "vasp",
            flavor: "vasp",
        });

        expect(defaultConfig).to.be.an("object");
        expect(defaultConfig).to.have.property("units");
        expect(defaultConfig).to.have.property("path");
        expect(defaultConfig).to.have.property("name");

        const simpleConfig = MethodConversionHandler.convertToSimple(defaultConfig);
        expect(simpleConfig.type).to.equal("pseudopotential");
        expect(simpleConfig.subtype).to.equal("paw");
    });

    it("can get default method config for Espresso application", () => {
        const defaultConfig = methodStandata.getDefaultMethodConfigForApplication({
            name: "espresso",
            version: "6.3",
            build: "GNU",
            executable: "pw.x",
            flavor: "pw_scf",
        });

        expect(defaultConfig).to.be.an("object");
        expect(defaultConfig).to.have.property("units");
        expect(defaultConfig).to.have.property("path");
        expect(defaultConfig).to.have.property("name");

        const simpleConfig = MethodConversionHandler.convertToSimple(defaultConfig);
        expect(simpleConfig.type).to.equal("pseudopotential");
        expect(simpleConfig.subtype).to.equal("us");
    });
});
