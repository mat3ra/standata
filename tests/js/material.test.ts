import { expect } from "chai";
import * as fs from "fs";
import * as yaml from "js-yaml";
import { readFileSync } from "fs";
import path from "path";
import { MaterialStandata } from "../../src/js";

// Read materials instead of importing due to usage of URL encoding in filenames which is needed for Pyodide and web compatibility
const h_BN = JSON.parse(readFileSync(path.join(__dirname, "fixtures", "BN-[Hexagonal_Boron_Nitride]-HEX_[P6%2Fmmm]_2D_[Monolayer]-[2dm-4991].json"), "utf8"));
const Graphene = JSON.parse(readFileSync(path.join(__dirname, "fixtures", "C-[Graphene]-HEX_[P6%2Fmmm]_2D_[Monolayer]-[2dm-3993].json"), "utf8"));
const WS2 = JSON.parse(readFileSync(path.join(__dirname, "fixtures", "WS2-[Tungsten_Disulfide]-HEX_[P-6m2]_2D_[Monolayer]-[2dm-3749].json"), "utf8"));
const Na4Cl4 = JSON.parse(readFileSync(path.join(__dirname, "fixtures", "NaCl-[Sodium_Chloride]-FCC_[Fm-3m]_3D_[Bulk]-[mp-22862].json"), "utf8"));
const Si = JSON.parse(readFileSync(path.join(__dirname, "fixtures", "Si-[Silicon]-FCC_[Fd-3m]_3D_[Bulk]-[mp-149].json"), "utf8"));
function countEntitiesInYAML(filePath: string, entityKey: string): number {
    try {
        const fileContents = fs.readFileSync(filePath, "utf8");
        const data = yaml.load(fileContents) as { [key: string]: any[] };
        return data[entityKey]?.length || 0;
    } catch (e) {
        console.error(e);
        return 0;
    }
}

const materialsCategoriesFilePath = "assets/materials/categories.yml";
const TOTAL_NUMBER_OF_MATERIALS = countEntitiesInYAML(materialsCategoriesFilePath, "entities");
console.log(`Total number of materials: ${TOTAL_NUMBER_OF_MATERIALS}`);

describe("Materials Standata", () => {
    it("can return the list of all materials", () => {
        const materialConfigs = MaterialStandata.getRuntimeDataConfigs();
        console.log(`    Number of materials found: ${materialConfigs.length}`);
        expect(materialConfigs.length).to.be.equal(TOTAL_NUMBER_OF_MATERIALS);
    });

    it("can search materials by tags", () => {
        const std = new MaterialStandata();
        const tags = ["3D", "bulk", "semiconductor"];
        const entities = std.findEntitiesByTags(...tags);
        expect(entities).to.deep.include.members([Si]);
        expect(entities.length).to.be.lessThan(std.entities.length);
    });

    it("should return all entities with the same tag", () => {
        const std = new MaterialStandata();
        const tags = ["2D"];
        const entities = std.findEntitiesByTags(...tags);
        expect(entities).to.deep.include.members([Graphene, h_BN, WS2]);
        expect(entities).to.not.deep.include.members([Si, Na4Cl4]);
        expect(entities.length).to.be.lessThan(std.entities.length);
    });
});
