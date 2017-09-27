/**
 * @file StandardLTVModules.ts
 * @desc Some relatively standard LTV modules.
 */
import { AbstractPipeline, AbstractPredictor, AbstractQualityAssessor, AbstractValueDifferential, WeightedPrediction } from "./Abstract";
import { QualityType } from "./Enums";
export declare class RankedQualityAssessor<T> extends AbstractQualityAssessor<T> {
    constructor(valueDifferential: AbstractValueDifferential<T>);
    assess(input: T, predictions: WeightedPrediction<T>[], limit: number, offset?: number, qualityType?: QualityType): WeightedPrediction<T>[];
}
export declare type HasLengthType = {
    length: number;
};
export declare class LengthValueDifferential<T extends HasLengthType> extends AbstractValueDifferential<T> {
    evaluate(alpha: T, beta: T): number;
}
export declare class StandardPipeline<T, P> extends AbstractPipeline<T> {
    protected predictor: AbstractPredictor<T, P>;
    protected qualityAssessor: AbstractQualityAssessor<T>;
    protected priorCallback: () => P;
    constructor(predictor: AbstractPredictor<T, P>, qualityAssessor: AbstractQualityAssessor<T>, priorCallback: () => P);
    predict(input: T, limit: number, offset?: number, qualityType?: QualityType): WeightedPrediction<T>[];
}
