export type CategoryLike = string | { name?: string; slug?: string } | undefined;

export function getCategoryValue(category: CategoryLike): string | undefined {
    if (!category) return undefined;
    return typeof category === "string" ? category : category.slug;
}

export function getModelCategoryTags(model: { categories: any }): string[] {
    const c = model.categories || {};
    const typeVal = typeof c.type === "string" ? c.type : c.type?.slug;
    return [c.tier1, c.tier2, c.tier3, typeVal, c.subtype].filter(Boolean) as string[];
}
