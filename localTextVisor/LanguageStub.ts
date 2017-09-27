/**
 * @file LanguageStub.ts
 * @desc A minimal stub for the language model.
 */

import {
    AbstractPredictor,
    WeightedPrediction,
} from "./Abstract";

export class IdentityPredictor<T = string> extends AbstractPredictor<T, any> {
    predict(prior: any, input: T): WeightedPrediction<T>[]{
        return [{weight: 1, prediction: input}];
    }
}