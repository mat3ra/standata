import type { WorkflowBaseUnitSchema } from "@mat3ra/esse/dist/js/types";

/**
 * @summary set the head of an array of units
 */
function setUnitsHead<T extends WorkflowBaseUnitSchema>(units: T[]) {
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
function setNextLinks<T extends WorkflowBaseUnitSchema>(units: T[]) {
    const flowchartIds = units.map((u) => u.flowchartId);
    for (let i = 0; i < units.length - 1; i++) {
        if (!units[i].next) {
            // newly added units don't have next set yet => set it
            units[i].next = units[i + 1].flowchartId;
            if (i > 0) units[i - 1].next = units[i].flowchartId;
        } else if (!flowchartIds.includes(units[i].next ?? "")) {
            // newly removed units may create broken next links => fix it
            units[i].next = units[i + 1].flowchartId;
        }
    }
    return units;
}

export function setUnitLinks<T extends WorkflowBaseUnitSchema>(units: T[]) {
    return setNextLinks(setUnitsHead(units));
}
