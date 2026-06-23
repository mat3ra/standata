export interface TreeNodeData {
    key: string;
    value: string;
    name: string;
}

export interface StaticOption {
    key: string;
    values: string[];
    namesMap?: Record<string, string>;
}

export interface TreeNode {
    path: string;
    data: TreeNodeData | null;
    children?: TreeNode[];
    staticOptions?: StaticOption[];
}

export interface UiSchemaProperty {
    "ui:title": string;
}

export interface BaseUiSchemas {
    categories: Record<string, UiSchemaProperty>;
    modelParameters: Record<string, UiSchemaProperty>;
    methodParameters: Record<string, UiSchemaProperty>;
}
