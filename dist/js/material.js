"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialStandata = void 0;
const base_1 = require("./base");
const materials_json_1 = __importDefault(require("./runtime_data/materials.json"));
class MaterialStandata extends base_1.Standata {
}
exports.MaterialStandata = MaterialStandata;
MaterialStandata.runtimeData = materials_json_1.default;
