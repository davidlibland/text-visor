/**
 * @file StandardLTVModules.ts
 * @desc Some relatively standard LTV modules
 */

import {
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

    assess(input: T, predictions: WeightedPrediction<T>[], limit: number, offset: number = 0, qualityType: QualityType = QUALITY_TYPE.EXPECTED_REWARD): WeightedPrediction<T>[]{
        let qualityPredictions: WeightedPrediction<T>[];
        switch (qualityType){
            case QUALITY_TYPE.EXPECTED_REWARD:
                const expectedRewardComputation = (wPred: WeightedPrediction<T>) => {
                    const reward = this.valueDifferential.evaluate(input, wPred.prediction);
                    const expectedReward = wPred.weight * reward;
                    return Object.assign({}, wPred, {weight: expectedReward});
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
        qualityPredictions.sort((a, b) => (b.weight - a.weight));
        return qualityPredictions.slice(offset, offset + limit);
    }
}

type HasLengthType = {
    length: number;
}

export class LengthValueDifferential extends AbstractValueDifferential<HasLengthType> {
    evaluate(alpha: HasLengthType, beta: HasLengthType): number {
        return Math.abs(beta.length - alpha.length);
    }
}