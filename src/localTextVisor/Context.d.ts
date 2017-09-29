/**
 * @file Context.ts
 * @desc The context module used to set up a local text visor.
 */
import { AbstractPipeline } from "./Abstract";
import { LanguageModuleType, CaseSensitivityType, RewardModuleType, TokenizerType } from "./Enums";
export interface LanguageModuleSpecs {
    moduleType: LanguageModuleType;
    maxEditDistance?: number;
    caseSensitivity?: CaseSensitivityType;
    tokenizerType: TokenizerType;
}
export interface RewardModuleSpecs {
    moduleType: RewardModuleType;
}
export declare function initializeLTVWithContext(languageSpecs: LanguageModuleSpecs, rewardSpecs: RewardModuleSpecs, data: Object): AbstractPipeline<any, any, any>;
