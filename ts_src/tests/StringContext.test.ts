/**
 * @file Context.test.ts
 * @desc Some basic tests for the context module.
 */

import "ts-jest";
import {
    initializeLTVWithContext,
    RewardModuleSpecs,
} from "../localTextVisor/Contexts/StringContext";
import { LANGUAGE_MODULE_TYPE, QUALITY_MODULE_TYPE, REWARD_MODULE_TYPE, TOKENIZER_TYPE } from "../localTextVisor/Enums";
import { default as Tree, sortedInsert } from "../localTextVisor/plaintext/Tree";

test("Initialize LTV with Identity Predictor and test confidence quality.", () => {
    const idPipeline = initializeLTVWithContext(
        {
            moduleType: LANGUAGE_MODULE_TYPE.IDENTITY,
            tokenizerType: TOKENIZER_TYPE.CHARACTER,
        },
        {moduleType: REWARD_MODULE_TYPE.LENGTH_DIFFERENCE},
        {trie: {node: "", children: [], data: []}, prior: {}},
    );

    const input = {
        cursorPosition: 0,
        input: "abracadabra",
    };
    const resultsP = idPipeline.predict(input, 5, 0, QUALITY_MODULE_TYPE.CONFIDENCE);
    expect.assertions(1);
    return expect(resultsP.then((results) => results.map((wPred) => wPred.prediction)))
        .resolves.toEqual(["abracadabra"]);
});

test("Initialize LTV with Identity Predictor and test expected reward quality.", () => {
    const idPipeline = initializeLTVWithContext(
        {
            moduleType: LANGUAGE_MODULE_TYPE.IDENTITY,
            tokenizerType: TOKENIZER_TYPE.CHARACTER,
        },
        {moduleType: REWARD_MODULE_TYPE.LENGTH_DIFFERENCE},
        {trie: {node: "", children: [], data: []}, prior: {}},
    );

    const input = {
        cursorPosition: 0,
        input: "abracadabra",
    };
    const resultsP = idPipeline.predict(input, 5, 0, QUALITY_MODULE_TYPE.EXPECTED_REWARD);
    expect.assertions(1);
    return expect(resultsP.then((results) => results.map((wPred) => wPred.prediction)))
        .resolves.toEqual([]);
});

interface TokenData {
    prediction: string;
}

const testTree: Tree<string, TokenData> = { node: "root", children: [], data: [] };
sortedInsert(testTree, "heart attack".split(""), { prediction: "heart attack" });
sortedInsert(testTree, "health risk".split(""), { prediction: "health risk" });
sortedInsert(testTree, "hepatitis".split(""), { prediction: "hepatitis" });
sortedInsert(testTree, "jaundice".split(""), { prediction: "jaundice" });
sortedInsert(testTree, "heal".split(""), { prediction: "heal" });
sortedInsert(testTree, "heat".split(""), { prediction: "heat" });
const prior = {
    "heal": 2,
    "health risk": 1,
    "heart attack": 2,
    "heat": 0,
    "hepatitis": 3,
    "jaundice": 25,
};

test("Initialize LTV with Fuzzy Tree Search Predictor and string length difference reward", () => {
    const languageSpecs = {
        maxEditDistance: 1,
        moduleType: LANGUAGE_MODULE_TYPE.FUZZY_TRIE_SEARCH,
        tokenizerType: TOKENIZER_TYPE.WORD,
    };
    const rewardSpecs: RewardModuleSpecs = {
        moduleType: REWARD_MODULE_TYPE.LENGTH_DIFFERENCE,
    };
    const triePipeline = initializeLTVWithContext(languageSpecs, rewardSpecs, { trie: testTree, prior });
    const input = { input: "who should we hea", cursorPosition: 15 };
    const resultsP = triePipeline.predict(input, 5, 0, QUALITY_MODULE_TYPE.EXPECTED_REWARD);
    expect.assertions(1);
    return expect(resultsP.then((results) => results.map((wPred) => wPred.prediction)))
        .resolves.toEqual([
            "who should we heart attack",
            "who should we health risk",
            "who should we hepatitis",
            "who should we heal",
    ]);
});

test("Initialize LTV with Fuzzy Tree Search Predictor and prob-not-reject reward", () => {
    const languageSpecs = {
        maxEditDistance: 1,
        moduleType: LANGUAGE_MODULE_TYPE.FUZZY_TRIE_SEARCH,
        tokenizerType: TOKENIZER_TYPE.WORD,
    };
    const rewardSpecs: RewardModuleSpecs = {
        moduleType: REWARD_MODULE_TYPE.PROB_OF_NOT_REJECTING_SYMBOLS_GAINED,
        rejectionLogit: 0,
    };
    const triePipeline = initializeLTVWithContext(languageSpecs, rewardSpecs, { trie: testTree, prior });
    const input = { input: "who should we hea", cursorPosition: 15 };
    const resultsP = triePipeline.predict(input, 5, 0, QUALITY_MODULE_TYPE.EXPECTED_REWARD);
    expect.assertions(1);
    return expect(resultsP.then((results) => results.map((wPred) => wPred.prediction)))
        .resolves.toEqual([
            "who should we heart attack",
            "who should we hepatitis",
            "who should we heal",
            "who should we health risk",
    ]);
});

test("Predictions are returned even when there is no word to complete.", () => {
    const languageSpecs = {
        maxEditDistance: 1,
        moduleType: LANGUAGE_MODULE_TYPE.FUZZY_TRIE_SEARCH,
        tokenizerType: TOKENIZER_TYPE.WORD,
    };
    const rewardSpecs: RewardModuleSpecs = {
        moduleType: REWARD_MODULE_TYPE.PROB_OF_NOT_REJECTING_SYMBOLS_GAINED,
        rejectionLogit: 0,
    };
    const triePipeline = initializeLTVWithContext(languageSpecs, rewardSpecs, { trie: testTree, prior });
    const input = { input: "who should we ", cursorPosition: 14 };
    const resultsP = triePipeline.predict(input, 5, 0, QUALITY_MODULE_TYPE.EXPECTED_REWARD);
    expect.assertions(1);
    return expect(resultsP.then((results) => results.map((wPred) => wPred.prediction)))
        .resolves.toEqual([
            "who should we jaundice",
            "who should we hepatitis",
            "who should we heart attack",
            "who should we heal",
            "who should we health risk",
    ]);
});
