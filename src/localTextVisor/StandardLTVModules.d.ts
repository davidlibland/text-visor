/**
 * @file StandardLTVModules.ts
 * @desc Some relatively standard LTV modules.
 */
import { AbstractPipeline, AbstractPredictor, AbstractQualityAssessor, AbstractValueDifferential, WeightedPrediction } from "./Abstract";
import { QualityModuleType } from "./Enums";
export declare class RankedQualityAssessor<S, T, E extends object> extends AbstractQualityAssessor<S, T, E> {
    private inputConverter;
    constructor(valueDifferential: AbstractValueDifferential<T>, inputConverter: (input: S) => T);
    assess(input: S, predictions: Array<(WeightedPrediction<T> & E)>, limit: number, offset?: number, qualityType?: QualityModuleType): Array<(WeightedPrediction<T> & E)>;
}
export interface HasLengthType {
    length: number;
}
export declare class FlatDifferential<T> extends AbstractValueDifferential<T> {
    evaluate(alpha: T, beta: T): number;
}
export declare class LengthValueDifferential<T extends HasLengthType> extends AbstractValueDifferential<T> {
    evaluate(alpha: T, beta: T): number;
}
export declare class ProbOfNotRejectingSymbolsGainedDifferential<T extends HasLengthType> extends AbstractValueDifferential<T> {
    protected rejectionProb: number;
    /**
     * @constructor
     * @param {number} rejectionLogit The logit of rejecting a symbol gained,
     * i.e. log(p/(1-p)) where p is the rejection probability for a symbol
     * gained.
     */
    constructor(rejectionLogit: number);
    evaluate(alpha: T, beta: T): number;
}
export declare class StandardPipeline<S, T, P, E extends object> extends AbstractPipeline<S, T, any> {
    protected predictor: AbstractPredictor<S, T, P, E>;
    protected qualityAssessor: AbstractQualityAssessor<S, T, E>;
    protected priorCallback: () => P;
    /**
     * @constructor
     * @param {AbstractPredictor<S, T, P>} predictor
     * @param {AbstractQualityAssessor<S, T, E extends Object>} qualityAssessor
     * @param {() => P} priorCallback
     */
    constructor(predictor: AbstractPredictor<S, T, P>, qualityAssessor: AbstractQualityAssessor<S, T, E>, priorCallback: () => P);
    predict(input: S, limit: number, offset?: number, qualityType?: QualityModuleType): Promise<Array<(WeightedPrediction<T> & E)>>;
}
