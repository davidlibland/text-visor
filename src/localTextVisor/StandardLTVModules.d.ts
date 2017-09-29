/**
 * @file StandardLTVModules.ts
 * @desc Some relatively standard LTV modules.
 */
import { AbstractPipeline, AbstractPredictor, AbstractQualityAssessor, AbstractValueDifferential, WeightedPrediction } from "./Abstract";
import { QualityType } from "./Enums";
export declare class RankedQualityAssessor<S, T> extends AbstractQualityAssessor<S, T> {
    private inputConverter;
    constructor(valueDifferential: AbstractValueDifferential<T>, inputConverter: (S) => T);
    assess(input: S, predictions: WeightedPrediction<T>[], limit: number, offset?: number, qualityType?: QualityType): WeightedPrediction<T>[];
}
export declare type HasLengthType = {
    length: number;
};
export declare class LengthValueDifferential<T extends HasLengthType> extends AbstractValueDifferential<T> {
    evaluate(alpha: T, beta: T): number;
}
export declare class StandardPipeline<S, T, P> extends AbstractPipeline<S, T, any> {
    protected predictor: AbstractPredictor<S, T, P>;
    protected qualityAssessor: AbstractQualityAssessor<S, T>;
    protected priorCallback: () => P;
    constructor(predictor: AbstractPredictor<S, T, P>, qualityAssessor: AbstractQualityAssessor<S, T>, priorCallback: () => P);
    predict(input: S, limit: number, offset?: number, qualityType?: QualityType): WeightedPrediction<T>[];
}
