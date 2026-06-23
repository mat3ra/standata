export type CategoryLike = string | {
    name?: string;
    slug?: string;
} | undefined;
export declare function getCategoryValue(category: CategoryLike): string | undefined;
export declare function getModelCategoryTags(model: {
    categories: any;
}): string[];
