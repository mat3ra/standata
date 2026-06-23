import type { FlavorSchema, TemplateSchema } from "@mat3ra/esse/dist/js/types";
import { expect } from "chai";

import ApplicationRegistry, { type ApplicationDriver } from "../../src/js/ApplicationRegistry";
import StandataDriver from "../../src/js/StandataDriver";

describe("ApplicationRegistry", () => {
    describe("with runtime ApplicationDriver", () => {
        const driver = new StandataDriver();
        let standata: ApplicationRegistry;

        beforeEach(() => {
            standata = new ApplicationRegistry(driver);
        });

        it("getDefaultApplication returns the first application flagged isDefault in driver order", () => {
            const apps = driver.getApplications();
            const expected = apps.find((a) => a.isDefault);
            expect(standata.getDefaultApplication()).to.deep.equal(expected);
            expect(expected).to.not.equal(undefined);
        });

        it("getExecutablesByApplication filters by application name and satisfies applicationVersion range", () => {
            const espresso63 = { name: "espresso" as const, version: "6.3" };
            const executables = standata.getExecutablesByApplication(espresso63);
            expect(executables.some((e) => e.name === "pw.x")).to.equal(true);
            const hp = executables.find((e) => e.name === "hp.x");
            expect(hp, "hp.x requires >=7.0 and should not match espresso 6.3").to.equal(undefined);
        });

        it("getExecutablesByApplication includes version-constrained executables when application version matches", () => {
            const espresso75 = { name: "espresso" as const, version: "7.5" };
            const executables = standata.getExecutablesByApplication(espresso75);
            expect(executables.some((e) => e.name === "hp.x")).to.equal(true);
        });

        it("getFlavorsByApplicationExecutable filters by app, version range, and executable name", () => {
            const espresso63 = { name: "espresso" as const, version: "6.3" };
            const flavors63 = standata.getFlavorsByApplicationExecutable(espresso63, {
                name: "pw.x",
            });
            expect(flavors63.some((f) => f.name === "pw_scf")).to.equal(true);
            expect(flavors63.some((f) => f.name === "pw_scf_dft_u")).to.equal(false);

            const espresso75 = { name: "espresso" as const, version: "7.5" };
            const flavors75 = standata.getFlavorsByApplicationExecutable(espresso75, {
                name: "pw.x",
            });
            expect(flavors75.some((f) => f.name === "pw_scf_dft_u")).to.equal(true);
        });

        it("getDefaultFlavor returns defaults for selectable Espresso executables", () => {
            const espresso63 = { name: "espresso" as const, version: "6.3" };
            const cases = [
                { executableName: "pp.x", flavorName: "pp_electrostatic_potential" },
                { executableName: "average.x", flavorName: "average" },
            ] as const;

            cases.forEach(({ executableName, flavorName }) => {
                const flavor = standata.getDefaultFlavor(espresso63, {
                    name: executableName,
                });

                expect(flavor?.name).to.equal(flavorName);
            });
        });

        it("getDefaultFlavor falls back to the first matching flavor when none is default", () => {
            const firstFlavor: FlavorSchema = {
                applicationName: "test-app",
                applicationVersion: "*",
                executableName: "test-exe",
                input: [],
                isDefault: false,
                monitors: [],
                name: "first-flavor",
                postProcessors: [],
                preProcessors: [],
                results: [],
            };
            const secondFlavor: FlavorSchema = {
                ...firstFlavor,
                name: "second-flavor",
            };

            const mockDriver: ApplicationDriver = {
                getApplications: () => [],
                getTemplates: () => [],
                getFlavors: () => [firstFlavor, secondFlavor],
                getExecutables: () => [],
            };

            const registry = new ApplicationRegistry(mockDriver);
            const flavor = registry.getDefaultFlavor(
                { name: "test-app", version: "1.0.0" },
                { name: "test-exe" },
            );

            expect(flavor?.name).to.equal("first-flavor");
        });

        it("getTemplates returns the driver template list", () => {
            expect(standata.getTemplates()).to.equal(driver.getTemplates());
        });
    });

    describe("driver wiring", () => {
        let previousDriver: ApplicationDriver;

        beforeEach(() => {
            previousDriver = ApplicationRegistry.driver;
        });

        afterEach(() => {
            ApplicationRegistry.driver = previousDriver;
        });

        it("constructor uses ApplicationRegistry.driver when no instance driver is passed", () => {
            const mockDriver: ApplicationDriver = {
                getApplications: () => [{ name: "a", version: "1", isDefault: true } as never],
                getTemplates: () => [],
                getFlavors: () => [],
                getExecutables: () => [],
            };
            ApplicationRegistry.setDriver(mockDriver);
            const standata = new ApplicationRegistry();
            expect(standata.getDefaultApplication()?.name).to.equal("a");
        });

        it("constructor prefers an explicitly passed driver over ApplicationRegistry.driver", () => {
            const unused: ApplicationDriver = {
                getApplications: () => [],
                getTemplates: () => [],
                getFlavors: () => [],
                getExecutables: () => [],
            };
            ApplicationRegistry.setDriver(unused);

            const injected: ApplicationDriver = {
                getApplications: () => [
                    { name: "injected", version: "1", isDefault: true } as never,
                ],
                getTemplates: () => [],
                getFlavors: () => [],
                getExecutables: () => [],
            };
            const standata = new ApplicationRegistry(injected);
            expect(standata.getDefaultApplication()?.name).to.equal("injected");
        });
    });

    describe("getInput", () => {
        it("resolves flavor input entries via templateName and overlays input name", () => {
            const application = { name: "test-app", version: "1.0.0" };

            const baseTemplate = {
                applicationName: "test-app",
                applicationVersion: "*",
                executableName: "test-exe",
                name: "base.tpl",
                content: "{}",
            } as TemplateSchema;

            const flavor = {
                applicationName: "test-app",
                executableName: "test-exe",
                input: [{ name: "rendered.in", templateName: "base.tpl" }],
            } as FlavorSchema;

            const mockDriver: ApplicationDriver = {
                getApplications: () => [],
                getTemplates: () => [baseTemplate],
                getFlavors: () => [],
                getExecutables: () => [],
            };

            const standata = new ApplicationRegistry(mockDriver);
            const resolved = standata.getInput(application, flavor);

            expect(resolved).to.have.length(1);
            expect(resolved[0].name).to.equal("rendered.in");
            expect(resolved[0].applicationName).to.equal("test-app");
            expect(resolved[0].executableName).to.equal("test-exe");
            expect(resolved[0].content).to.equal("{}");
        });
    });
});
