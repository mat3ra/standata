"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUnitLinks = setUnitLinks;
/**
 * @summary set the head of an array of units
 */
function setUnitsHead(units) {
    if (units.length > 0) {
        units[0].head = true;
        for (let i = 1; i < units.length; i++) {
            units[i].head = false;
        }
    }
    return units;
}
/**
 * @summary Re-establishes the linked `next => flowchartId` logic in an array of units
 */
function setNextLinks(units) {
    var _a;
    const flowchartIds = units.map((u) => u.flowchartId);
    for (let i = 0; i < units.length - 1; i++) {
        if (!units[i].next) {
            // newly added units don't have next set yet => set it
            units[i].next = units[i + 1].flowchartId;
            if (i > 0)
                units[i - 1].next = units[i].flowchartId;
        }
        else if (!flowchartIds.includes((_a = units[i].next) !== null && _a !== void 0 ? _a : "")) {
            // newly removed units may create broken next links => fix it
            units[i].next = units[i + 1].flowchartId;
        }
    }
    return units;
}
function setUnitLinks(units) {
    return setNextLinks(setUnitsHead(units));
}
