"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationModelStandata = void 0;
const modelMethodMapByApplication_json_1 = __importDefault(require("./runtime_data/applications/modelMethodMapByApplication.json"));
const applicationFilter_1 = require("./utils/applicationFilter");
class ApplicationModelStandata extends applicationFilter_1.ApplicationFilterStandata {
    constructor() {
        const data = modelMethodMapByApplication_json_1.default;
        super(data === null || data === void 0 ? void 0 : data.models, applicationFilter_1.FilterMode.ANY_MATCH);
    }
    findByApplicationParameters({ modelList, name, version, build, executable, flavor, }) {
        return this.filterByApplicationParameters(modelList, name, version, build, executable, flavor);
    }
    getAvailableModels(name) {
        return this.getAvailableEntities(name);
    }
}
exports.ApplicationModelStandata = ApplicationModelStandata;
