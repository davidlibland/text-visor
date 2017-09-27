/**
 * @file LanguageStub.ts
 * @desc A minimal stub for the language model.
 */
import { AbstractPredictor, WeightedPrediction } from "./Abstract";
export declare class IdentityPredictor<T = string> extends AbstractPredictor<T, any> {
    predict(prior: any, input: T): WeightedPrediction<T>[];
}
