/**
 * @file AbstractPredictor.ts
 * @desc Abstractions and standard types for the local text visor predictor.
 */
/**
 * @type MapPrior
 * @desc The default type for a priors: a map from token, value pairs to
 * relative probabilities (i.e. dirichlet parameters).
 */
export declare type MapPrior<T = string> = ((token: T) => number);
/**
 * @interface WeightedPrediction
 * @desc Predictions of type T along with weights (which indicate the confidence
 * in the prediction being correct, for example).
 * @typeparam T The type of the the prediction. Defaults to a string.
 */
export interface WeightedPrediction<T = string> {
    weight: number;
    prediction: T;
}
/**
 * @abstract
 * @class AbstractPredictor
 * @desc An abstract predictor.
 * @typeparam S The type of the input to the predict method, defaults to string.
 * @typeparam T The type of the predictions which are output, defaults to string.
 * @typeparam P The type of the prior passed to the predict method, defaults to MapPrior<T>.
 * @typeparam E A type extending WeightedPrediction<T>. The predict method will
 * return a Promise of an array of type E.
 */
export default abstract class AbstractPredictor<S = string, T = string, P = MapPrior<T>, E extends WeightedPrediction<T> = WeightedPrediction<T>> {
    /**
     * @abstract
     * @method predict
     * @desc Predicts the most likely completions/corrections to the input.
     * @param {P} prior A-priori likelihoods for the different predictions.
     * @param {S} input Possibly incorrect/incomplete input which this method attempts to fix.
     * @returns {Promise<E[]>} An array of suggested (weighted) predictions.
     */
    abstract predict(prior: P, input: S): Promise<E[]>;
}
