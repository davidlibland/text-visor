/**
 * @file FuzzyTrieSearch.test.ts
 * @desc Some basic tests for the FuzzyTrieSearch predictor.
 */

import { Tree, sortedInsert } from "../localTextVisor/plaintext/Tree";
import {
    FuzzyTriePredictor,
    TokenizingPredictor
} from "../localTextVisor/plaintext/FuzzyTrieSearch";
import "ts-jest";

type tokenData = {
    prediction: string;
};

function pluck<T, K extends keyof T>(o: T, names: K[]): T[K][] {
    return names.map(n => o[n]);
}

const testTree: Tree<string, tokenData> = { node: "root", children: [], data: [] };
sortedInsert(testTree, "heart attack".split(""), { prediction: "heart attack" });
sortedInsert(testTree, "health risk".split(""), { prediction: "health risk" });
sortedInsert(testTree, "hepatitis".split(""), { prediction: "hepatitis" });
sortedInsert(testTree, "heal".split(""), { prediction: "heal" });
sortedInsert(testTree, "heat".split(""), { prediction: "heat" });

test("FuzzyTriePredictor should find correct completions", () => {
    const prior = (token) => 1;
    const plucker = (result) => pluck(result, ["cursorPosition", "prediction", "weight"]);
    let fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), 0, (editCost) => Math.pow(0.5, editCost));
    let results = fuzzyPredictor.predict(prior, "heal");
    expect(results.map(plucker)).toEqual([
        { "cursorPosition": 4, "prediction": "heal", "weight": 1 },
        { "cursorPosition": 11, "prediction": "health risk", "weight": 1 }
    ].map(plucker));

    fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), 1, (editCost) => Math.pow(0.5, editCost));
    results = fuzzyPredictor.predict(prior, "heal");
    expect(results.map(plucker)).toEqual([
        { prediction: 'heal', weight: 1, cursorPosition: 4 },
        { prediction: 'health risk', weight: 1, cursorPosition: 11 },
        { prediction: 'heart attack', weight: 0.5, cursorPosition: 12 },
        { prediction: 'heat', weight: 0.5, cursorPosition: 4 }
    ].map(plucker));

    fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), 2, (editCost) => Math.pow(0.5, editCost));
    results = fuzzyPredictor.predict(prior, "heal");
    expect(results.map(plucker)).toEqual([
        { prediction: 'heal', weight: 1, cursorPosition: 4 },
        { prediction: 'health risk', weight: 1, cursorPosition: 11 },
        { prediction: 'heart attack', weight: 0.5, cursorPosition: 12 },
        { prediction: 'heat', weight: 0.5, cursorPosition: 4 },
        { prediction: 'hepatitis', weight: 0.25, cursorPosition: 9 }
    ].map(plucker));
});

test("Contextified FuzzyTriePredictor should find correct completions", () => {
    const prior = (token) => 1;
    const plucker = (result) => pluck(result, ["cursorPosition", "prediction", "weight"]);
    const prefix = "Prefix";
    const inStr = "what would you like to heal";
    const curPos = inStr.length + prefix.length + 1;
    let fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), 0, (editCost) => Math.pow(0.5, editCost));
    let contextifiedPredictor = new TokenizingPredictor((token) => token.split(" "), (x) => x.length, (x, y) => x.concat(" " + y), prefix, fuzzyPredictor);
    let results = contextifiedPredictor.predict(prior, "what would you like to heal", curPos);
    expect(results.map(plucker)).toEqual([
        { "cursorPosition": 34, "prediction": "Prefix what would you like to heal", "weight": 1 },
        { "cursorPosition": 41, "prediction": "Prefix what would you like to health risk", "weight": 1 }
    ].map(plucker));

    fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), 1, (editCost) => Math.pow(0.5, editCost));
    contextifiedPredictor = new TokenizingPredictor((token) => token.split(" "), (x) => x.length, (x, y) => x.concat(" " + y), prefix, fuzzyPredictor);
    results = contextifiedPredictor.predict(prior, "what would you like to heal", curPos);
    expect(results.map(plucker)).toEqual([
        { prediction: 'Prefix what would you like to heal', weight: 1, cursorPosition: 34 },
        { prediction: 'Prefix what would you like to health risk', weight: 1, cursorPosition: 41 },
        { prediction: 'Prefix what would you like to heart attack', weight: 0.5, cursorPosition: 42 },
        { prediction: 'Prefix what would you like to heat', weight: 0.5, cursorPosition: 34 }
    ].map(plucker));

    fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), 2, (editCost) => Math.pow(0.5, editCost));
    contextifiedPredictor = new TokenizingPredictor((token) => token.split(" "), (x) => x.length, (x, y) => x.concat(" " + y), prefix, fuzzyPredictor);
    results = contextifiedPredictor.predict(prior, "what would you like to heal later today?", curPos);
    expect(results.map(plucker)).toEqual([
        { prediction: 'Prefix what would you like to heal later today?', weight: 1, cursorPosition: 34 },
        { prediction: 'Prefix what would you like to health risk later today?', weight: 1, cursorPosition: 41 },
        { prediction: 'Prefix what would you like to heart attack later today?', weight: 0.5, cursorPosition: 42 },
        { prediction: 'Prefix what would you like to heat later today?', weight: 0.5, cursorPosition: 34 },
        { prediction: 'Prefix what would you like to hepatitis later today?', weight: 0.25, cursorPosition: 39 }
    ].map(plucker));
});