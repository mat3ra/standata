"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyStandata = void 0;
const base_1 = require("./base");
const properties_json_1 = __importDefault(require("./runtime_data/properties.json"));
class PropertyStandata extends base_1.Standata {
}
exports.PropertyStandata = PropertyStandata;
PropertyStandata.runtimeData = properties_json_1.default;
