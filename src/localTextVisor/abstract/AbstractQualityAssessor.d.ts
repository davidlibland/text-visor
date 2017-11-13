/**
 * @file AbstractQualityAssessor.ts
 * @desc Abstractions for quality assessors.
 */
/**
 * Imports:
 */
import { QualityModuleType } from "../Enums";
import { WeightedPrediction } from "./AbstractPredictor";
import AbstractValueDifferential from "./AbstractValueDifferential";
/**
 * @desc An abstract class which utilizes a value differential (extending AbstractValueDifferential)
 * to evaluate an array of predictions and return those of greatest worth.
 * @typeparam S The type of the input on which the predictions are based. Defaults to string.
 * @typeparam T The type of the predictions, defaults to string.
 * @typeparam E A type extending WeightedPrediction<T>. The predictions consist of an array of type E.
 */
export default abstract class AbstractQualityAssessor<S = string, T = string, E extends WeightedPrediction<T> = WeightedPrediction<T>> {
    protected valueDifferential: AbstractValueDifferential<S, T>;
    /**
     * @constructor
     * @param {AbstractValueDifferential<T>} valueDifferential Used to evaluate the quality
     * of predictions.
     */
    constructor(valueDifferential: AbstractValueDifferential<S, T>);
    /**
     * @abstract
     * @method assess
     * @desc Uses the valueDifferential passed to the constructor to evaluate which
     * predictions would yield the highest value if they were correct, and combines that
     * with the likelihood of the predictions to suggest those predictions with the highest
     * expected value.
     * @param {S} input
     * @param {Array<WeightedPrediction<T> & E>} predictions
     * @param {number} limit A cap on the number of predictions to return.
     * @param {number} offset The number of highest reward predictions to skip, useful for paginating the results.
     * @param {QualityModuleType} qualityType Specifies which form of reward the predictions are evaluated against.
     * @returns {Array<WeightedPrediction<T> & E>} A ranked array of predictions which are
     * expected to yield the most value, ranked from highest to lowest.
     */
    abstract assess(input: S, predictions: Array<(WeightedPrediction<T> & E)>, limit: number, offset: number, qualityType: QualityModuleType): Array<WeightedPrediction<T> & E>;
}
