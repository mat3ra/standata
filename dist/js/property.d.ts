import { Standata } from "./base";
export declare class PropertyStandata extends Standata {
    static runtimeData: {
        filesMapByName: {
            "band_structure.json": {
                name: string;
                spin: number[];
                xAxis: {
                    label: string;
                    units: string;
                };
                xDataArray: number[][];
                yAxis: {
                    label: string;
                    units: string;
                };
                yDataSeries: number[][];
            };
            "valence_band_offset.json": {
                name: string;
                units: string;
                value: number;
            };
        };
        standataConfig: {
            categories: {
                application: string[];
                measurement: string[];
                property_class: string[];
                type: string[];
                value_type: string[];
            };
            entities: {
                categories: string[];
                filename: string;
            }[];
        };
    };
}
