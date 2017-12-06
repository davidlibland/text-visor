"use strict";
/**
 * @file StandardLTVModules.ts
 * @desc Some relatively standard LTV modules.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractPipeline_1 = require("./abstract/AbstractPipeline");
var AbstractQualityAssessor_1 = require("./abstract/AbstractQualityAssessor");
var AbstractValueDifferential_1 = require("./abstract/AbstractValueDifferential");
var Enums_1 = require("./Enums");
/**
 * @class RankedQualityAssessor
 * @extends AbstractQualityAssessor
 * @desc This ranks predictions from highest to lowest based on a value differential (passed
 * into the constructor), and returns the highest quality predictions.
 * @typeparam S the type of the input on which the predictions are based. Defaults to string.
 * @typeparam T the type of the predictions, defaults to string.
 * @typeparam E a type extending WeightedPrediction<T>. The predictions consist of an array of type E.
 */
var RankedQualityAssessor = (function (_super) {
    __extends(RankedQualityAssessor, _super);
    /**
     * @constructor
     * @param {AbstractValueDifferential<T>} valueDifferential used to rank the predictions.
     */
    function RankedQualityAssessor(valueDifferential) {
        return _super.call(this, valueDifferential) || this;
    }
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
    RankedQualityAssessor.prototype.assess = function (input, predictions, limit, offset, qualityType) {
        var _this = this;
        if (offset === void 0) { offset = 0; }
        if (qualityType === void 0) { qualityType = Enums_1.QUALITY_MODULE_TYPE.EXPECTED_REWARD; }
        var qualityPredictions;
        switch (qualityType) {
            case Enums_1.QUALITY_MODULE_TYPE.EXPECTED_REWARD:
                // We assume the weights of the WeightedPredictions comprise a set of dirichlet parameters,
                // so to compute the expected value, we normalize them to a probability.
                var normalizer = predictions.reduce(function (partialSum, wPred) { return (partialSum + wPred.weight); }, 0);
                if (normalizer === 0) {
                    qualityPredictions = [];
                    break;
                }
                var invNormalizer_1 = 1 / normalizer;
                var expectedRewardComputation = function (wPred) {
                    var reward = _this.valueDifferential.evaluate(input, wPred.prediction);
                    var expectedReward = wPred.weight * invNormalizer_1 * reward;
                    return Object.assign({}, wPred, { weight: expectedReward });
                };
                qualityPredictions = predictions
                    .map(expectedRewardComputation)
                    .filter(function (wPred) { return (wPred.weight > 0); });
                break;
            case Enums_1.QUALITY_MODULE_TYPE.CONFIDENCE:
                qualityPredictions = predictions;
                break;
            default:
                qualityPredictions = predictions;
                break;
        }
        // ToDo: We should use a heap to speed this up (only take the top offset + limit terms).
        qualityPredictions.sort(function (a, b) { return (b.weight - a.weight); });
        return qualityPredictions.slice(offset, offset + limit);
    };
    return RankedQualityAssessor;
}(AbstractQualityAssessor_1.default));
exports.RankedQualityAssessor = RankedQualityAssessor;
/**
 * @class FlatDifferential
 * @extends AbstractValueDifferential
 * @desc assigns all predictions an equal value of 1.
 * @typeparam S the type of the input. Defaults to string.
 * @typeparam T the type of the prediction. Defaults to string.
 */
var FlatDifferential = (function (_super) {
    __extends(FlatDifferential, _super);
    function FlatDifferential() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @method evaluate
     * @desc Returns a flat value of 1 for any prediction and input
     * @param {S} input
     * @param {T} prediction
     * @returns {number} The constant value of 1.
     */
    FlatDifferential.prototype.evaluate = function (input, prediction) {
        return 1;
    };
    return FlatDifferential;
}(AbstractValueDifferential_1.default));
exports.FlatDifferential = FlatDifferential;
/**
 * @class FlatDifferential
 * @extends AbstractValueDifferential
 * @desc The value assigned to a prediction is exactly the difference between it's
 * length and the length of the input. Thus longer completions are more highly valued
 * than shorter ones.
 * @typeparam S the type of the input. Defaults to string.
 * @typeparam T the type of the prediction. Defaults to string.
 */
