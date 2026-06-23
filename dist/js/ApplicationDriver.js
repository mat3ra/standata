"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationDriver = void 0;
const applicationsList_json_1 = __importDefault(require("./runtime_data/applications/applicationsList.json"));
const executablesList_json_1 = __importDefault(require("./runtime_data/applications/executablesList.json"));
const flavorsList_json_1 = __importDefault(require("./runtime_data/applications/flavorsList.json"));
const templatesList_json_1 = __importDefault(require("./runtime_data/applications/templatesList.json"));
class ApplicationDriver {
    constructor() {
        this.applications = applicationsList_json_1.default;
        this.templates = templatesList_json_1.default;
        this.flavors = flavorsList_json_1.default;
        this.executables = executablesList_json_1.default;
    }
    getApplications() {
        return this.applications;
    }
    getTemplates() {
        return this.templates;
    }
    getFlavors() {
        return this.flavors;
    }
    getExecutables() {
        return this.executables;
    }
}
exports.ApplicationDriver = ApplicationDriver;
