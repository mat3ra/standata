"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupNunjucksEnvironment = setupNunjucksEnvironment;
const sprintf_js_1 = require("sprintf-js");
const DEFAULT_FILTERS = {
    sprintf: (value, format) => (0, sprintf_js_1.sprintf)(format, value),
};
function setupNunjucksEnvironment(env) {
    Object.entries(DEFAULT_FILTERS).forEach(([name, filter]) => {
        env.addFilter(name, filter);
    });
    return env;
}
