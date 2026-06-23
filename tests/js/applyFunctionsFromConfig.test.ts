import { expect } from "chai";

import { applyFunctionsFromConfig } from "../../scripts/processors/utils/utils";

describe("applyFunctionsFromConfig", () => {
    it("leaves entity unchanged when functions config is absent", () => {
        const entity = { name: "test-workflow" };

        expect(applyFunctionsFromConfig(entity)).to.deep.equal(entity);
    });

    it("applies setDefaultCompute when requested", () => {
        const entity = { name: "phonon_map_workflow" };

        const result = applyFunctionsFromConfig(entity, { setDefaultCompute: null });

        expect(result).to.have.property("compute");
        expect(result.compute).to.include({
            ppn: 1,
            nodes: 1,
            queue: "D",
            timeLimit: "01:00:00",
            notify: "n",
        });
        expect(result.compute?.cluster).to.deep.equal({ fqdn: "" });
    });
});
