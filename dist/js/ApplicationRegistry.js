"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAGS = void 0;
const applicationVersion_1 = require("./utils/applicationVersion");
var TAGS;
(function (TAGS) {
    TAGS["DEFAULT"] = "default";
    TAGS["DEFAULT_VERSION"] = "default_version";
    TAGS["DEFAULT_BUILD"] = "default_build";
})(TAGS || (exports.TAGS = TAGS = {}));
class ApplicationRegistry {
    static setDriver(driver) {
        this.driver = driver;
    }
    constructor(driver) {
        this.driver = driver || ApplicationRegistry.driver;
    }
    getApplications() {
        return this.driver.getApplications();
    }
    getTemplates() {
        return this.driver.getTemplates();
    }
    getFlavors() {
        return this.driver.getFlavors();
    }
    getExecutables() {
        return this.driver.getExecutables();
    }
    findApplication({ name, version, build }) {
        const application = this.driver
            .getApplications()
            .filter((application) => {
            return application.name === name;
        })
            .filter((application) => {
            if (version) {
                return (0, applicationVersion_1.applicationVersionSatisfiesSupportedRange)(application.version, version);
            }
            return application.isDefaultVersion;
        })
            .find((application) => {
            return build ? application.build === build : application.isDefault;
        });
        if (!application) {
            throw new Error(`Application ${name} not found`);
        }
        return application;
    }
    getDefaultApplication() {
        return this.driver.getApplications().find((application) => application.isDefault);
    }
    getExecutablesByApplication(application) {
        return this.driver.getExecutables().filter((executable) => {
            return (executable.applicationName === application.name &&
                (0, applicationVersion_1.applicationVersionSatisfiesSupportedRange)(application.version, executable.applicationVersion));
        });
    }
    getFlavorsByApplicationExecutable(application, executable) {
        return this.driver.getFlavors().filter((flavor) => {
            return (flavor.applicationName === application.name &&
                (0, applicationVersion_1.applicationVersionSatisfiesSupportedRange)(application.version, flavor.applicationVersion) &&
                flavor.executableName === executable.name);
        });
    }
    getDefaultFlavor(application, executable) {
        const flavors = this.getFlavorsByApplicationExecutable(application, executable);
        return flavors.find((flavor) => flavor.isDefault) || flavors[0];
    }
    getInput(application, flavor) {
        const execName = flavor.executableName;
        return flavor.input.map((input) => {
            const inputName = input.templateName || input.name;
            const templates = this.driver.getTemplates().filter((template) => {
                return (application.name === template.applicationName &&
                    (0, applicationVersion_1.applicationVersionSatisfiesSupportedRange)(application.version, template.applicationVersion) &&
                    template.executableName === execName &&
                    template.name === inputName);
            });
            if (templates.length === 0) {
                throw new Error(`Template not found for app=${application.name} exec=${execName} name=${inputName}`);
            }
            if (templates.length > 1) {
                console.log(`found ${templates.length} templates for app=${application.name} exec=${execName} name=${inputName} expected 1`);
            }
            return { ...templates[0], name: input.name };
        });
    }
}
exports.default = ApplicationRegistry;
