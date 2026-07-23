"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaPropertyStandata = void 0;
const pseudos_json_1 = __importDefault(require("./runtime_data/metaProperties/pseudos.json"));
const META_PROPERTIES_BY_METHOD_NAME = {
    pseudopotential: pseudos_json_1.default,
};
class MetaPropertyStandata {
    static getAllByMethodName(methodName) {
        const entries = META_PROPERTIES_BY_METHOD_NAME[methodName];
        if (!entries) {
            throw new Error(`Unknown meta-property method name: ${methodName}`);
        }
        return entries;
    }
}
exports.MetaPropertyStandata = MetaPropertyStandata;
