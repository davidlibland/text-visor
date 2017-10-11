/**
 * @file Context.ts
 * @desc The context module used to set up a local text visor.
 */
import { AbstractPipeline } from "../Abstract";
import { CaseSensitivityType, LanguageModuleType, RewardModuleType, TokenizerType } from "../Enums";
import { CostElement, PairCostElement } from "../plaintext/DetailedBalancedCost";
import { Tree } from "../plaintext/Tree";
export interface LanguageModuleSpecsConstraints {
    moduleType: LanguageModuleType;
}
export interface LanguageModuleSpecsID extends LanguageModuleSpecsConstraints {
    moduleType: "ID";
    tokenizerType: TokenizerType;
}
export interface LanguageModuleSpecsFTS extends LanguageModuleSpecsConstraints {
    moduleType: "FTS";
    maxEditDistance: number;
    caseSensitivity?: CaseSensitivityType;
    tokenizerType: TokenizerType;
    flatCostUnit?: number;
}
export interface LanguageModuleSpecsRFTS extends LanguageModuleSpecsConstraints {
    moduleType: "RFTS";
    maxRelativeEditDistance: number;
    caseSensitivity?: CaseSensitivityType;
    tokenizerType: TokenizerType;
    flatCostUnit?: number;
}
export interface LanguageModuleSpecsDBFTS extends LanguageModuleSpecsConstraints {
    moduleType: "DBFTS";
    maxRelativeEditDistance: number;
    caseSensitivity?: CaseSensitivityType;
    tokenizerType: TokenizerType;
    symbolPairCosts?: Array<PairCostElement<any>>;
    symbolCosts?: Array<CostElement<any>>;
    defaultCost?: number;
    swapScaleUnit?: number;
    insertScaleUnit?: number;
    deleteScaleUnit?: number;
}
export declare type LanguageModuleSpecs = LanguageModuleSpecsID | LanguageModuleSpecsFTS | LanguageModuleSpecsRFTS | LanguageModuleSpecsDBFTS | {
    moduleType: LanguageModuleType;
    tokenizerType: TokenizerType;
};
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
export declare type RewardModuleSpecs = RewardModuleSpecsSLD | RewardModuleSpecsPSG | {
    moduleType: RewardModuleType;
};
export interface ContextDataType {
    trie: Tree<any, {
        prediction: any;
    }>;
    prior: {
        [key: string]: number;
    };
}
export declare function initializeLTVWithContext(languageSpecs: LanguageModuleSpecs, rewardSpecs: RewardModuleSpecs, data: ContextDataType): AbstractPipeline<any, any, any>;
