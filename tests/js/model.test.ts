import { expect } from "chai";

import { ModelStandata } from "../../src/js";

// Test data constants
const TEST_MODEL_TAGS = {
    DFT: "dft",
    LDA: "lda",
} as const;

const TEST_MODEL_CATEGORIES = {
    TIER1_PB: "pb",
    TIER2_QM: "qm",
    TIER3_DFT: "dft",
    TYPE_KSDFT: "ksdft",
    SUBTYPE_LDA: "lda",
} as const;

const TEST_MODEL_NAME_FRAGMENTS = {
    DFT: "DFT",
    LDA: "LDA",
} as const;

const TEST_COUNTS = {
    TOTAL_DFT_MODELS: 39,
    TOTAL_LDA_MODELS: 9,
} as const;

describe("ModelStandata", () => {
    let standata: ModelStandata;

    beforeEach(() => {
        standata = new ModelStandata();
    });

    describe("getByTags", () => {
        it("should find models by category tags", () => {
            const dftModels = standata.getByTags(TEST_MODEL_TAGS.DFT);
            const ldaModels = standata.getByTags(TEST_MODEL_TAGS.LDA);

            expect(dftModels).to.have.length(TEST_COUNTS.TOTAL_DFT_MODELS);
            expect(dftModels[0].name).to.include(TEST_MODEL_NAME_FRAGMENTS.DFT);
            expect(ldaModels).to.have.length(TEST_COUNTS.TOTAL_LDA_MODELS);
            expect(ldaModels[0].name).to.include(TEST_MODEL_NAME_FRAGMENTS.LDA);
        });

        it("should find models by multiple tags", () => {
            const models = standata.getByTags(TEST_MODEL_TAGS.DFT, TEST_MODEL_TAGS.LDA);

            expect(models).to.have.length(TEST_COUNTS.TOTAL_DFT_MODELS);
        });
    });

    describe("hierarchical categories", () => {
        it("should have proper category structure", () => {
            const allModels = standata.getAll();

            expect(
                allModels.every(
                    (m) =>
                        m.categories.tier1 &&
                        m.categories.tier2 &&
                        m.categories.tier3 &&
                        m.categories.type,
                ),
            ).to.be.true;
        });
    });

    describe("integration", () => {
        it("should work with filtering systems", () => {
            const ldaModel = standata.getByTags(TEST_MODEL_TAGS.LDA)[0];

            expect(ldaModel.categories.tier1).to.equal(TEST_MODEL_CATEGORIES.TIER1_PB);
            expect(ldaModel.categories.tier2).to.equal(TEST_MODEL_CATEGORIES.TIER2_QM);
            expect(ldaModel.categories.tier3).to.equal(TEST_MODEL_CATEGORIES.TIER3_DFT);
            expect(ldaModel.categories.type).to.equal(TEST_MODEL_CATEGORIES.TYPE_KSDFT);
            expect(ldaModel.categories.subtype).to.equal(TEST_MODEL_CATEGORIES.SUBTYPE_LDA);
        });
    });
});
