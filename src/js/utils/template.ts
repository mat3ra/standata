import type { Environment } from "nunjucks";
import { sprintf } from "sprintf-js";

const DEFAULT_FILTERS = {
    sprintf: (value: unknown, format: string) => sprintf(format, value),
};

export function setupNunjucksEnvironment(env: Environment): Environment {
    Object.entries(DEFAULT_FILTERS).forEach(([name, filter]) => {
        env.addFilter(name, filter);
    });

    return env;
}
