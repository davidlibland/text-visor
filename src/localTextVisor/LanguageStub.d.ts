/**
 * @file LanguageStub.ts
 * @desc A minimal stub for the language model.
 */
import { AbstractPredictor, WeightedPrediction } from "./Abstract";
export declare class MapPredictor<S = string, T = string> extends AbstractPredictor<S, T, any, any> {
    private map;
    constructor(map: (S) => T);
    predict(prior: any, input: S): WeightedPrediction<T>[];
}
