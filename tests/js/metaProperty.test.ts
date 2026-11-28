import { expect } from "chai";
import { readFileSync } from "fs";
import path from "path";

import {
    type PseudopotentialFilter,
    MetaPropertyStandata,
    PseudopotentialStandata,
} from "../../src/js/metaProperty";

const siPseudo = JSON.parse(
    readFileSync(path.join(__dirname, "fixtures", "si_pbe_dojo-jth_1.1.pseudo.json"), "utf8"),
);

const SI_COLLECTION = "dojo-jth_paw_pbe_1.1";

const EXPECTED_COLLECTION_NAMES = [
    "dojo-jth_paw_pbe_1.1",
    "dojo-oncv_nc-fr_pbe_0.4",
    "dojo-oncv_nc_pbe_0.4",
    "gbrv_us_pbe",
    "gbrv_us_pbesol",
    "gbrv_us_pz",
    "vasp_paw_pbe_5.2",
    "vasp_paw_pbe_5.4",
    "vasp_paw_pz_5.2",
    "vasp_paw_pz_5.4",
];

describe("PseudopotentialStandata", () => {
    it("lists one collection per source archive", () => {
        expect(PseudopotentialStandata.getCollectionNames()).to.deep.equal(
            EXPECTED_COLLECTION_NAMES,
        );
    });

    it("returns every entry of every collection from getAll", () => {
        const collectionSizes = PseudopotentialStandata.getCollectionNames().map(
            (name) => PseudopotentialStandata.getByCollection(name).length,
        );
        const all = PseudopotentialStandata.getAll();
        expect(all.length).to.equal(collectionSizes.reduce((sum, size) => sum + size, 0));
        expect(all.every((entry) => entry.slug === "pseudopotential")).to.equal(true);
        expect(new Set(all.map((entry) => entry.data.path)).size).to.equal(all.length);
    });

    it("keeps each entry consistent with its collection name", () => {
        PseudopotentialStandata.getCollectionNames().forEach((name) => {
            const [source, type, functional, version] = name.split("_");
            const entries = PseudopotentialStandata.getByCollection(name);
            expect(entries.length, name).to.be.greaterThan(0);
            const matching = PseudopotentialStandata.filter({
                source,
                type: type as PseudopotentialFilter["type"],
                functional,
                version,
            });
            expect(
                entries.every((entry) => matching.includes(entry)),
                name,
            ).to.equal(true);
        });
    });

    it("throws for an unknown collection", () => {
        expect(() => PseudopotentialStandata.getByCollection("unknown")).to.throw(
            "Unknown pseudopotential collection: unknown",
        );
    });

    it("throws for an unknown filter field", () => {
        const filter = { color: "red" } as PseudopotentialFilter;
        expect(() => PseudopotentialStandata.filter(filter)).to.throw(
            "Unknown pseudopotential filter field: color",
        );
    });

    it("returns everything for an empty filter", () => {
        expect(PseudopotentialStandata.filter()).to.deep.equal(PseudopotentialStandata.getAll());
    });

    it("filters by element and application", () => {
        const matches = PseudopotentialStandata.filter({ element: "Si", application: "q3" });
        expect(matches.length).to.be.greaterThan(0);
        expect(
            matches.every(({ data }) => data.element === "Si" && data.apps.includes("q3")),
        ).to.equal(true);
        expect(matches).to.deep.include(siPseudo);
    });

    it("narrows a collection with further criteria", () => {
        const matches = PseudopotentialStandata.filter({
            collection: SI_COLLECTION,
            element: "Si",
        });
        expect(matches).to.deep.equal([siPseudo]);
    });

    it("filters by exchange-correlation, type and version", () => {
        const matches = PseudopotentialStandata.filter({
            approximation: "lda",
            functional: "pz",
            type: "paw",
            version: "5.4",
        });
        expect(matches).to.deep.equal(PseudopotentialStandata.getByCollection("vasp_paw_pz_5.4"));
    });
});

describe("MetaPropertyStandata", () => {
    it("returns all pseudopotentials for the pseudopotential method name", () => {
        expect(MetaPropertyStandata.getAllByMethodName("pseudopotential")).to.deep.equal(
            PseudopotentialStandata.getAll(),
        );
    });

    it("finds a pseudopotential by path and matches expected contents", () => {
        const pseudos = MetaPropertyStandata.getAllByMethodName("pseudopotential");
        const match = pseudos.find((pseudo) => pseudo.data.path === siPseudo.data.path);
        expect(match).to.deep.equal(siPseudo);
    });
});
