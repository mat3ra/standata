"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationMethodStandata = void 0;
const method_1 = require("./method");
const modelMethodMapByApplication_json_1 = __importDefault(require("./runtime_data/applications/modelMethodMapByApplication.json"));
const applicationFilter_1 = require("./utils/applicationFilter");
class ApplicationMethodStandata extends applicationFilter_1.ApplicationFilterStandata {
    constructor() {
        const data = modelMethodMapByApplication_json_1.default;
        super(data === null || data === void 0 ? void 0 : data.methods, applicationFilter_1.FilterMode.ALL_MATCH);
    }
    findByApplicationParameters({ methodList, name, version, build, executable, flavor, }) {
        return this.filterByApplicationParameters(methodList, name, version, build, executable, flavor);
    }
    getAvailableMethods(name) {
        return this.getAvailableEntities(name);
    }
    getDefaultMethodConfigForApplication(application) {
        const { name, version, build /* executable, flavor */ } = application;
        const availableMethods = this.getAvailableMethods(name);
        if (!availableMethods || Object.keys(availableMethods).length === 0) {
            return { type: "unknown", subtype: "unknown" };
        }
        const methodStandata = new method_1.MethodStandata();
        const allMethods = methodStandata.getAll();
        return this.filterByApplicationParametersGetDefault(allMethods, name, version, build);
    }
}
exports.ApplicationMethodStandata = ApplicationMethodStandata;
