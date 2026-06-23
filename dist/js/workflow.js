"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowSubworkflowMapByApplication = exports.SubworkflowStandata = exports.WorkflowStandata = exports.TAGS = void 0;
const base_1 = require("./base");
const subworkflows_json_1 = __importDefault(require("./runtime_data/subworkflows.json"));
const workflows_json_1 = __importDefault(require("./runtime_data/workflows.json"));
const workflowSubworkflowMapByApplication_json_1 = __importDefault(require("./runtime_data/workflows/workflowSubworkflowMapByApplication.json"));
exports.workflowSubworkflowMapByApplication = workflowSubworkflowMapByApplication_json_1.default;
var TAGS;
(function (TAGS) {
    TAGS["RELAXATION"] = "variable-cell_relaxation";
    TAGS["DEFAULT"] = "default";
})(TAGS || (exports.TAGS = TAGS = {}));
class BaseWorkflowStandata extends base_1.Standata {
    findByApplication(appName) {
        return this.findEntitiesByTags(appName);
    }
    findByApplicationAndName(appName, displayName) {
        return this.findByApplication(appName).find((e) => (e === null || e === void 0 ? void 0 : e.name) === displayName);
    }
    // NOTE: The WF/SWF returned will have only `name` inside the application object.
    getRelaxationByApplication(appName) {
        const list = this.findEntitiesByTags(TAGS.RELAXATION, appName);
        return list[0];
    }
    getDefault() {
        const list = this.findEntitiesByTags(TAGS.DEFAULT);
        if (list.length > 1)
            console.error("Multiple default workflows found");
        if (list.length === 0)
            console.error("No default workflow found");
        return list[0];
    }
}
class WorkflowStandata extends BaseWorkflowStandata {
    getRelaxationWorkflowByApplication(appName) {
        return this.getRelaxationByApplication(appName);
    }
}
exports.WorkflowStandata = WorkflowStandata;
WorkflowStandata.runtimeData = workflows_json_1.default;
class SubworkflowStandata extends BaseWorkflowStandata {
    getRelaxationSubworkflowByApplication(appName) {
        return this.getRelaxationByApplication(appName);
    }
}
exports.SubworkflowStandata = SubworkflowStandata;
SubworkflowStandata.runtimeData = subworkflows_json_1.default;
