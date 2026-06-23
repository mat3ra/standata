export interface EntityItem {
    filename: string;
    categories: string[];
}

export interface EntityCategories {
    [key: string]: string[];
}

export interface StandataConfig {
    categories: EntityCategories;
    entities: EntityItem[];
}

export interface RuntimeData {
    standataConfig: StandataConfig;
    filesMapByName: Record<string, unknown>;
}
