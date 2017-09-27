/**
 * @file Abstract.ts
 * @desc Abstractions and standard types for the local text visor modules.
 */

/**
 * @type MapPrior
 * @desc The default type for a priors: a map from token, value pairs to
 * relative probabilities.
 */
export type MapPrior<T = string> = ((token: T) => number);

export interface WeightedPrediction<T = string> {
    weight: number;
    prediction: T;
}

export abstract class AbstractPredictor<T = string, P = MapPrior<T>> {
    abstract predict(prior: P, input: T): WeightedPrediction<T>[];
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
    abstract assess(input: T, predictions: WeightedPrediction<T>[], limit: number, offset: number): WeightedPrediction<T>[];
}