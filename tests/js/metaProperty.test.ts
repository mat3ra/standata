import { expect } from "chai";

import { MetaPropertyStandata } from "../../src/js";

describe("MetaPropertyStandata", () => {
    it("returns all pseudopotential seed entries", () => {
        const pseudos = MetaPropertyStandata.getPseudopotentials();
        expect(pseudos.length).to.be.greaterThan(0);
        expect(pseudos[0]).to.include.keys("slug", "data");
        expect(pseudos[0].slug).to.equal("pseudopotential");
    });
});
