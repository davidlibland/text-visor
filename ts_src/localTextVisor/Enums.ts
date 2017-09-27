/**
 * @file Enums.ts
 * @desc Encapuslates the enums used by the LTV.
 */

export type UnionKeyToValue<U extends string> = {
    [K in U]: K
};

// These are some basic score types.
export type ScoreTypes =
    "QUALITY" |
    "CONFIDENCE";

export const SCORE_TYPE: UnionKeyToValue<ScoreTypes> = {
    QUALITY: "QUALITY",
    CONFIDENCE: "CONFIDENCE",
};

// These are quality module enums.
export type QualityType =
    "EXPECTED_REWARD" |
    "CONFIDENCE";

export const QUALITY_TYPE: UnionKeyToValue<QualityType> = {
    EXPECTED_REWARD: "EXPECTED_REWARD",
    CONFIDENCE: "CONFIDENCE",
};

// These are tokenizer module enums.
export type TokenizerType =
    "CHARACTER" |
    "WORD" |
    "SPLIT_PUNCTUATION";

export const TOKENIZER_TYPE: UnionKeyToValue<TokenizerType> = {
    CHARACTER: "CHARACTER",
    WORD: "WORD",
    SPLIT_PUNCTUATION: "SPLIT_PUNCTUATION",
};

// These are reward module enums.
export type RewardType =
    "LENGTH_DIFFERENCE" |
    "EDIT_DISTANCE";

export const REWARD_TYPE: UnionKeyToValue<RewardType> = {
    LENGTH_DIFFERENCE: "LENGTH_DIFFERENCE",
    EDIT_DISTANCE: "EDIT_DISTANCE",
};

// These are language module enums.
export type LanguageAlgorithmType =
    "TRIE_SEARCH" |
    "IDENTITY";

export const LANGUAGE_ALGORITHM_TYPE: UnionKeyToValue<LanguageAlgorithmType> = {
    TRIE_SEARCH: "TRIE_SEARCH",
    IDENTITY: "IDENTITY",
};

export type CaseSensitivityType =
    "INSENSITIVE_MATCH";

export const CASE_SENSITIVITY_TYPE: UnionKeyToValue<CaseSensitivityType> = {
    INSENSITIVE_MATCH: "INSENSITIVE_MATCH",
};