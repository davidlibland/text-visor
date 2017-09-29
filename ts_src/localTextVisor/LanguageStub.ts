/**
 * @file LanguageStub.ts
 * @desc A minimal stub for the language model.
 */

import {
    AbstractPredictor,
    WeightedPrediction,
} from "./Abstract";

export class MapPredictor<S = string, T = string> extends AbstractPredictor<S, T, any, any> {
    private map: (S) => T;

    constructor(map: (S) => T) {
        super();
        this.map = map;
    }
    predict(prior: any, input: S): WeightedPrediction<T>[] {
        return [{ weight: 1, prediction: this.map(input) }];
    }
}