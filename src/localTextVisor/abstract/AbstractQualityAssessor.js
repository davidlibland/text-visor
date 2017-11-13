"use strict";
/**
 * @file AbstractQualityAssessor.ts
 * @desc Abstractions for quality assessors.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @desc An abstract class which utilizes a value differential (extending AbstractValueDifferential)
 * to evaluate an array of predictions and return those of greatest worth.
 * @typeparam S The type of the input on which the predictions are based. Defaults to string.
 * @typeparam T The type of the predictions, defaults to string.
 * @typeparam E A type extending WeightedPrediction<T>. The predictions consist of an array of type E.
 */
class AbstractQualityAssessor {
    /**
     * @constructor
     * @param {AbstractValueDifferential<T>} valueDifferential Used to evaluate the quality
     * of predictions.
     */
    constructor(valueDifferential) {
        this.valueDifferential = valueDifferential;
    }
}
exports.default = AbstractQualityAssessor;
//# sourceMappingURL=AbstractQualityAssessor.js.map