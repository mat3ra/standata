"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryValue = getCategoryValue;
exports.getModelCategoryTags = getModelCategoryTags;
function getCategoryValue(category) {
    if (!category)
        return undefined;
    return typeof category === "string" ? category : category.slug;
}
function getModelCategoryTags(model) {
    var _a;
    const c = model.categories || {};
    const typeVal = typeof c.type === "string" ? c.type : (_a = c.type) === null || _a === void 0 ? void 0 : _a.slug;
    return [c.tier1, c.tier2, c.tier3, typeVal, c.subtype].filter(Boolean);
}
