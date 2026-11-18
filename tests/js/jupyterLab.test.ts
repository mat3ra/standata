import { expect } from "chai";

import ApplicationRegistry from "../../src/js/ApplicationRegistry";
import StandataDriver from "../../src/js/StandataDriver";

describe("jupyterLab versions", () => {
    const standata = new ApplicationRegistry(new StandataDriver());

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

    it("offers the Python builds on 4.6.0 only", () => {
        const buildsByVersion = {
            "4.6.0": ["Default", "Python - 3.10.13", "Python - 3.11.10", "Python - 3.12.7"],
            "4.3.0": ["Default"],
        };

        Object.entries(buildsByVersion).forEach(([version, expectedBuilds]) => {
            const builds = standata
                .getApplications()
                .filter((application) => application.name === "jupyterLab")
                .filter((application) => application.version === version)
                .map((application) => application.build);

            expect(builds).to.deep.equal(expectedBuilds);
        });
    });
});
