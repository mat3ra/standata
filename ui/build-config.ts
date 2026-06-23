export const BUILD_CONFIG = {
    assetsDir: "ui/assets",
    dataDir: "ui/data",
    distDir: "dist/js/ui",
    assets: [
        { source: "model.yml", target: "modelTree.json" },
        { source: "method.yml", target: "methodTree.json" },
        { source: "manifest/ui_schema_titles.yml", target: "schemas.json" },
    ],
};
