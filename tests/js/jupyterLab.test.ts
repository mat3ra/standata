import { expect } from "chai";

import ApplicationRegistry from "../../src/js/ApplicationRegistry";
import StandataDriver from "../../src/js/StandataDriver";

describe("jupyterLab versions", () => {
    const standata = new ApplicationRegistry(new StandataDriver());

    it("resolves every version to its default build", () => {
        ["4.6.0", "4.3.0", "3.0.3"].forEach((version) => {
            const application = standata.findApplication({ name: "jupyterLab", version });

            expect(application.version).to.equal(version);
            expect(application.build).to.equal("Default");
        });
    });

    it("gives every version line its own default flavor and requirements", () => {
        const cases = [
            { version: "4.6.0", flavorName: "notebook", template: "requirements.txt" },
            { version: "4.3.0", flavorName: "notebook_430", template: "requirements_430.txt" },
            { version: "3.0.3", flavorName: "notebook_303", template: "requirements_303.txt" },
        ] as const;

        cases.forEach(({ version, flavorName, template }) => {
            const application = { name: "jupyterLab" as const, version };
            const flavor = standata.getDefaultFlavor(application, { name: "jupyter" });

            expect(flavor?.name).to.equal(flavorName);
            expect(flavor?.input[0].templateName ?? flavor?.input[0].name).to.equal(template);
        });
    });
});
