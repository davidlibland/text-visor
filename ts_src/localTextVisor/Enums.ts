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
    CONFIDENCE: "CONFIDENCE",
    QUALITY: "QUALITY",
};

// These are quality module enums.
export type QualityModuleType =
    "ER" |
    "C";

export const QUALITY_MODULE_TYPE: EnumTypeValue<QualityModuleType> = {
    CONFIDENCE: "C",
    EXPECTED_REWARD: "ER",
};

// These are tokenizer module enums.
export type TokenizerType =
    "CH" |
    "WS" |
    "DWT" |
    "S";

export const TOKENIZER_TYPE: EnumTypeValue<TokenizerType> = {
    CHARACTER: "CH",
    DEFAULT_WORD_TOKENIZER: "DWT",
    SENTENCE: "S",
    WHITE_SPACE: "WS",
};

// These are reward module enums.
export type RewardModuleType =
    "C" |
    "SLD" |
    "ED" |
    "PSG";

export const REWARD_MODULE_TYPE: EnumTypeValue<RewardModuleType> = {
    CONSTANT: "C",
    EDIT_DISTANCE: "ED",
    LENGTH_DIFFERENCE: "SLD",
    PROB_OF_NOT_REJECTING_SYMBOLS_GAINED: "PSG",
};

// These are language module enums.
export type LanguageModuleType =
    "FTS" |
    "RFTS" |
    "ID";

export const LANGUAGE_MODULE_TYPE: EnumTypeValue<LanguageModuleType> = {
    FUZZY_TRIE_SEARCH: "FTS",
    IDENTITY: "ID",
    RELATIVELY_FUZZY_TRIE_SEARCH: "RFTS",
};

export type CaseSensitivityType =
    "I" |
    "S";

export const CASE_SENSITIVITY_TYPE: EnumTypeValue<CaseSensitivityType> = {
    INSENSITIVE_MATCH: "I",
    SENSITIVE_MATCH: "S",
};