/**
 * @file StandardLTVModules.ts
 * @desc Some relatively standard LTV modules.
 */

import {
    AbstractPipeline,
    AbstractPredictor,
    AbstractQualityAssessor,
    AbstractValueDifferential,
    WeightedPrediction,
} from "./Abstract";
import {
    QualityModuleType,
    QUALITY_MODULE_TYPE
} from "./Enums";

export class RankedQualityAssessor<S, T, E extends Object> extends AbstractQualityAssessor<S, T, E> {
    private inputConverter: (input: S) => T;

    constructor(valueDifferential: AbstractValueDifferential<T>, inputConverter: (input: S) => T) {
        super(valueDifferential);
        this.inputConverter = inputConverter;
    }

    assess(input: S, predictions: (WeightedPrediction<T> & E)[], limit: number, offset: number = 0, qualityType: QualityModuleType = QUALITY_MODULE_TYPE.EXPECTED_REWARD): (WeightedPrediction<T> & E)[] {
        let qualityPredictions: (WeightedPrediction<T> & E)[];
        switch (qualityType) {
            case QUALITY_MODULE_TYPE.EXPECTED_REWARD:
                // We assume the weights of the WeightedPredictions comprise a set of dirichlet parameters,
                // so to compute the expected value, we normalize them to a probability.
                const normalizer = predictions.reduce(
                    (partialSum, wPred) => (partialSum + wPred.weight),
                    0
                );
                if (normalizer == 0) {
                    qualityPredictions = [];
                    break;
                }
                const invNormalizer = 1 / normalizer;
                const expectedRewardComputation = (wPred: (WeightedPrediction<T> & E)) => {
                    const reward = this.valueDifferential.evaluate(this.inputConverter(input), wPred.prediction);
                    const expectedReward = wPred.weight * invNormalizer * reward;
                    return Object.assign({}, wPred, { weight: expectedReward });
                };
                qualityPredictions = predictions.map(expectedRewardComputation);
                break;
            case QUALITY_MODULE_TYPE.CONFIDENCE:
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

export type HasLengthType = {
    length: number;
}

export class LengthValueDifferential<T extends HasLengthType> extends AbstractValueDifferential<T> {
    evaluate(alpha: T, beta: T): number {
        return Math.abs(beta.length - alpha.length);
    }
}

export class StandardPipeline<S, T, P, E extends Object> extends AbstractPipeline<S, T, any> {
    protected predictor: AbstractPredictor<S, T, P, E>;
    protected qualityAssessor: AbstractQualityAssessor<S, T, E>;
    protected priorCallback: () => P;
    constructor(predictor: AbstractPredictor<S, T, P>, qualityAssessor: AbstractQualityAssessor<S, T, E>, priorCallback: () => P) {
        super(predictor, qualityAssessor);
        this.priorCallback = priorCallback;
    }

    predict(input: S, limit: number, offset: number = 0, qualityType: QualityModuleType = QUALITY_MODULE_TYPE.EXPECTED_REWARD): (WeightedPrediction<T> & E)[] {
        const predictions = this.predictor.predict(this.priorCallback(), input);
        return this.qualityAssessor.assess(input, predictions, limit, offset, qualityType);
    }
}