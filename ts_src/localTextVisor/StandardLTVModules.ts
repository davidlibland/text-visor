/**
 * @file StandardLTVModules.ts
 * @desc Some relatively standard LTV modules.
 */

import AbstractPipeline from "./abstract/AbstractPipeline";
import AbstractPredictor from "./abstract/AbstractPredictor";
import {WeightedPrediction} from "./abstract/AbstractPredictor";
import AbstractQualityAssessor from "./abstract/AbstractQualityAssessor";
import AbstractValueDifferential from "./abstract/AbstractValueDifferential";
import {
    QUALITY_MODULE_TYPE,
    QualityModuleType,
} from "./Enums";

/**
 * @class RankedQualityAssessor
 * @extends AbstractQualityAssessor
 * @desc This ranks predictions from highest to lowest based on a value differential (passed
 * into the constructor), and returns the highest quality predictions.
 * @typeparam S the type of the input on which the predictions are based. Defaults to string.
 * @typeparam T the type of the predictions, defaults to string.
 * @typeparam E a type extending WeightedPrediction<T>. The predictions consist of an array of type E.
 */
export class RankedQualityAssessor<S, T, E extends WeightedPrediction<T>> extends AbstractQualityAssessor<S, T, E> {

    /**
     * @constructor
     * @param {AbstractValueDifferential<T>} valueDifferential used to rank the predictions.
     */
    constructor(valueDifferential: AbstractValueDifferential<S, T>) {
        super(valueDifferential);
    }

