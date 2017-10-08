/**
 * @file Context.ts
 * @desc The context module used to set up a local text visor.
 */
import { AbstractPipeline } from "./Abstract";
import { CaseSensitivityType, LanguageModuleType, RewardModuleType, TokenizerType } from "./Enums";
import { Tree } from "./plaintext/Tree";
export interface LanguageModuleSpecs {
    moduleType: LanguageModuleType;
    maxEditDistance?: number;
    caseSensitivity?: CaseSensitivityType;
    tokenizerType: TokenizerType;
}
export interface RewardModuleSpecsConstraints {
    moduleType: RewardModuleType;
}
export interface RewardModuleSpecsSLD extends RewardModuleSpecsConstraints {
    moduleType: "SLD";
}
export interface RewardModuleSpecsPSG extends RewardModuleSpecsConstraints {
    moduleType: "PSG";
    rejectionLogit: number;
}
export declare type RewardModuleSpecs = RewardModuleSpecsSLD | RewardModuleSpecsPSG;
export interface ContextDataType {
    trie: Tree<any, {
        prediction: any;
    }>;
    prior: {
        [key: string]: number;
    };
}
export declare function initializeLTVWithContext(languageSpecs: LanguageModuleSpecs, rewardSpecs: RewardModuleSpecs, data: ContextDataType): AbstractPipeline<any, any, any>;
