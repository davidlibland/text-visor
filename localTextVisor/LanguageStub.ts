/**
 * @file LanguageStub.ts
 * @desc A minimal stub for the language model.
 */

import {
    AbstractPredictor,
    WeightedPrediction,
} from "./Abstract";

export class IdentityPredictor<T = string, P = any> extends AbstractPredictor<T, P> {
    predict(prior: P, input: T): WeightedPrediction<T>[]{
        return [{weight: 1, prediction: input}];
    }
}