    /**
     * @method assess
     * @desc uses the valueDifferential passed to the constructor to evaluate which
     * predictions would yield the highest value if they were correct, and combines that
     * with the likelihood of the predictions to suggest those predictions with the highest
     * expected value.
     * @param {S} input
     * @param {E[]} predictions
     * @param {number} limit a cap on the number of predictions to return.
     * @param {number} offset the number of highest reward predictions to skip, useful for paginating the results.
     * @param {QualityModuleType} qualityType specifies which form of reward the predictions are evaluated against.
     * @returns {Array<WeightedPrediction<T> & E>} a ranked array of predictions which are
     * expected to yield the most value, ranked from highest to lowest.
     */
    public assess(
        input: S,
        predictions: E[],
        limit: number,
        offset: number = 0,
        qualityType: QualityModuleType = QUALITY_MODULE_TYPE.EXPECTED_REWARD,
    ): E[] {
        let qualityPredictions: E[];
        switch (qualityType) {
            case QUALITY_MODULE_TYPE.EXPECTED_REWARD:
                // We assume the weights of the WeightedPredictions comprise a set of dirichlet parameters,
                // so to compute the expected value, we normalize them to a probability.
                const normalizer = predictions.reduce(
                    (partialSum, wPred) => (partialSum + wPred.weight),
                    0,
                );
                if (normalizer === 0) {
                    qualityPredictions = [];
                    break;
                }
                const invNormalizer = 1 / normalizer;
                const expectedRewardComputation = (wPred: E) => {
                    const reward = this.valueDifferential.evaluate(input, wPred.prediction);
                    const expectedReward = wPred.weight * invNormalizer * reward;
                    return Object.assign({}, wPred, { weight: expectedReward });
                };
                qualityPredictions = predictions
                    .map(expectedRewardComputation)
                    .filter((wPred) => (wPred.weight > 0));
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

export interface HasLengthType {
    length: number;
}

/**
 * @class FlatDifferential
 * @extends AbstractValueDifferential
 * @desc assigns all predictions an equal value of 1.
 * @typeparam S the type of the input. Defaults to string.
 * @typeparam T the type of the prediction. Defaults to string.
 */
export class FlatDifferential<S, T> extends AbstractValueDifferential<S, T> {
    /**
     * @method evaluate
     * @desc Returns a flat value of 1 for any prediction and input
     * @param {S} input
     * @param {T} prediction
     * @returns {number} The constant value of 1.
     */
    public evaluate(input: S, prediction: T): number {
        return 1;
    }
}

/**
 * @class FlatDifferential
 * @extends AbstractValueDifferential
 * @desc The value assigned to a prediction is exactly the difference between it's
 * length and the length of the input. Thus longer completions are more highly valued
 * than shorter ones.
 * @typeparam S the type of the input. Defaults to string.
 * @typeparam T the type of the prediction. Defaults to string.
 */
export class LengthValueDifferential<S, T extends HasLengthType> extends AbstractValueDifferential<S, T> {
    protected inputConverter: (input: S) => T;

    /**
     * @constructor
     * @param {(input: S) => T} inputConverter converts the input (of type S) to the type T
     * (which has a length) in order to compare their lengths.
     */
    constructor(inputConverter: (input: S) => T) {
        super();
        this.inputConverter = inputConverter;
    }
    /**
     * @method evaluate
     * @desc The value assigned to a prediction is exactly the difference between it's
     * length and the length of the input. Thus longer completions are more highly valued
     * than shorter ones.
     * @param {S} input
     * @param {T} prediction
     * @returns {number} The absolute difference in lengths between the input and the prediction.
     */
    public evaluate(input: S, prediction: T): number {
        return Math.abs(prediction.length - this.inputConverter(input).length);
    }
}

/**
 * @class FlatDifferential
 * @extends AbstractValueDifferential
 * @desc The value assigned to a prediction is exactly the difference between it's
 * length and the length of the input. Thus longer completions are more highly valued
 * than shorter ones.
 * @typeparam S the type of the input. Defaults to string.
 * @typeparam T the type of the prediction. Defaults to string.
 */
export class ProbOfNotRejectingSymbolsGainedDifferential<S, T extends HasLengthType> extends AbstractValueDifferential<S, T> {
    protected rejectionProb: number;
    protected inputConverter: (input: S) => T;

    /**
     * @constructor
     * @param {(input: S) => T} inputConverter converts the input (of type S) to the type T
     * (which has a length) in order to compare their lengths.
     * @param {number} rejectionLogit The logit of rejecting a symbol gained,
     * i.e. log(p/(1-p)) where p is the rejection probability for a symbol
     * gained.
     */
    constructor(inputConverter: (input: S) => T, rejectionLogit: number) {
        super();
        this.inputConverter = inputConverter;
        this.rejectionProb = 1 / (1 + Math.exp(-rejectionLogit));
    }

    public evaluate(input: S, prediction: T): number {
        return 1 - Math.pow(this.rejectionProb, Math.abs(prediction.length - this.inputConverter(input).length));
    }
}

export class StandardPipeline<S, T, P, E extends WeightedPrediction<T>> extends AbstractPipeline<S, T, E> {
    protected predictor: AbstractPredictor<S, T, P, E>;
    protected qualityAssessor: AbstractQualityAssessor<S, T, E>;
    protected priorCallback: () => P;

    /**
     * @constructor
     * @param {AbstractPredictor<S, T, P>} predictor
     * @param {AbstractQualityAssessor<S, T, E extends WeightedPrediction<T>>} qualityAssessor
     * @param {() => P} priorCallback
     */
    constructor(
        predictor: AbstractPredictor<S, T, P, E>,
        qualityAssessor: AbstractQualityAssessor<S, T, E>,
        priorCallback: () => P) {
        super(predictor, qualityAssessor);
        this.priorCallback = priorCallback;
    }

    public predict(
        input: S,
        limit: number,
        offset: number = 0,
        qualityType: QualityModuleType = QUALITY_MODULE_TYPE.EXPECTED_REWARD,
    ): Promise<E[]> {
        return this.predictor.predict(this.priorCallback(), input)
                .then((predictions) => this.qualityAssessor.assess(input, predictions, limit, offset, qualityType));
    }
}
