import { Utils } from "@mat3ra/utils/server";
import * as fs from "fs";
import * as path from "path";

// @ts-ignore
import { findJsonFilesRecursively } from "./utils";

const RUNTIME_DATA_DIR = path.resolve(__dirname, "../dist/js/runtime_data");

function checkJsonFilesMinified(): void {
    if (!fs.existsSync(RUNTIME_DATA_DIR)) {
        console.log(`Directory ${RUNTIME_DATA_DIR} does not exist. Skipping check.`);
        process.exit(0);
    }

    const jsonFiles = findJsonFilesRecursively(RUNTIME_DATA_DIR);
    const errors: string[] = [];

    jsonFiles.forEach((filePath) => {
        if (!Utils.json.isJSONMinified(filePath)) {
            const relativePath = path.relative(process.cwd(), filePath);
            errors.push(relativePath);
        }
    });

    if (errors.length > 0) {
        console.error(
            "❌ The following JSON files are not minified (contain formatting like newlines or unnecessary whitespace):",
        );
        errors.forEach((file) => console.error(`  - ${file}`));
        process.exit(1);
    }

    console.log(`✅ All ${jsonFiles.length} JSON files in dist/js/runtime_data are minified.`);
}

checkJsonFilesMinified();
