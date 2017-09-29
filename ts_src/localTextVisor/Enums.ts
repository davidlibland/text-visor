/**
 * @file Enums.ts
 * @desc Encapuslates the enums used by the LTV.
 */

export type UnionKeyToValue<U extends string> = {
    [K in U]: K
};

export type EnumTypeValue<U extends string> = {
    [key: string]: U
}

// These are some basic score types.
export type ScoreType =
    "QUALITY" |
    "CONFIDENCE";

export const SCORE_TYPE: UnionKeyToValue<ScoreType> = {
    QUALITY: "QUALITY",
    CONFIDENCE: "CONFIDENCE",
};

// These are quality module enums.
export type QualityModuleType =
    "ER" |
    "C";

export const QUALITY_MODULE_TYPE: EnumTypeValue<QualityModuleType> = {
    EXPECTED_REWARD: "ER",
    CONFIDENCE: "C",
};

// These are tokenizer module enums.
export type TokenizerType =
    "CH" |
    "WS" |
    "DWT" |
    "S";

export const TOKENIZER_TYPE: EnumTypeValue<TokenizerType> = {
    CHARACTER: "CH",
    WHITE_SPACE: "WS",
    DEFAULT_WORD_TOKENIZER: "DWT",
    SENTENCE: "S",
};

// These are reward module enums.
export type RewardModuleType =
    "SLD" |
    "ED";

export const REWARD_MODULE_TYPE: EnumTypeValue<RewardModuleType> = {
    LENGTH_DIFFERENCE: "SLD",
    EDIT_DISTANCE: "ED",
};

// These are language module enums.
export type LanguageModuleType =
    "FTS" |
    "ID";

export const LANGUAGE_MODULE_TYPE: EnumTypeValue<LanguageModuleType> = {
    FUZZY_TRIE_SEARCH: "FTS",
    IDENTITY: "ID",
};

export type CaseSensitivityType =
    "I" |
    "S";

export const CASE_SENSITIVITY_TYPE: EnumTypeValue<CaseSensitivityType> = {
    INSENSITIVE_MATCH: "I",
    SENSITIVE_MATCH: "S",
};