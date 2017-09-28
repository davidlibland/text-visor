/**
 * @file FuzzyTrieSearch.test.ts
 * @desc Some basic tests for the FuzzyTrieSearch predictor.
 */

import { Tree, sortedInsert } from "../localTextVisor/plaintext/Tree";
import { FuzzyTriePredictor } from "../localTextVisor/plaintext/FuzzyTrieSearch";
import "ts-jest";

type tokenData = {
    prediction: string;
};

function pluck<T, K extends keyof T>(o: T, names: K[]): T[K][] {
    return names.map(n => o[n]);
}

test("FuzzyTreeSearch should find correct completions", () => {
    const prior = (token) => 1;
    const plucker = (result) => pluck(result, ["cursorPosition", "prediction", "weight"]);
    let testTree: Tree<string, tokenData> = { node: "root", children: [], data: [] };
    sortedInsert(testTree, "heart attack".split(""), { prediction: "heart attack" });
    sortedInsert(testTree, "health risk".split(""), { prediction: "health risk" });
    sortedInsert(testTree, "hepatitis".split(""), { prediction: "hepatitis" });
    sortedInsert(testTree, "heal".split(""), { prediction: "heal" });
    sortedInsert(testTree, "heat".split(""), { prediction: "heat" });
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