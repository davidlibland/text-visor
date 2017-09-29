/**
 * @file Context.ts
 * @desc The context module used to set up a local text visor.
 */
import { AbstractPipeline } from "./Abstract";
import { LanguageModuleType, CaseSensitivityType, RewardModuleType, TokenizerType } from "./Enums";
import { Tree } from "./plaintext/Tree";
export interface LanguageModuleSpecs {
    moduleType: LanguageModuleType;
    maxEditDistance?: number;
    caseSensitivity?: CaseSensitivityType;
    tokenizerType: TokenizerType;
}
export interface RewardModuleSpecs {
    moduleType: RewardModuleType;
}
export declare type ContextDataType = {
    trie: Tree<any, {
        prediction: any;
    }>;
    prior: {
        [key: string]: number;
    };
};
export declare function initializeLTVWithContext(languageSpecs: LanguageModuleSpecs, rewardSpecs: RewardModuleSpecs, data: ContextDataType): AbstractPipeline<any, any, any>;
