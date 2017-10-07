/**
 * @file Abstract.ts
 * @desc Abstractions and standard types for the local text visor modules.
 */
import { QualityModuleType } from "./Enums";
/**
 * @type MapPrior
 * @desc The default type for a priors: a map from token, value pairs to
 * relative probabilities (i.e. dirichlet parameters).
 */
export declare type MapPrior<T = string> = ((token: T) => number);
export interface WeightedPrediction<T = string> {
    weight: number;
    prediction: T;
}
export declare abstract class AbstractPredictor<S = string, T = string, P = MapPrior<T>, E extends object = object> {
    abstract predict(prior: P, input: S): Array<WeightedPrediction<T> & E>;
}
export declare abstract class AbstractValueDifferential<T = string> {
    abstract evaluate(alpha: T, beta: T): number;
}
export declare abstract class AbstractQualityAssessor<S = string, T = string, E = object> {
    protected valueDifferential: AbstractValueDifferential<T>;
    constructor(valueDifferential: AbstractValueDifferential<T>);
    abstract assess(input: S, predictions: Array<(WeightedPrediction<T> & E)>, limit: number, offset: number, qualityType: QualityModuleType): Array<WeightedPrediction<T> & E>;
}
export declare abstract class AbstractPipeline<S, T, E extends object> {
    protected predictor: AbstractPredictor<S, T, any, E>;
    protected qualityAssessor: AbstractQualityAssessor<S, T>;
    constructor(predictor: AbstractPredictor<S, T, any, E>, qualityAssessor: AbstractQualityAssessor<S, T>);
    abstract predict(input: S, limit: number, offset: number, qualityType: QualityModuleType): Array<WeightedPrediction<T> & E>;
}
