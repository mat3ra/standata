import ApplicationRegistry from "./ApplicationRegistry";
import methodTree from "./ui/methodTree.json";
import modelTree from "./ui/modelTree.json";
import baseUiSchema from "./ui/schemas.json";

export { Standata } from "./base";
export { MaterialStandata } from "./material";
// MetaPropertyStandata is intentionally NOT re-exported: it statically imports large server-only
// seed data. Import it from "@mat3ra/standata/dist/js/metaProperty" (server code only).
export type { MetaPropertyMethodName, MetaPropertySeedEntry } from "./metaProperty";
export { PropertyStandata } from "./property";
export {
    WorkflowStandata,
    SubworkflowStandata,
    workflowSubworkflowMapByApplication,
} from "./workflow";
export { ApplicationModelStandata } from "./applicationModel";
export { ApplicationMethodStandata } from "./applicationMethod";
export { ModelStandata } from "./model";
export { MethodStandata } from "./method";
export { ModelMethodFilter, filterMethodsByModel } from "./modelMethodFilter";
export { applicationVersionSatisfiesSupportedRange } from "./utils/applicationVersion";
export { setupNunjucksEnvironment } from "./utils/template";
export { setUnitLinks } from "./utils/unit";

export { modelTree, methodTree, baseUiSchema, ApplicationRegistry };
