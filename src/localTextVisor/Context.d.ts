/**
 * @file Context.ts
 * @desc The context module used to set up a local text visor.
 */
import { AbstractPipeline } from "./Abstract";
import { HasLengthType } from "./StandardLTVModules";
import { LanguageAlgorithmType, CaseSensitivityType, RewardType, TokenizerType } from "./Enums";
export interface LanguageModuleSpecs {
    moduleType: LanguageAlgorithmType;
    maxEditDistance?: number;
    caseSensitivity?: CaseSensitivityType;
    tokenizerType: TokenizerType;
}
export interface RewardModuleSpecs {
    moduleType: RewardType;
}
export declare function initializeLTVWithContext<T extends HasLengthType>(languageSpecs: LanguageModuleSpecs, rewardSpecs: RewardModuleSpecs): AbstractPipeline<T>;
