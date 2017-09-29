/**
 * @file Abstract.ts
 * @desc Abstractions and standard types for the local text visor modules.
 */

import {
    QualityType
} from "./Enums";

/**
 * @type MapPrior
 * @desc The default type for a priors: a map from token, value pairs to
 * relative probabilities (i.e. dirichlet parameters).
 */
export type MapPrior<T = string> = ((token: T) => number);

export interface WeightedPrediction<T = string> {
    weight: number;
    prediction: T;
}

export abstract class AbstractPredictor<T = string, P = MapPrior<T>, E extends Object = Object> {
    abstract predict(prior: P, input: T): (WeightedPrediction<T> & E)[];
}

export abstract class AbstractValueDifferential<T = string> {
    abstract evaluate(alpha: T, beta: T): number;
}

export abstract class AbstractQualityAssessor<T = string> {
    protected valueDifferential: AbstractValueDifferential<T>;

    constructor(valueDifferential: AbstractValueDifferential<T>) {
        this.valueDifferential = valueDifferential;
    }

    //ToDo: Should incorporate display name.
    abstract assess(input: T, predictions: WeightedPrediction<T>[], limit: number, offset: number, qualityType: QualityType): WeightedPrediction<T>[];
}

export abstract class AbstractPipeline<T> {
    protected predictor: AbstractPredictor<T, any>;
    protected qualityAssessor: AbstractQualityAssessor<T>;
    constructor(predictor: AbstractPredictor<T, any>, qualityAssessor: AbstractQualityAssessor<T>) {
        this.predictor = predictor;
        this.qualityAssessor = qualityAssessor;
    }

    abstract predict(input: T, limit: number, offset: number, qualityType: QualityType): WeightedPrediction<T>[];
}