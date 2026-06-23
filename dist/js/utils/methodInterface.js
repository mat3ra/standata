"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodInterface = exports.safelyGetSlug = void 0;
const mode_1 = require("@mat3ra/mode");
const default_methods_1 = require("@mat3ra/mode/dist/default_methods");
function safelyGetSlug(slugObj) {
    return typeof slugObj === "string" ? slugObj : slugObj.slug;
}
exports.safelyGetSlug = safelyGetSlug;
/**
 * The method interface converts between the legacy method data structure (type, subtype)
 * and the categorized method data structure (units with tier1, tier2, ...).
 */
class MethodInterface {
    static convertToSimple(cm) {
        if (!cm)
            return this.convertUnknownToSimple();
        const pspUnits = cm.units.filter((u) => u.categories.type === "psp");
        const aoUnit = cm.units.find((u) => u.categories.type === "ao");
        const reUnit = cm.units.find((u) => u.name && u.name.includes("regression"));
        // @ts-ignore
        if (pspUnits.length)
            return this.convertPspUnitsToSimple(pspUnits);
        if (aoUnit)
            return this.convertAoUnitToSimple();
        if (reUnit)
            return this.convertRegressionUnitToSimple(reUnit);
        return this.convertRegressionUnitToSimple(reUnit);
    }
    static convertUnknownToSimple() {
        return default_methods_1.UnknownMethodConfig;
    }
    static convertPspUnitsToSimple(cm) {
        var _a;
        const [firstPspUnit, ...otherUnits] = cm;
        if (!firstPspUnit || !((_a = firstPspUnit.categories) === null || _a === void 0 ? void 0 : _a.subtype))
            return this.convertUnknownToSimple();
        const subtype = (otherUnits === null || otherUnits === void 0 ? void 0 : otherUnits.length) ? "any" : firstPspUnit.categories.subtype;
        return {
            type: "pseudopotential",
            subtype,
        };
    }
    static convertAoUnitToSimple() {
        return default_methods_1.LocalOrbitalMethodConfig;
    }
    static convertRegressionUnitToSimple(cm) {
        const type = cm.categories.type || "linear";
        const subtype = cm.categories.subtype || "least_squares";
        return {
            type: safelyGetSlug(type),
            subtype: safelyGetSlug(subtype),
            data: cm.data,
            precision: cm.precision,
        };
    }
    static convertToCategorized(sm) {
        switch (sm === null || sm === void 0 ? void 0 : sm.type) {
            case "pseudopotential":
                return this.convertPspToCategorized(sm);
            case "localorbital":
                return this.convertAoToCategorized(sm);
            case "linear":
                return this.convertRegressionToCategorized(sm);
            case "kernel_ridge":
                return this.convertRegressionToCategorized(sm);
            default:
                return undefined;
        }
    }
    static convertPspToCategorized(sm) {
        const subtype = safelyGetSlug(sm.subtype);
        // the "any" subtype is equivalent to the method representing all planewave-pseudopotential
        // methods. All other subtypes are equivalent to using a specific PW-PSP method.
        const path = subtype === "any"
            ? "/qm/wf/none/psp/us::/qm/wf/none/psp/nc::/qm/wf/none/psp/nc-fr::/qm/wf/none/psp/paw::/qm/wf/none/pw/none"
            : `/qm/wf/none/smearing/gaussian::/linalg/diag/none/davidson/none::/qm/wf/none/psp/${subtype}::/qm/wf/none/pw/none`;
        return mode_1.categorizedMethodList.find((catMethod) => {
            return catMethod.path === path;
        });
    }
    static convertAoToCategorized(sm) {
        const subtype = safelyGetSlug(sm.subtype);
        return {
            units: [
                {
                    parameters: { basisSlug: "6-31G" },
                    categories: { tier1: "qm", tier2: "wf", type: "ao", subtype },
                    tags: ["atomic orbital"],
                    name: "Wave function: LCAO - Pople basis set (6-31G)",
                    path: "/qm/wf/none/ao/pople?basisSlug=6-31G",
                },
            ],
            name: "Wave function: LCAO - Pople basis set (6-31G)",
            path: "/qm/wf/none/ao/pople?basisSlug=6-31G",
        };
    }
    static convertRegressionToCategorized(sm) {
        const type = safelyGetSlug(sm.type);
        const subtype = safelyGetSlug(sm.subtype);
        const { precision, data } = sm;
        const path = `/none/none/none/${type}/${subtype}`;
        const nameMap = {
            kernel_ridge: "Kernel ridge",
            linear: "Linear",
            least_squares: "least squares",
            ridge: "ridge",
        };
        // @ts-ignore
        const name = `${nameMap[type]} ${nameMap[subtype]} regression`;
        return {
            units: [
                {
                    categories: { type, subtype },
                    name,
                    path,
                    precision,
                    data,
                },
            ],
            name,
            path,
        };
    }
}
exports.MethodInterface = MethodInterface;
