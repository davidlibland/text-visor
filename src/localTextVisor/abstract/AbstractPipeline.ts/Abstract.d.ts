/**
 * @file Abstract.ts
 * @desc Abstractions and standard types for the local text visor modules.
 */
import { AbstractPredictor, WeightedPrediction } from "./abstract/AbstractPredictor";
import { QualityModuleType } from "./Enums";
import { AbstractQualityAssessor } from "./abstract/AbstractQualityAssessor";
/**
 * @abstract
 * @class AbstractPipeline
 * @desc A pipeline combines all the elements of a textvisor together. It
 * exposes a predict method which returns the highest reward predictions to
 * correct/complete a given input.
 * @typeparam S the type of the input on which the predictions are based.
 * @typeparam T the type of the predictions.
 * @typeparam E a type extending WeightedPrediction<T>. The predictions consist of an array of type E.
 */
export declare abstract class AbstractPipeline<S, T, E extends WeightedPrediction<T>> {
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
     * @param {number} limit a cap on the number of predictions to return.
     * @param {number} offset the number of highest reward predictions to skip, useful for paginating the results.
     * @param {QualityModuleType} qualityType specifies which form of reward the predictions are evaluated against.
     * @returns {Promise<E[]>}
     */
    abstract predict(input: S, limit: number, offset: number, qualityType: QualityModuleType): Promise<E[]>;
}
