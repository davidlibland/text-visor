/**
 * @file StandardLTVModules.ts
 * @desc Some relatively standard LTV modules.
 */
import AbstractPipeline from "./abstract/AbstractPipeline";
import AbstractPredictor from "./abstract/AbstractPredictor";
import { WeightedPrediction } from "./abstract/AbstractPredictor";
import AbstractQualityAssessor from "./abstract/AbstractQualityAssessor";
import AbstractValueDifferential from "./abstract/AbstractValueDifferential";
import { QualityModuleType } from "./Enums";
/**
 * @class RankedQualityAssessor
 * @extends AbstractQualityAssessor
 * @desc This ranks predictions from highest to lowest based on a value differential (passed
 * into the constructor), and returns the highest quality predictions.
 * @typeparam S the type of the input on which the predictions are based. Defaults to string.
 * @typeparam T the type of the predictions, defaults to string.
 * @typeparam E a type extending WeightedPrediction<T>. The predictions consist of an array of type E.
 */
export declare class RankedQualityAssessor<S, T, E extends WeightedPrediction<T>> extends AbstractQualityAssessor<S, T, E> {
    /**
     * @constructor
     * @param {AbstractValueDifferential<T>} valueDifferential used to rank the predictions.
     */
    constructor(valueDifferential: AbstractValueDifferential<S, T>);
    /**
     * @method assess
     * @desc uses the valueDifferential passed to the constructor to evaluate which
     * predictions would yield the highest value if they were correct, and combines that
     * with the likelihood of the predictions to suggest those predictions with the highest
     * expected value.
     * @param {S} input
     * @param {E[]} predictions
     * @param {number} limit a cap on the number of predictions to return.
     * @param {number} offset the number of highest reward predictions to skip, useful for paginating the results.
     * @param {QualityModuleType} qualityType specifies which form of reward the predictions are evaluated against.
     * @returns {Array<WeightedPrediction<T> & E>} a ranked array of predictions which are
     * expected to yield the most value, ranked from highest to lowest.
     */
    assess(input: S, predictions: E[], limit: number, offset?: number, qualityType?: QualityModuleType): E[];
}
export interface HasLengthType {
    length: number;
}
/**
 * @class FlatDifferential
 * @extends AbstractValueDifferential
 * @desc assigns all predictions an equal value of 1.
 * @typeparam S the type of the input. Defaults to string.
 * @typeparam T the type of the prediction. Defaults to string.
 */
export declare class FlatDifferential<S, T> extends AbstractValueDifferential<S, T> {
    /**
     * @method evaluate
     * @desc Returns a flat value of 1 for any prediction and input
     * @param {S} input
     * @param {T} prediction
     * @returns {number} The constant value of 1.
     */
    evaluate(input: S, prediction: T): number;
}
/**
 * @class FlatDifferential
 * @extends AbstractValueDifferential
 * @desc The value assigned to a prediction is exactly the difference between it's
 * length and the length of the input. Thus longer completions are more highly valued
 * than shorter ones.
 * @typeparam S the type of the input. Defaults to string.
 * @typeparam T the type of the prediction. Defaults to string.
 */
export declare class LengthValueDifferential<S, T extends HasLengthType> extends AbstractValueDifferential<S, T> {
    protected inputConverter: (input: S) => T;
    /**
     * @constructor
     * @param {(input: S) => T} inputConverter converts the input (of type S) to the type T
     * (which has a length) in order to compare their lengths.
     */
    constructor(inputConverter: (input: S) => T);
    /**
     * @method evaluate
     * @desc The value assigned to a prediction is exactly the difference between it's
     * length and the length of the input. Thus longer completions are more highly valued
     * than shorter ones.
     * @param {S} input
     * @param {T} prediction
     * @returns {number} The absolute difference in lengths between the input and the prediction.
     */
    evaluate(input: S, prediction: T): number;
}
/**
 * @class FlatDifferential
 * @extends AbstractValueDifferential
 * @desc The value assigned to a prediction is exactly the difference between it's
 * length and the length of the input. Thus longer completions are more highly valued
 * than shorter ones.
 * @typeparam S the type of the input. Defaults to string.
 * @typeparam T the type of the prediction. Defaults to string.
 */
export declare class ProbOfNotRejectingSymbolsGainedDifferential<S, T extends HasLengthType> extends AbstractValueDifferential<S, T> {
    protected rejectionProb: number;
    protected inputConverter: (input: S) => T;
    /**
     * @constructor
     * @param {(input: S) => T} inputConverter converts the input (of type S) to the type T
     * (which has a length) in order to compare their lengths.
     * @param {number} rejectionLogit The logit of rejecting a symbol gained,
     * i.e. log(p/(1-p)) where p is the rejection probability for a symbol
     * gained.
     */
    constructor(inputConverter: (input: S) => T, rejectionLogit: number);
    evaluate(input: S, prediction: T): number;
}
export declare class StandardPipeline<S, T, P, E extends WeightedPrediction<T>> extends AbstractPipeline<S, T, E> {
    protected predictor: AbstractPredictor<S, T, P, E>;
    protected qualityAssessor: AbstractQualityAssessor<S, T, E>;
    protected priorCallback: () => P;
    /**
     * @constructor
     * @param {AbstractPredictor<S, T, P>} predictor
     * @param {AbstractQualityAssessor<S, T, E extends WeightedPrediction<T>>} qualityAssessor
     * @param {() => P} priorCallback
     */
    constructor(predictor: AbstractPredictor<S, T, P, E>, qualityAssessor: AbstractQualityAssessor<S, T, E>, priorCallback: () => P);
    predict(input: S, limit: number, offset?: number, qualityType?: QualityModuleType): Promise<E[]>;
}
