import { expect } from "chai";

import ApplicationRegistry from "../../src/js/ApplicationRegistry";
import StandataDriver from "../../src/js/StandataDriver";

describe("jupyterLab versions", () => {
    const standata = new ApplicationRegistry(new StandataDriver());
    const pythonBuilds = ["3.10.13", "3.11.10", "3.12.7"];

    it("resolves every version to its default build", () => {
        ["4.6.0", "4.3.0"].forEach((version) => {
            const application = standata.findApplication({ name: "jupyterLab", version });

            expect(application.version).to.equal(version);
            expect(application.build).to.equal("Default");
        });
    });

    it("gives every version line its own default flavor and requirements", () => {
        const cases = [
            {
                version: "4.6.0",
                flavorName: "notebook_v4.6.0",
                template: "requirements_v4.6.0.txt",
            },
            {
                version: "4.3.0",
                flavorName: "notebook_v4.3.0",
                template: "requirements_v4.3.0.txt",
            },
        ] as const;

        cases.forEach(({ version, flavorName, template }) => {
            const application = { name: "jupyterLab" as const, version };
            const flavor = standata.getDefaultFlavor(application, { name: "jupyter" });

            expect(flavor?.name).to.equal(flavorName);
            expect(flavor?.input[0].templateName ?? flavor?.input[0].name).to.equal(template);
        });
    });

    it("offers Default and the Python builds on every version", () => {
        ["4.6.0", "4.3.0"].forEach((version) => {
            const builds = standata
                .getApplications()
                .filter((application) => application.name === "jupyterLab")
                .filter((application) => application.version === version)
                .map((application) => application.build);

            expect(builds).to.deep.equal(["Default", ...pythonBuilds]);
        });
    });

    it("gives every Python build its version's default flavor and requirements", () => {
        ["4.6.0", "4.3.0"].forEach((version) => {
            pythonBuilds.forEach((build) => {
                const application = standata.findApplication({
                    name: "jupyterLab",
                    version,
                    build,
                });
                const flavor = standata.getDefaultFlavor(application, { name: "jupyter" });

                expect(application.build).to.equal(build);
                expect(flavor?.name).to.equal(`notebook_v${version}`);
                expect(flavor?.input[0].templateName).to.equal(`requirements_v${version}.txt`);
            });
        });
    });
});
