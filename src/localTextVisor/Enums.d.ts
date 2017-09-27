/**
 * @file Enums.ts
 * @desc Encapuslates the enums used by the LTV.
 */
export declare type UnionKeyToValue<U extends string> = {
    [K in U]: K;
};
export declare type ScoreTypes = "QUALITY" | "CONFIDENCE";
export declare const SCORE_TYPE: UnionKeyToValue<ScoreTypes>;
export declare type QualityType = "EXPECTED_REWARD" | "CONFIDENCE";
export declare const QUALITY_TYPE: UnionKeyToValue<QualityType>;
export declare type TokenizerType = "CHARACTER" | "WORD" | "SPLIT_PUNCTUATION";
export declare const TOKENIZER_TYPE: UnionKeyToValue<TokenizerType>;
export declare type RewardType = "LENGTH_DIFFERENCE" | "EDIT_DISTANCE";
export declare const REWARD_TYPE: UnionKeyToValue<RewardType>;
export declare type LanguageAlgorithmType = "TRIE_SEARCH" | "IDENTITY";
export declare const LANGUAGE_ALGORITHM_TYPE: UnionKeyToValue<LanguageAlgorithmType>;
export declare type CaseSensitivityType = "INSENSITIVE_MATCH";
export declare const CASE_SENSITIVITY_TYPE: UnionKeyToValue<CaseSensitivityType>;
