"use strict";
/**
 * @file Enums.ts
 * @desc Encapuslates the enums used by the LTV.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCORE_TYPE = {
    CONFIDENCE: "CONFIDENCE",
    QUALITY: "QUALITY",
};
exports.QUALITY_MODULE_TYPE = {
    CONFIDENCE: "C",
    EXPECTED_REWARD: "ER",
};
exports.TOKENIZER_TYPE = {
    CHARACTER: "CH",
    DEFAULT_WORD_TOKENIZER: "DWT",
    SENTENCE: "S",
    WHITE_SPACE: "WS",
};
exports.REWARD_MODULE_TYPE = {
    EDIT_DISTANCE: "ED",
    LENGTH_DIFFERENCE: "SLD",
    PROB_OF_NOT_REJECTING_SYMBOLS_GAINED: "PSG",
};
exports.LANGUAGE_MODULE_TYPE = {
    FUZZY_TRIE_SEARCH: "FTS",
    IDENTITY: "ID",
    RELATIVELY_FUZZY_TRIE_SEARCH: "RFTS",
};
exports.CASE_SENSITIVITY_TYPE = {
    INSENSITIVE_MATCH: "I",
    SENSITIVE_MATCH: "S",
};
//# sourceMappingURL=Enums.js.map