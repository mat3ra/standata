import { expect } from "chai";
import { readFileSync } from "fs";
import path from "path";

import { MetaPropertyStandata } from "../../src/js";

const siPseudo = JSON.parse(
    readFileSync(
        path.join(__dirname, "fixtures", "si_pbe_dojo-jth_1.1.pseudo.json"),
        "utf8",
    ),
);

describe("MetaPropertyStandata", () => {
    it("returns all pseudopotential seed entries", () => {
        const pseudos = MetaPropertyStandata.getPseudopotentials();
        expect(pseudos.length).to.be.greaterThan(0);
        expect(pseudos[0]).to.include.keys("slug", "data");
        expect(pseudos[0].slug).to.equal("pseudopotential");
    });

    it("finds a pseudopotential by path and matches expected contents", () => {
        const pseudos = MetaPropertyStandata.getPseudopotentials();
        const pseudoPath = siPseudo.data.path as string;

        const match = pseudos.find((pseudo) => pseudo.data.path === pseudoPath);

        expect(match).to.deep.equal(siPseudo);
    });
});
