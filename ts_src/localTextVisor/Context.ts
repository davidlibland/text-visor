/**
 * @file Context.ts
 * @desc The context module used to set up a local text visor.
 */

import {
    AbstractPipeline,
    AbstractPredictor,
    AbstractQualityAssessor,
    AbstractValueDifferential,
    WeightedPrediction,
} from "./Abstract";
import {
    IdentityPredictor
} from "./LanguageStub";
import {
    StandardPipeline,
    RankedQualityAssessor,
    LengthValueDifferential,
    HasLengthType
} from "./StandardLTVModules";
import {
    LanguageAlgorithmType,
    LANGUAGE_ALGORITHM_TYPE,
    CaseSensitivityType,
    RewardType,
    REWARD_TYPE,
    TokenizerType
} from "./Enums";

export interface LanguageModuleSpecs {
    moduleType: LanguageAlgorithmType;
    maxEditDistance?: number;
    caseSensitivity?: CaseSensitivityType;
    tokenizerType: TokenizerType;
}

export interface RewardModuleSpecs {
    moduleType: RewardType;
}

// ToDo: sort out how to handle generic types T with no length.
export function initializeLTVWithContext<T extends HasLengthType>(languageSpecs: LanguageModuleSpecs, rewardSpecs: RewardModuleSpecs): AbstractPipeline<T> {
    let languageModule: AbstractPredictor<T>;
    let rewardModule: AbstractValueDifferential<T>;
    switch (languageSpecs.moduleType) {
        case LANGUAGE_ALGORITHM_TYPE.IDENTITY:
            languageModule = new IdentityPredictor<T>();
            break;
        default:
            throw `The language algorithm ${languageSpecs.moduleType} has not been implemented.`;
    }
    switch (rewardSpecs.moduleType) {
        case REWARD_TYPE.LENGTH_DIFFERENCE:
            rewardModule = new LengthValueDifferential<T>();
            break;
        default:
            throw `The reward algorithm ${rewardSpecs.moduleType} has not been implemented.`;
    }
    const qualityAssessor = new RankedQualityAssessor<T>(rewardModule);
    // ToDo: construct a reasonable prior.
    const prior = () => { };
    return new StandardPipeline<T, any>(languageModule, qualityAssessor, prior);
}