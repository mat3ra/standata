import { Standata } from "./base";
import { MethodConfig, UnitMethod } from "./types/method";
import { ModelConfig } from "./types/model";
export declare class MethodStandata extends Standata<MethodConfig> {
    static runtimeData: {
        filesMapByName: {
            "qm/wf/none/ao/pople/wave_function_lcao_pople_basis_set_6_31g.json": {
                name: string;
                path: string;
                units: {
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                    };
                    name: string;
                    parameters: {
                        basisSlug: string;
                    };
                    path: string;
                    tags: string[];
                }[];
            };
            "qm/wf/none/psp/us/any_plane_wave_pseudopotential_method.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/gaussian/plane_wave_norm_conserving_fully_relativistic_pseudopotential_conjugate_gradient_diagonalization_gaussian_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        tier3: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/gaussian/plane_wave_norm_conserving_fully_relativistic_pseudopotential_davidson_diagonalization_gaussian_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/gaussian/plane_wave_norm_conserving_pseudopotential_conjugate_gradient_diagonalization_gaussian_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        tier3: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/gaussian/plane_wave_norm_conserving_pseudopotential_davidson_diagonalization_gaussian_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/gaussian/plane_wave_projector_augmented_wave_pseudopotential_conjugate_gradient_diagonalization_gaussian_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        tier3: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/gaussian/plane_wave_projector_augmented_wave_pseudopotential_davidson_diagonalization_gaussian_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/gaussian/plane_wave_ultra_soft_pseudopotential_conjugate_gradient_diagonalization_gaussian_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        tier3: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/gaussian/plane_wave_ultra_soft_pseudopotential_davidson_diagonalization_gaussian_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/methfessel-paxton/plane_wave_norm_conserving_fully_relativistic_pseudopotential_conjugate_gradient_diagonalization_methfessel_paxton_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        tier3: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/methfessel-paxton/plane_wave_norm_conserving_fully_relativistic_pseudopotential_davidson_diagonalization_methfessel_paxton_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/methfessel-paxton/plane_wave_norm_conserving_pseudopotential_conjugate_gradient_diagonalization_methfessel_paxton_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        tier3: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/methfessel-paxton/plane_wave_norm_conserving_pseudopotential_davidson_diagonalization_methfessel_paxton_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/methfessel-paxton/plane_wave_projector_augmented_wave_pseudopotential_conjugate_gradient_diagonalization_methfessel_paxton_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        tier3: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/methfessel-paxton/plane_wave_projector_augmented_wave_pseudopotential_davidson_diagonalization_methfessel_paxton_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/methfessel-paxton/plane_wave_ultra_soft_pseudopotential_conjugate_gradient_diagonalization_methfessel_paxton_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        tier3: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/smearing/methfessel-paxton/plane_wave_ultra_soft_pseudopotential_davidson_diagonalization_methfessel_paxton_smearing.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/tetrahedron/linear/plane_wave_norm_conserving_fully_relativistic_pseudopotential_conjugate_gradient_diagonalization_linear_tetrahedron_method.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        tier3: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/tetrahedron/linear/plane_wave_norm_conserving_fully_relativistic_pseudopotential_davidson_diagonalization_linear_tetrahedron_method.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/tetrahedron/linear/plane_wave_norm_conserving_pseudopotential_conjugate_gradient_diagonalization_linear_tetrahedron_method.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        tier3: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/tetrahedron/linear/plane_wave_norm_conserving_pseudopotential_davidson_diagonalization_linear_tetrahedron_method.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/tetrahedron/linear/plane_wave_projector_augmented_wave_pseudopotential_conjugate_gradient_diagonalization_linear_tetrahedron_method.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        tier3: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/tetrahedron/linear/plane_wave_projector_augmented_wave_pseudopotential_davidson_diagonalization_linear_tetrahedron_method.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/tetrahedron/linear/plane_wave_ultra_soft_pseudopotential_conjugate_gradient_diagonalization_linear_tetrahedron_method.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        tier3: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                        tier3?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
            "qm/wf/none/tetrahedron/linear/plane_wave_ultra_soft_pseudopotential_davidson_diagonalization_linear_tetrahedron_method.json": {
                name: string;
                path: string;
                units: ({
                    categories: {
                        subtype: string;
                        tier1: string;
                        tier2: string;
                        type: string;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                } | {
                    categories: {
                        tier1: string;
                        tier2: string;
                        type: string;
                        subtype?: undefined;
                    };
                    name: string;
                    path: string;
                    tags: string[];
                })[];
            };
        };
        standataConfig: {
            categories: {
                subtype: string[];
                tags: string[];
                tier1: string[];
                tier2: string[];
                tier3: string[];
                type: string[];
            };
            entities: {
                categories: string[];
                filename: string;
            }[];
        };
    };
    getByName(name: string): MethodConfig | undefined;
    getByUnitType(unitType: string): MethodConfig[];
    getByUnitSubtype(unitSubtype: string): MethodConfig[];
    getByUnitTags(...tags: string[]): MethodConfig[];
    getByPath(path: string): MethodConfig[];
    getByUnitParameters(parameters: Record<string, any>): MethodConfig[];
    getAllMethodNames(): string[];
    getAllMethodPaths(): string[];
    getAllUnits(): UnitMethod[];
    getUniqueUnitTypes(): string[];
    getUniqueUnitSubtypes(): string[];
    getCompatibleWithModel(model: ModelConfig): MethodConfig[];
}
