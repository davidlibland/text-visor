"use strict";
/**
 * @file AbstractPredictor.ts
 * @desc Abstractions and standard types for the local text visor predictor.
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
class AbstractPredictor {
}
exports.default = AbstractPredictor;
//# sourceMappingURL=AbstractPredictor.js.map