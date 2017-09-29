/**
 * @file Context.ts
 * @desc The context module used to set up a local text visor.
 */
import { AbstractPipeline } from "./Abstract";
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
export declare function initializeLTVWithContext(languageSpecs: LanguageModuleSpecs, rewardSpecs: RewardModuleSpecs, data: Object): AbstractPipeline<any, any, any>;
