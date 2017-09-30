/**
 * @file StandardLTVModules.ts
 * @desc Some relatively standard LTV modules.
 */
import { AbstractPipeline, AbstractPredictor, AbstractQualityAssessor, AbstractValueDifferential, WeightedPrediction } from "./Abstract";
import { QualityModuleType } from "./Enums";
export declare class RankedQualityAssessor<S, T, E extends Object> extends AbstractQualityAssessor<S, T, E> {
    private inputConverter;
    constructor(valueDifferential: AbstractValueDifferential<T>, inputConverter: (input: S) => T);
    assess(input: S, predictions: (WeightedPrediction<T> & E)[], limit: number, offset?: number, qualityType?: QualityModuleType): (WeightedPrediction<T> & E)[];
}
export declare type HasLengthType = {
    length: number;
};
export declare class LengthValueDifferential<T extends HasLengthType> extends AbstractValueDifferential<T> {
    evaluate(alpha: T, beta: T): number;
}
export declare class StandardPipeline<S, T, P, E extends Object> extends AbstractPipeline<S, T, any> {
    protected predictor: AbstractPredictor<S, T, P, E>;
    protected qualityAssessor: AbstractQualityAssessor<S, T, E>;
    protected priorCallback: () => P;
    constructor(predictor: AbstractPredictor<S, T, P>, qualityAssessor: AbstractQualityAssessor<S, T, E>, priorCallback: () => P);
    predict(input: S, limit: number, offset?: number, qualityType?: QualityModuleType): (WeightedPrediction<T> & E)[];
}
