"use strict";
/**
 * @file AbstractPipeline.ts
 * @desc An abstraction for a pipeline which combines all the elements of a
 * textvisor together. A pipeline exposes a predict method which returns the
 * highest reward predictions to correct/complete a given input.
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
class AbstractPipeline {
    /**
     * @constructor
     * @desc Combines a predictor and a quality assessor to return the highest quality
     * predictions from the predict method.
     * @param {AbstractPredictor<S, T, any, E extends WeightedPrediction<T>>} predictor
     * @param {AbstractQualityAssessor<S, T>} qualityAssessor
     */
    constructor(predictor, qualityAssessor) {
        this.predictor = predictor;
        this.qualityAssessor = qualityAssessor;
    }
}
exports.default = AbstractPipeline;
//# sourceMappingURL=AbstractPipeline.js.map