/**
 * @file AbstractPipeline.ts
 * @desc An abstraction for a pipeline which combines all the elements of a
 * textvisor together. A pipeline exposes a predict method which returns the
 * highest reward predictions to correct/complete a given input.
 */
/**
 * Imports:
 */
import { QualityModuleType } from "../Enums";
import { WeightedPrediction } from "./AbstractPredictor";
import AbstractPredictor from "./AbstractPredictor";
import AbstractQualityAssessor from "./AbstractQualityAssessor";
/**
 * @abstract
 * @class AbstractPipeline
 * @desc A pipeline combines all the elements of a textvisor together. It
 * exposes a predict method which returns the highest reward predictions to
 * correct/complete a given input.
 * @typeparam S The type of the input on which the predictions are based.
 * @typeparam T The type of the predictions.
 * @typeparam E A type extending WeightedPrediction<T>. The predictions consist of an array of type E.
 */
export default abstract class AbstractPipeline<S, T, E extends WeightedPrediction<T>> {
    protected predictor: AbstractPredictor<S, T, any, E>;
    protected qualityAssessor: AbstractQualityAssessor<S, T>;
    /**
     * @constructor
     * @desc Combines a predictor and a quality assessor to return the highest quality
     * predictions from the predict method.
     * @param {AbstractPredictor<S, T, any, E extends WeightedPrediction<T>>} predictor
     * @param {AbstractQualityAssessor<S, T>} qualityAssessor
     */
    constructor(predictor: AbstractPredictor<S, T, any, E>, qualityAssessor: AbstractQualityAssessor<S, T>);
    /**
     * @abstract
     * @method predict.
     * @desc Returns a Promise of the highest reward predictions to correct/complete a given input.
     * @param {S} input
     * @param {number} limit A cap on the number of predictions to return.
     * @param {number} offset The number of highest reward predictions to skip, useful for paginating the results.
     * @param {QualityModuleType} qualityType Specifies which form of reward the predictions are evaluated against.
     * @returns {Promise<E[]>}
     */
    abstract predict(input: S, limit: number, offset: number, qualityType: QualityModuleType): Promise<E[]>;
}
