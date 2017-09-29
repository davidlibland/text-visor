/**
 * @file Context.test.ts
 * @desc Some basic tests for the context module.
 */

import { initializeLTVWithContext } from "../localTextVisor/Context";
import { LANGUAGE_MODULE_TYPE, TOKENIZER_TYPE, REWARD_MODULE_TYPE, QUALITY_MODULE_TYPE } from "../localTextVisor/Enums";
import "ts-jest";
import { Tree, sortedInsert } from "../localTextVisor/plaintext/Tree";

test("Initialize LTV with Identity Predictor", () => {
    const idPipeline = initializeLTVWithContext({ moduleType: LANGUAGE_MODULE_TYPE.IDENTITY, tokenizerType: TOKENIZER_TYPE.CHARACTER }, { moduleType: REWARD_MODULE_TYPE.LENGTH_DIFFERENCE }, {trie:{node:"",children:[],data:[]}, prior:{}});

    const result = idPipeline.predict("abracadabra", 5, 0, QUALITY_MODULE_TYPE.EXPECTED_REWARD)
        .map(wPred => wPred.prediction);
    expect(result).toEqual(["abracadabra"]);
});

type tokenData = {
    prediction: string;
};

test("Initialize LTV with Fuzzy Tree Search Predictor", () => {
    const testTree: Tree<string, tokenData> = { node: "root", children: [], data: [] };
    sortedInsert(testTree, "heart attack".split(""), { prediction: "heart attack" });
    sortedInsert(testTree, "health risk".split(""), { prediction: "health risk" });
    sortedInsert(testTree, "hepatitis".split(""), { prediction: "hepatitis" });
    sortedInsert(testTree, "jaundice".split(""), { prediction: "jaundice" });
    sortedInsert(testTree, "heal".split(""), { prediction: "heal" });
    sortedInsert(testTree, "heat".split(""), { prediction: "heat" });
    const prior = {
        "heart attack": 2,
        "health risk": 1,
        "hepatitis": 3,
        "heal": 2,
        "heat": 0,
        "jaundice": 25
    };
    const languageSpecs = {
        moduleType: LANGUAGE_MODULE_TYPE.FUZZY_TRIE_SEARCH,
        maxEditDistance: 1,
        tokenizerType: TOKENIZER_TYPE.WORD
    };
    const rewardSpecs = {
        moduleType: REWARD_MODULE_TYPE.LENGTH_DIFFERENCE
    };
    const triePipeline = initializeLTVWithContext(languageSpecs, rewardSpecs, { trie: testTree, prior: prior });
    const input = { input: "who should we hea", cursorPosition: 15 };
    const results = triePipeline.predict(input, 5, 0, QUALITY_MODULE_TYPE.EXPECTED_REWARD).map(wPred => wPred.prediction);
    expect(results).toEqual([
        "who should we heart attack",
        "who should we hepatitis",
        "who should we health risk",
        "who should we heal"
    ]);
});