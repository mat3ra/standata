"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cmd_ts_1 = require("cmd-ts");
const fs = __importStar(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const path = __importStar(require("path"));
const process = __importStar(require("process"));
const base_1 = require("./base");
function readEntityConfig(entityConfig) {
    const fileContent = fs.readFileSync(path.resolve(entityConfig), { encoding: "utf-8" });
    return js_yaml_1.default.load(fileContent);
}
function main(entityConfigPath, destination) {
    const entityDir = path.dirname(entityConfigPath);
    let saveDir = path.dirname(entityConfigPath);
    if (destination && fs.existsSync(destination)) {
        saveDir = destination;
    }
    const categoriesRoot = path.join(saveDir, "by_category");
    const cfg = readEntityConfig(entityConfigPath);
    const std = new base_1.Standata(cfg);
    // eslint-disable-next-line no-restricted-syntax
    for (const entity of std.entities) {
        const categories = std.convertTagToCategory(...entity.categories);
        const entityPath = path.join(entityDir, entity.filename);
        // eslint-disable-next-line no-restricted-syntax
        for (const category of categories) {
            const categoryDir = path.join(categoriesRoot, category);
            if (!fs.existsSync(categoryDir)) {
                fs.mkdirSync(categoryDir, { recursive: true });
            }
            const linkedEntityPath = path.join(categoryDir, entity.filename);
            if (!fs.existsSync(linkedEntityPath)) {
                fs.symlinkSync(entityPath, linkedEntityPath);
            }
        }
    }
}
const app = (0, cmd_ts_1.command)({
    name: "standata-create-symlinks",
    description: "Sort entity files by category (as symlinks).",
    args: {
        entityConfigPath: (0, cmd_ts_1.positional)({
            type: cmd_ts_1.string,
            displayName: "CONFIG",
            description: "The entity config file (usually 'categories.yml')",
        }),
        destination: (0, cmd_ts_1.option)({
            type: (0, cmd_ts_1.optional)(cmd_ts_1.string),
            long: "destination",
            short: "d",
            description: "Where to place symlink directory.",
        }),
    },
    handler: ({ entityConfigPath, destination }) => main(entityConfigPath, destination),
});
(0, cmd_ts_1.run)(app, process.argv.slice(2));
