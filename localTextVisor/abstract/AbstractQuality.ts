/**
 * @file AbstractQuality.ts
 * @desc Abstractions for the Quality module for the local text visor, this
 * combines rewards and confidences to rank the tokens with the highest expected
 * reward.
 */

import AbstractValueDifferential from "./AbstractReward";
import WeigtedPredictions from "./AbstractLanguage";

export abstract class AbstractQualityAssessor<T = string> {
    constructor(private valueDifferential: AbstractValueDifferential) {

    }

    //ToDo: Should incorporate display name.
    abstract assess(predictions: WeigtedPredictions<T>[], limit: number, offset: number = 0): WeigtedPredictions<T>[];
}