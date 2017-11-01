/**
 * @file FuzzyTrieSearch.test.ts
 * @desc Some basic tests for the FuzzyTrieSearch predictor.
 */

import "ts-jest";
import {
    FlatLevenshteinCostModule,
    FlatLevenshteinRelativeCostModule,
    FuzzyTriePredictor,
    TokenizingPredictor,
} from "../localTextVisor/plaintext/FuzzyTrieSearch";
import { sortedInsert, Tree } from "../localTextVisor/plaintext/Tree";

interface TokenData {
    prediction: string;
}

function pluck<T, K extends keyof T>(o: T, names: K[]): Array<T[K]> {
    return names.map((n) => o[n]);
}

const testTree: Tree<string, TokenData> = { node: "root", children: [], data: [] };
sortedInsert(testTree, "heart attack".split(""), { prediction: "heart attack" });
sortedInsert(testTree, "health risk".split(""), { prediction: "health risk" });
sortedInsert(testTree, "hepatitis".split(""), { prediction: "hepatitis" });
sortedInsert(testTree, "heal".split(""), { prediction: "heal" });
sortedInsert(testTree, "heat".split(""), { prediction: "heat" });

test("FuzzyTriePredictor should find correct completions", () => {
    const prior = (token) => 1;
    const plucker = (result) => pluck(result, ["cursorPosition", "prediction", "weight"]);
    let costModuleFactory = (ignored) => new FlatLevenshteinCostModule(1);
    let fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), costModuleFactory);
    let resultsP = fuzzyPredictor.predict(prior, "heal");
    resultsP.then((results) =>
    expect(results.map(plucker)).toEqual([
        { cursorPosition: 4, prediction: "heal", weight: 1 },
        { cursorPosition: 11, prediction: "health risk", weight: 1 },
    ].map(plucker)));

    costModuleFactory = (ignored) => new FlatLevenshteinCostModule(2);
    fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), costModuleFactory);
    resultsP = fuzzyPredictor.predict(prior, "heal");
    resultsP.then((results) =>
    expect(results.map(plucker)).toEqual([
        { prediction: "heal", weight: 1, cursorPosition: 4 },
        { prediction: "health risk", weight: 1, cursorPosition: 11 },
        { prediction: "heart attack", weight: Math.exp(-1), cursorPosition: 12 },
        { prediction: "heat", weight: Math.exp(-1), cursorPosition: 4 },
    ].map(plucker)));

    costModuleFactory = (ignored) => new FlatLevenshteinCostModule(3);
    fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), costModuleFactory);
    resultsP = fuzzyPredictor.predict(prior, "heal");
    resultsP.then((results) =>
    expect(results.map(plucker)).toEqual([
        { prediction: "heal", weight: 1, cursorPosition: 4 },
        { prediction: "health risk", weight: 1, cursorPosition: 11 },
        { prediction: "heart attack", weight: Math.exp(-1), cursorPosition: 12 },
        { prediction: "heat", weight: Math.exp(-1), cursorPosition: 4 },
        { prediction: "hepatitis", weight: Math.exp(-2), cursorPosition: 9 },
    ].map(plucker)));
});

test("Contextified FuzzyTriePredictor should find correct completions", () => {
    const prior = (token) => 1;
    const plucker = (result) => pluck(result, ["cursorPosition", "prediction", "weight"]);
    const inStr = "what would you like to heal";
    const curPos = inStr.length;
    const input = { input: "what would you like to heal", cursorPosition: curPos };
    let costModuleFactory = (ignored) => new FlatLevenshteinCostModule(1);
    let fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), costModuleFactory);
    let contextifiedPredictor = new TokenizingPredictor(
        (token) => token.split(" "),
        (...x) => x.join(" "),
        fuzzyPredictor,
    );
    let resultsP = contextifiedPredictor.predict(prior, input);
    resultsP.then((results) =>
    expect(results.map(plucker)).toEqual([
        { cursorPosition: 27, prediction: "what would you like to heal", weight: 1 },
        { cursorPosition: 34, prediction: "what would you like to health risk", weight: 1 },
    ].map(plucker)));

    costModuleFactory = (ignored) => new FlatLevenshteinCostModule(2);
    fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), costModuleFactory);
    contextifiedPredictor = new TokenizingPredictor((token) => token.split(" "), (...x) => x.join(" "), fuzzyPredictor);
    resultsP = contextifiedPredictor.predict(prior, input);
    resultsP.then((results) =>
    expect(results.map(plucker)).toEqual([
        { prediction: "what would you like to heal", weight: 1, cursorPosition: 27 },
        { prediction: "what would you like to health risk", weight: 1, cursorPosition: 34 },
        { prediction: "what would you like to heart attack", weight: Math.exp(-1), cursorPosition: 35 },
        { prediction: "what would you like to heat", weight: Math.exp(-1), cursorPosition: 27 },
    ].map(plucker)));

    costModuleFactory = (ignored) => new FlatLevenshteinCostModule(3);
    fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), costModuleFactory);
    contextifiedPredictor = new TokenizingPredictor((token) => token.split(" "), (...x) => x.join(" "), fuzzyPredictor);
    resultsP = contextifiedPredictor.predict(
        prior,
        { input: "what would you like to heal later today?", cursorPosition: curPos },
    );
    resultsP.then((results) =>
    expect(results.map(plucker)).toEqual([
        { prediction: "what would you like to heal later today?", weight: 1, cursorPosition: 27 },
        { prediction: "what would you like to health risk later today?", weight: 1, cursorPosition: 34 },
        { prediction: "what would you like to heart attack later today?", weight: Math.exp(-1), cursorPosition: 35 },
        { prediction: "what would you like to heat later today?", weight: Math.exp(-1), cursorPosition: 27 },
        { prediction: "what would you like to hepatitis later today?", weight: Math.exp(-2), cursorPosition: 32 },
    ].map(plucker)));
});
