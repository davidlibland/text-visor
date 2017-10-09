/**
 * @file Enums.ts
 * @desc Encapuslates the enums used by the LTV.
 */
export declare type UnionKeyToValue<U extends string> = {
    [K in U]: K;
};
export declare type EnumTypeValue<U extends string> = {
    [key: string]: U;
};
export declare type ScoreType = "QUALITY" | "CONFIDENCE";
export declare const SCORE_TYPE: UnionKeyToValue<ScoreType>;
export declare type QualityModuleType = "ER" | "C";
export declare const QUALITY_MODULE_TYPE: EnumTypeValue<QualityModuleType>;
export declare type TokenizerType = "CH" | "WS" | "DWT" | "S";
export declare const TOKENIZER_TYPE: EnumTypeValue<TokenizerType>;
export declare type RewardModuleType = "SLD" | "ED" | "PSG";
export declare const REWARD_MODULE_TYPE: EnumTypeValue<RewardModuleType>;
export declare type LanguageModuleType = "FTS" | "RFTS" | "ID";
export declare const LANGUAGE_MODULE_TYPE: EnumTypeValue<LanguageModuleType>;
export declare type CaseSensitivityType = "I" | "S";
export declare const CASE_SENSITIVITY_TYPE: EnumTypeValue<CaseSensitivityType>;
