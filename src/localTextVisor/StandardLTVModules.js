"use strict";
/**
 * @file StandardLTVModules.ts
 * @desc Some relatively standard LTV modules.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Abstract_1 = require("./Abstract");
const Enums_1 = require("./Enums");
class RankedQualityAssessor extends Abstract_1.AbstractQualityAssessor {
    constructor(valueDifferential) {
        super(valueDifferential);
    }
    assess(input, predictions, limit, offset = 0, qualityType = Enums_1.QUALITY_TYPE.EXPECTED_REWARD) {
        let qualityPredictions;
        switch (qualityType) {
            case Enums_1.QUALITY_TYPE.EXPECTED_REWARD:
                // We assume the weights of the WeightedPredictions comprise a set of dirichlet parameters,
                // so to compute the expected value, we normalize them to a probability.
                const normalizer = predictions.reduce((partialSum, wPred) => (partialSum + wPred.weight), 0);
                if (normalizer == 0) {
                    qualityPredictions = [];
                    break;
                }
                const invNormalizer = 1 / normalizer;
                const expectedRewardComputation = (wPred) => {
                    const reward = this.valueDifferential.evaluate(input, wPred.prediction);
                    const expectedReward = wPred.weight * invNormalizer * reward;
                    return Object.assign({}, wPred, { weight: expectedReward });
                };
                qualityPredictions = predictions.map(expectedRewardComputation);
                break;
            case Enums_1.QUALITY_TYPE.CONFIDENCE:
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
class LengthValueDifferential extends Abstract_1.AbstractValueDifferential {
    evaluate(alpha, beta) {
        return Math.abs(beta.length - alpha.length);
    }
}
exports.LengthValueDifferential = LengthValueDifferential;
class StandardPipeline extends Abstract_1.AbstractPipeline {
    constructor(predictor, qualityAssessor, priorCallback) {
        super(predictor, qualityAssessor);
        this.priorCallback = priorCallback;
    }
    predict(input, limit, offset = 0, qualityType = Enums_1.QUALITY_TYPE.EXPECTED_REWARD) {
        const predictions = this.predictor.predict(this.priorCallback(), input);
        return this.qualityAssessor.assess(input, predictions, limit, offset, qualityType);
    }
}
exports.StandardPipeline = StandardPipeline;
//# sourceMappingURL=StandardLTVModules.js.map