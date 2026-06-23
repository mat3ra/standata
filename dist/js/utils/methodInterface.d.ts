import { BaseMethod, CategorizedMethod, LegacyMethodLocalorbital, LegacyMethodPseudopotential, LegacyMethodRegression, LegacyMethodUnknown, UnitMethodPseudopotential, UnitMethodRegression } from "@mat3ra/esse/dist/js/types";
export declare function safelyGetSlug(slugObj: {
    slug: string;
} | string): string;
/**
 * The method interface converts between the legacy method data structure (type, subtype)
 * and the categorized method data structure (units with tier1, tier2, ...).
 */
export declare class MethodInterface {
    static convertToSimple(cm: CategorizedMethod | undefined): BaseMethod;
    static convertUnknownToSimple(): LegacyMethodUnknown;
    static convertPspUnitsToSimple(cm: UnitMethodPseudopotential[]): LegacyMethodUnknown | LegacyMethodPseudopotential;
    static convertAoUnitToSimple(): LegacyMethodLocalorbital;
    static convertRegressionUnitToSimple(cm: UnitMethodRegression): LegacyMethodRegression;
    static convertToCategorized(sm?: BaseMethod): CategorizedMethod | undefined;
    static convertPspToCategorized(sm: LegacyMethodPseudopotential): CategorizedMethod;
    static convertAoToCategorized(sm: LegacyMethodLocalorbital): CategorizedMethod;
    static convertRegressionToCategorized(sm: LegacyMethodRegression): CategorizedMethod;
}
