"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaPropertyStandata = void 0;
const pseudos_json_1 = __importDefault(require("./runtime_data/metaProperties/pseudos.json"));
class MetaPropertyStandata {
    static getPseudopotentials() {
        return pseudos_json_1.default;
    }
}
exports.MetaPropertyStandata = MetaPropertyStandata;
