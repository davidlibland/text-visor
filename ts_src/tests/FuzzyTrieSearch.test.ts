/**
 * @file FuzzyTrieSearch.test.ts
 * @desc Some basic tests for the FuzzyTrieSearch predictor.
 */

import "ts-jest";
import {
    FuzzyTriePredictor,
    TokenizingPredictor,
} from "../localTextVisor/plaintext/FuzzyTrieSearch";
import { sortedInsert, Tree } from "../localTextVisor/plaintext/Tree";

interface tokenData {
    prediction: string;
}

function pluck<T, K extends keyof T>(o: T, names: K[]): Array<T[K]> {
    return names.map((n) => o[n]);
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
        { cursorPosition: 4, prediction: "heal", weight: 1 },
        { cursorPosition: 11, prediction: "health risk", weight: 1 },
    ].map(plucker));

    fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), 1, (editCost) => Math.pow(0.5, editCost));
    results = fuzzyPredictor.predict(prior, "heal");
    expect(results.map(plucker)).toEqual([
        { prediction: "heal", weight: 1, cursorPosition: 4 },
        { prediction: "health risk", weight: 1, cursorPosition: 11 },
        { prediction: "heart attack", weight: 0.5, cursorPosition: 12 },
        { prediction: "heat", weight: 0.5, cursorPosition: 4 },
    ].map(plucker));

    fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), 2, (editCost) => Math.pow(0.5, editCost));
    results = fuzzyPredictor.predict(prior, "heal");
    expect(results.map(plucker)).toEqual([
        { prediction: "heal", weight: 1, cursorPosition: 4 },
        { prediction: "health risk", weight: 1, cursorPosition: 11 },
        { prediction: "heart attack", weight: 0.5, cursorPosition: 12 },
        { prediction: "heat", weight: 0.5, cursorPosition: 4 },
        { prediction: "hepatitis", weight: 0.25, cursorPosition: 9 },
    ].map(plucker));
});

test("Contextified FuzzyTriePredictor should find correct completions", () => {
    const prior = (token) => 1;
    const plucker = (result) => pluck(result, ["cursorPosition", "prediction", "weight"]);
    const inStr = "what would you like to heal";
    const curPos = inStr.length;
    const input = { input: "what would you like to heal", cursorPosition: curPos };
    let fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), 0, (editCost) => Math.pow(0.5, editCost));
    let contextifiedPredictor = new TokenizingPredictor((token) => token.split(" "), (...x) => x.join(" "), fuzzyPredictor);
    let results = contextifiedPredictor.predict(prior, input);
    expect(results.map(plucker)).toEqual([
        { cursorPosition: 27, prediction: "what would you like to heal", weight: 1 },
        { cursorPosition: 34, prediction: "what would you like to health risk", weight: 1 },
    ].map(plucker));

    fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), 1, (editCost) => Math.pow(0.5, editCost));
    contextifiedPredictor = new TokenizingPredictor((token) => token.split(" "), (...x) => x.join(" "), fuzzyPredictor);
    results = contextifiedPredictor.predict(prior, input);
    expect(results.map(plucker)).toEqual([
        { prediction: "what would you like to heal", weight: 1, cursorPosition: 27 },
        { prediction: "what would you like to health risk", weight: 1, cursorPosition: 34 },
        { prediction: "what would you like to heart attack", weight: 0.5, cursorPosition: 35 },
        { prediction: "what would you like to heat", weight: 0.5, cursorPosition: 27 },
    ].map(plucker));

    fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), 2, (editCost) => Math.pow(0.5, editCost));
    contextifiedPredictor = new TokenizingPredictor((token) => token.split(" "), (...x) => x.join(" "), fuzzyPredictor);
    results = contextifiedPredictor.predict(prior, { input: "what would you like to heal later today?", cursorPosition: curPos });
    expect(results.map(plucker)).toEqual([
        { prediction: "what would you like to heal later today?", weight: 1, cursorPosition: 27 },
        { prediction: "what would you like to health risk later today?", weight: 1, cursorPosition: 34 },
        { prediction: "what would you like to heart attack later today?", weight: 0.5, cursorPosition: 35 },
        { prediction: "what would you like to heat later today?", weight: 0.5, cursorPosition: 27 },
        { prediction: "what would you like to hepatitis later today?", weight: 0.25, cursorPosition: 32 },
    ].map(plucker));
});
