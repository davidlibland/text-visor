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
    QualityType,
    QUALITY_TYPE
} from "./Enums";

export class RankedQualityAssessor<T> extends AbstractQualityAssessor<T> {
    constructor(valueDifferential: AbstractValueDifferential<T>) {
        super(valueDifferential);
    }

    assess(input: T, predictions: WeightedPrediction<T>[], limit: number, offset: number = 0, qualityType: QualityType = QUALITY_TYPE.EXPECTED_REWARD): WeightedPrediction<T>[] {
        let qualityPredictions: WeightedPrediction<T>[];
        switch (qualityType) {
            case QUALITY_TYPE.EXPECTED_REWARD:
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
                const expectedRewardComputation = (wPred: WeightedPrediction<T>) => {
                    const reward = this.valueDifferential.evaluate(input, wPred.prediction);
                    const expectedReward = wPred.weight * invNormalizer * reward;
                    return Object.assign({}, wPred, { weight: expectedReward });
                };
                qualityPredictions = predictions.map(expectedRewardComputation);
                break;
            case QUALITY_TYPE.CONFIDENCE:
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

export class StandardPipeline<T, P> extends AbstractPipeline<T> {
    protected predictor: AbstractPredictor<T, P>;
    protected qualityAssessor: AbstractQualityAssessor<T>;
    protected priorCallback: () => P;
    constructor(predictor: AbstractPredictor<T, P>, qualityAssessor: AbstractQualityAssessor<T>, priorCallback: () => P) {
        super(predictor, qualityAssessor);
        this.priorCallback = priorCallback;
    }

    predict(input: T, limit: number, offset: number = 0, qualityType: QualityType = QUALITY_TYPE.EXPECTED_REWARD): WeightedPrediction<T>[] {
        const predictions = this.predictor.predict(this.priorCallback(), input);
        return this.qualityAssessor.assess(input, predictions, limit, offset, qualityType);
    }
}