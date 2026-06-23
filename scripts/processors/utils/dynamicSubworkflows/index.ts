import getQpointIrrep from "./espresso/getQpointIrrep";
import { getSurfaceEnergySubworkflowUnits } from "./surfaceEnergy";

const dynamicSubworkflowsByApp = {
    espresso: { getQpointIrrep },
} as const;

export { getSurfaceEnergySubworkflowUnits, dynamicSubworkflowsByApp };
