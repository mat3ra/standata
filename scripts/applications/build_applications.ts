import { ApplicationsProcessor } from "../processors/ApplicationsProcessor";
import { buildApplicationVersionsMapByApplicationPythonModule } from "./build_application_versions_map_by_application";

new ApplicationsProcessor(__dirname).process();
buildApplicationVersionsMapByApplicationPythonModule();
