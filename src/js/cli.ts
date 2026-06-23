import { command, option, optional, positional, run, string } from "cmd-ts";
import * as fs from "fs";
import yaml from "js-yaml";
import * as path from "path";
import * as process from "process";

import { Standata } from "./base";
import { StandataConfig } from "./types/standata";

function readEntityConfig(entityConfig: string): StandataConfig {
    const fileContent = fs.readFileSync(path.resolve(entityConfig), { encoding: "utf-8" });
    return yaml.load(fileContent) as StandataConfig;
}

function main(entityConfigPath: string, destination?: string): void {
    const entityDir = path.dirname(entityConfigPath);
    let saveDir = path.dirname(entityConfigPath);
    if (destination && fs.existsSync(destination)) {
        saveDir = destination;
    }
    const categoriesRoot = path.join(saveDir, "by_category");

    const cfg = readEntityConfig(entityConfigPath);
    const std = new Standata(cfg);

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

const app = command({
    name: "standata-create-symlinks",
    description: "Sort entity files by category (as symlinks).",
    args: {
        entityConfigPath: positional({
            type: string,
            displayName: "CONFIG",
            description: "The entity config file (usually 'categories.yml')",
        }),
        destination: option({
            type: optional(string),
            long: "destination",
            short: "d",
            description: "Where to place symlink directory.",
        }),
    },
    handler: ({ entityConfigPath, destination }) => main(entityConfigPath, destination),
});

run(app, process.argv.slice(2));
