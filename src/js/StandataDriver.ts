import type {
    ApplicationSchema,
    ExecutableSchema,
    FlavorSchema,
    TemplateSchema,
} from "@mat3ra/esse/dist/js/types";

import type { ApplicationDriver } from "./ApplicationRegistry";
import APPLICATIONS from "./runtime_data/applications/applicationsList.json";
import EXECUTABLES from "./runtime_data/applications/executablesList.json";
import FLAVORS from "./runtime_data/applications/flavorsList.json";
import TEMPLATES from "./runtime_data/applications/templatesList.json";

export default class StandataDriver implements ApplicationDriver {
    private applications = APPLICATIONS as ApplicationSchema[];

    private templates = TEMPLATES as TemplateSchema[];

    private flavors = FLAVORS as FlavorSchema[];

    private executables = EXECUTABLES as ExecutableSchema[];

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
