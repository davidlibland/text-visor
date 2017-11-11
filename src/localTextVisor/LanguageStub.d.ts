/**
 * @file LanguageStub.ts
 * @desc A minimal stub for the language model.
 */
import AbstractPredictor from "./abstract/AbstractPredictor";
import { WeightedPrediction } from "./abstract/AbstractPredictor";
/**
 * @class MapPredictor
 * @desc given a map, this applies it to every input to yield a single prediction.
 * @typeparam S the type of the input to the predictor
 * @typeparam T the type of the prediction.
 */
export default class MapPredictor<S = string, T = string> extends AbstractPredictor<S, T, any, WeightedPrediction<T>> {
    private map;
    /**
     * @constructor
     * @param {(S) => T} map this map is applied to the input and it's return value is
     * taken as the prediction.
     */
    constructor(map: (S) => T);
    predict(prior: any, input: S): Promise<Array<WeightedPrediction<T>>>;
}