var LengthValueDifferential = (function (_super) {
    __extends(LengthValueDifferential, _super);
    /**
     * @constructor
     * @param {(input: S) => T} inputConverter converts the input (of type S) to the type T
     * (which has a length) in order to compare their lengths.
     */
    function LengthValueDifferential(inputConverter) {
        var _this = _super.call(this) || this;
        _this.inputConverter = inputConverter;
        return _this;
    }
    /**
     * @method evaluate
     * @desc The value assigned to a prediction is exactly the difference between it's
     * length and the length of the input. Thus longer completions are more highly valued
     * than shorter ones.
     * @param {S} input
     * @param {T} prediction
     * @returns {number} The absolute difference in lengths between the input and the prediction.
     */
    LengthValueDifferential.prototype.evaluate = function (input, prediction) {
        return Math.abs(prediction.length - this.inputConverter(input).length);
    };
    return LengthValueDifferential;
}(AbstractValueDifferential_1.default));
exports.LengthValueDifferential = LengthValueDifferential;
/**
 * @class FlatDifferential
 * @extends AbstractValueDifferential
 * @desc The value assigned to a prediction is exactly the difference between it's
 * length and the length of the input. Thus longer completions are more highly valued
 * than shorter ones.
 * @typeparam S the type of the input. Defaults to string.
 * @typeparam T the type of the prediction. Defaults to string.
 */
var ProbOfNotRejectingSymbolsGainedDifferential = (function (_super) {
    __extends(ProbOfNotRejectingSymbolsGainedDifferential, _super);
    /**
     * @constructor
     * @param {(input: S) => T} inputConverter converts the input (of type S) to the type T
     * (which has a length) in order to compare their lengths.
     * @param {number} rejectionLogit The logit of rejecting a symbol gained,
     * i.e. log(p/(1-p)) where p is the rejection probability for a symbol
     * gained.
     */
    function ProbOfNotRejectingSymbolsGainedDifferential(inputConverter, rejectionLogit) {
        var _this = _super.call(this) || this;
        _this.inputConverter = inputConverter;
        _this.rejectionProb = 1 / (1 + Math.exp(-rejectionLogit));
        return _this;
    }
    ProbOfNotRejectingSymbolsGainedDifferential.prototype.evaluate = function (input, prediction) {
        return 1 - Math.pow(this.rejectionProb, Math.abs(prediction.length - this.inputConverter(input).length));
    };
    return ProbOfNotRejectingSymbolsGainedDifferential;
}(AbstractValueDifferential_1.default));
exports.ProbOfNotRejectingSymbolsGainedDifferential = ProbOfNotRejectingSymbolsGainedDifferential;
var StandardPipeline = (function (_super) {
    __extends(StandardPipeline, _super);
    /**
     * @constructor
     * @param {AbstractPredictor<S, T, P>} predictor
     * @param {AbstractQualityAssessor<S, T, E extends WeightedPrediction<T>>} qualityAssessor
     * @param {() => P} priorCallback
     */
    function StandardPipeline(predictor, qualityAssessor, priorCallback) {
        var _this = _super.call(this, predictor, qualityAssessor) || this;
        _this.priorCallback = priorCallback;
        return _this;
    }
    StandardPipeline.prototype.predict = function (input, limit, offset, qualityType) {
        var _this = this;
        if (offset === void 0) { offset = 0; }
        if (qualityType === void 0) { qualityType = Enums_1.QUALITY_MODULE_TYPE.EXPECTED_REWARD; }
        return this.predictor.predict(this.priorCallback(), input)
            .then(function (predictions) { return _this.qualityAssessor.assess(input, predictions, limit, offset, qualityType); });
    };
    return StandardPipeline;
}(AbstractPipeline_1.default));
exports.StandardPipeline = StandardPipeline;
//# sourceMappingURL=StandardLTVModules.js.map