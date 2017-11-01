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
export interface LanguageModuleSpecsFTSCore extends LanguageModuleSpecsConstraints {
    caseSensitivity?: CaseSensitivityType;
    tokenizerType: TokenizerType;
    cacheCutoff?: number;
    cacheSize?: number;
    cancellable?: boolean;
}
export interface LanguageModuleSpecsFTS extends LanguageModuleSpecsFTSCore {
    moduleType: "FTS";
    maxEditDistance: number;
    flatCostUnit?: number;
}
export interface LanguageModuleSpecsRFTS extends LanguageModuleSpecsFTSCore {
    moduleType: "RFTS";
    maxRelativeEditDistance: number;
    flatCostUnit?: number;
}
export interface LanguageModuleSpecsDBFTS extends LanguageModuleSpecsFTSCore {
    moduleType: "DBFTS";
    maxRelativeEditDistance: number;
    symbolPairCosts?: Array<PairCostElement<any>>;
    symbolCosts?: Array<CostElement<any>>;
    defaultCost?: number;
    baseInsertCost?: number;
    baseDeleteCost?: number;
    symbolPairCostScaleFactor?: number;
    symbolCostScaleFactor?: number;
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
