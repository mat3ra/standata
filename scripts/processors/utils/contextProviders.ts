import type { TemplateSchema } from "@mat3ra/esse/dist/js/types";
import serverUtils from "@mat3ra/utils/server";
import * as path from "path";

import { BUILD_CONFIG } from "../../../build-config";

/**
 * Maps Standata template `contextProviders[].name` (wode class names) to the Jinja
 * rendering-context key each provider exposes via `ContextProvider.name`.
 *
 * Source: dist/js/runtime_data/applications/contextProviderJinjaKeysByClassName.json
 * Keep in sync with `PROVIDER_REGISTRY` in `@mat3ra/wode` (`context/providers/index.ts`).
 */
const CONTEXT_PROVIDER_JINJA_KEYS = serverUtils.json.readJSONFileSync(
    path.resolve(
        __dirname,
        "../../..",
        BUILD_CONFIG.distRuntimeDataDir,
        "applications/contextProviderJinjaKeysByClassName.json",
    ),
) as Record<string, string>;

type UnusedTemplateContextProviderIssue = {
    applicationName: string;
    executableName: string;
    templateName: string;
    providerClassName: string;
    jinjaKey?: string;
    reason: "missing-jinja-reference" | "unknown-provider";
};

type TemplateForLint = Pick<
    TemplateSchema,
    "name" | "content" | "contextProviders" | "applicationName" | "executableName"
>;

function getContextProviderJinjaKey(providerClassName: string): string | undefined {
    return CONTEXT_PROVIDER_JINJA_KEYS[providerClassName];
}

function stripJinjaRawBlocks(templateContent: string): string {
    return templateContent.replace(/\{%\s*raw\s*%\}[\s\S]*?\{%\s*endraw\s*%\}/g, "");
}

function isJinjaKeyReferencedInTemplate(templateContent: string, jinjaKey: string): boolean {
    const searchableContent = stripJinjaRawBlocks(templateContent);
    const keyPattern = jinjaKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${keyPattern}\\b`).test(searchableContent);
}

function findUnusedTemplateContextProviders(
    template: TemplateForLint,
): UnusedTemplateContextProviderIssue[] {
    const content = template.content ?? "";

    return template.contextProviders.flatMap((provider) => {
        const providerClassName = provider.name;

        const jinjaKey = getContextProviderJinjaKey(providerClassName);
        if (!jinjaKey) {
            return [
                {
                    applicationName: template.applicationName,
                    executableName: template.executableName,
                    templateName: template.name,
                    providerClassName,
                    reason: "unknown-provider" as const,
                },
            ];
        }

        if (isJinjaKeyReferencedInTemplate(content, jinjaKey)) {
            return [];
        }

        return [
            {
                applicationName: template.applicationName,
                executableName: template.executableName,
                templateName: template.name,
                providerClassName,
                jinjaKey,
                reason: "missing-jinja-reference" as const,
            },
        ];
    });
}

export function validateTemplateContextProviders(templates: TemplateForLint[]): void {
    const issues = templates.flatMap((template) => findUnusedTemplateContextProviders(template));

    if (issues.length === 0) {
        return;
    }

    const lines = issues.map((issue) => {
        if (issue.reason === "unknown-provider") {
            return [
                `${issue.applicationName}/${issue.executableName} template "${issue.templateName}":`,
                `  unknown context provider "${issue.providerClassName}" (not in contextProviderJinjaKeysByClassName.json)`,
            ].join("\n");
        }

        return [
            `${issue.applicationName}/${issue.executableName} template "${issue.templateName}":`,
            `  context provider "${issue.providerClassName}" declares Jinja key "${issue.jinjaKey}" but template content does not reference it`,
        ].join("\n");
    });

    throw new Error(
        [
            "Template context provider lint failed:",
            "",
            ...lines,
            "",
            "Each template must reference every declared context provider's Jinja key.",
        ].join("\n"),
    );
}
