"use strict";
/**
 * @file StandardLTVModules.ts
 * @desc Some relatively standard LTV modules.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Abstract_1 = require("./Abstract");
const Enums_1 = require("./Enums");
class RankedQualityAssessor extends Abstract_1.AbstractQualityAssessor {
    constructor(valueDifferential, inputConverter) {
        super(valueDifferential);
        this.inputConverter = inputConverter;
    }
    assess(input, predictions, limit, offset = 0, qualityType = Enums_1.QUALITY_MODULE_TYPE.EXPECTED_REWARD) {
        let qualityPredictions;
        switch (qualityType) {
            case Enums_1.QUALITY_MODULE_TYPE.EXPECTED_REWARD:
                // We assume the weights of the WeightedPredictions comprise a set of dirichlet parameters,
                // so to compute the expected value, we normalize them to a probability.
                const normalizer = predictions.reduce((partialSum, wPred) => (partialSum + wPred.weight), 0);
                if (normalizer === 0) {
                    qualityPredictions = [];
                    break;
                }
                const invNormalizer = 1 / normalizer;
                const expectedRewardComputation = (wPred) => {
                    const reward = this.valueDifferential.evaluate(this.inputConverter(input), wPred.prediction);
                    const expectedReward = wPred.weight * invNormalizer * reward;
                    return Object.assign({}, wPred, { weight: expectedReward });
                };
                qualityPredictions = predictions
                    .map(expectedRewardComputation)
                    .filter((wPred) => (wPred.weight > 0));
                break;
            case Enums_1.QUALITY_MODULE_TYPE.CONFIDENCE:
                qualityPredictions = predictions;
                break;
            default:
                qualityPredictions = predictions;
                break;
        }
        // ToDo: We should use a heap to speed this up (only take the top offset + limit terms).
        qualityPredictions.sort((a, b) => (b.weight - a.weight));
        return qualityPredictions.slice(offset, offset + limit);
    }
}
exports.RankedQualityAssessor = RankedQualityAssessor;
class FlatDifferential extends Abstract_1.AbstractValueDifferential {
    evaluate(alpha, beta) {
        return 1;
    }
}
exports.FlatDifferential = FlatDifferential;
class LengthValueDifferential extends Abstract_1.AbstractValueDifferential {
    evaluate(alpha, beta) {
        return Math.abs(beta.length - alpha.length);
    }
}
exports.LengthValueDifferential = LengthValueDifferential;
class ProbOfNotRejectingSymbolsGainedDifferential extends Abstract_1.AbstractValueDifferential {
    /**
     * @constructor
     * @param {number} rejectionLogit The logit of rejecting a symbol gained,
     * i.e. log(p/(1-p)) where p is the rejection probability for a symbol
     * gained.
     */
    constructor(rejectionLogit) {
        super();
        this.rejectionProb = 1 / (1 + Math.exp(-rejectionLogit));
    }
    evaluate(alpha, beta) {
        return 1 - Math.pow(this.rejectionProb, Math.abs(beta.length - alpha.length));
    }
}
exports.ProbOfNotRejectingSymbolsGainedDifferential = ProbOfNotRejectingSymbolsGainedDifferential;
class StandardPipeline extends Abstract_1.AbstractPipeline {
    /**
     * @constructor
     * @param {AbstractPredictor<S, T, P>} predictor
     * @param {AbstractQualityAssessor<S, T, E extends Object>} qualityAssessor
     * @param {() => P} priorCallback
     */
    constructor(predictor, qualityAssessor, priorCallback) {
        super(predictor, qualityAssessor);
        this.priorCallback = priorCallback;
    }
    predict(input, limit, offset = 0, qualityType = Enums_1.QUALITY_MODULE_TYPE.EXPECTED_REWARD) {
        return this.predictor.predict(this.priorCallback(), input)
            .then((predictions) => this.qualityAssessor.assess(input, predictions, limit, offset, qualityType));
    }
}
exports.StandardPipeline = StandardPipeline;
//# sourceMappingURL=StandardLTVModules.js.map