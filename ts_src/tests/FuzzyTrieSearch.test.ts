/**
 * @file FuzzyTrieSearch.test.ts
 * @desc Some basic tests for the FuzzyTrieSearch predictor.
 */

import "ts-jest";
import {
    FlatLevenshteinCostModule,
    FlatLevenshteinRelativeCostModule,
    } from "../localTextVisor/plaintext/FuzzyTrieSearch";
import FuzzyTriePredictor from "../localTextVisor/plaintext/FuzzyTrieSearch";
import TokenizingPredictor from "../localTextVisor/plaintext/TokenizingPredictor";
import { sortedInsert } from "../localTextVisor/plaintext/Tree";
import Tree from "../localTextVisor/plaintext/Tree";

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

test("FuzzyTriePredictor with flat cost 1 should find correct completions", () => {
    const prior = (token) => 1;
    const plucker = (result) => pluck(result, ["cursorPosition", "prediction", "weight"]);
    const costModuleFactory = (ignored) => new FlatLevenshteinCostModule(1);
    const fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), costModuleFactory);
    const resultsP = fuzzyPredictor.predict(prior, "heal");
    expect.assertions(1);
    return expect(resultsP.then((results) => results.map(plucker)))
        .resolves.toEqual([
            {cursorPosition: 4, prediction: "heal", weight: 1},
            {cursorPosition: 11, prediction: "health risk", weight: 1},
        ].map(plucker));
});

test("FuzzyTriePredictor with flat cost 2 should find correct completions", () => {
    const prior = (token) => 1;
    const plucker = (result) => pluck(result, ["cursorPosition", "prediction", "weight"]);
    const costModuleFactory = (ignored) => new FlatLevenshteinCostModule(2);
    const fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), costModuleFactory);
    const resultsP = fuzzyPredictor.predict(prior, "heal");
    expect.assertions(1);
    return expect(resultsP.then((results) => results.map(plucker)))
        .resolves.toEqual([
        { prediction: "heal", weight: 1, cursorPosition: 4 },
        { prediction: "health risk", weight: 1, cursorPosition: 11 },
        { prediction: "heart attack", weight: Math.exp(-1), cursorPosition: 12 },
        { prediction: "heat", weight: Math.exp(-1), cursorPosition: 4 },
    ].map(plucker));
});

test("FuzzyTriePredictor with flat cost 3 should find correct completions", () => {
    const prior = (token) => 1;
    const plucker = (result) => pluck(result, ["cursorPosition", "prediction", "weight"]);
    const costModuleFactory = (ignored) => new FlatLevenshteinCostModule(3);
    const fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), costModuleFactory);
    const resultsP = fuzzyPredictor.predict(prior, "heal");
    expect.assertions(1);
    return expect(resultsP.then((results) => results.map(plucker)))
        .resolves.toEqual([
        { prediction: "heal", weight: 1, cursorPosition: 4 },
        { prediction: "health risk", weight: 1, cursorPosition: 11 },
        { prediction: "heart attack", weight: Math.exp(-1), cursorPosition: 12 },
        { prediction: "heat", weight: Math.exp(-1), cursorPosition: 4 },
        { prediction: "hepatitis", weight: Math.exp(-2), cursorPosition: 9 },
    ].map(plucker));
});

test("Contextified FuzzyTriePredictor with edit cost 1 should find correct completions", () => {
    const prior = (token) => 1;
    const plucker = (result) => pluck(result, ["cursorPosition", "prediction", "weight"]);
    const inStr = "what would you like to heal";
    const curPos = inStr.length;
    const input = { input: "what would you like to heal", cursorPosition: curPos };
    const costModuleFactory = (ignored) => new FlatLevenshteinCostModule(1);
    const fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), costModuleFactory);
    const contextifiedPredictor = new TokenizingPredictor(
        (token) => token.split(" "),
        (...x) => x.join(" "),
        fuzzyPredictor,
    );
    const resultsP = contextifiedPredictor.predict(prior, input);
    expect.assertions(1);
    return expect(resultsP.then((results) => results.map(plucker)))
        .resolves.toEqual([
        { cursorPosition: 27, prediction: "what would you like to heal", weight: 1 },
        { cursorPosition: 34, prediction: "what would you like to health risk", weight: 1 },
    ].map(plucker));
});

test("Contextified FuzzyTriePredictor with edit cost 2 should find correct completions", () => {
    const prior = (token) => 1;
    const plucker = (result) => pluck(result, ["cursorPosition", "prediction", "weight"]);
    const inStr = "what would you like to heal";
    const curPos = inStr.length;
    const input = { input: "what would you like to heal", cursorPosition: curPos };
    const costModuleFactory = (ignored) => new FlatLevenshteinCostModule(2);
    const fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), costModuleFactory);
    const contextifiedPredictor = new TokenizingPredictor(
        (token) => token.split(" "),
        (...x) => x.join(" "),
        fuzzyPredictor);
    const resultsP = contextifiedPredictor.predict(prior, input);
    expect.assertions(1);
    return expect(resultsP.then((results) => results.map(plucker)))
        .resolves.toEqual([
        { prediction: "what would you like to heal", weight: 1, cursorPosition: 27 },
        { prediction: "what would you like to health risk", weight: 1, cursorPosition: 34 },
        { prediction: "what would you like to heart attack", weight: Math.exp(-1), cursorPosition: 35 },
        { prediction: "what would you like to heat", weight: Math.exp(-1), cursorPosition: 27 },
    ].map(plucker));
});

test("Contextified FuzzyTriePredictor with edit cost 3 should find correct completions", () => {
    const prior = (token) => 1;
    const plucker = (result) => pluck(result, ["cursorPosition", "prediction", "weight"]);
    const inStr = "what would you like to heal";
    const curPos = inStr.length;
    const costModuleFactory = (ignored) => new FlatLevenshteinCostModule(3);
    const fuzzyPredictor = new FuzzyTriePredictor(testTree, (token) => token.split(""), costModuleFactory);
    const contextifiedPredictor = new TokenizingPredictor(
        (token) => token.split(" "),
        (...x) => x.join(" "),
        fuzzyPredictor);
    const resultsP = contextifiedPredictor.predict(
        prior,
        { input: "what would you like to heal later today?", cursorPosition: curPos },
    );
    expect.assertions(1);
    return expect(resultsP.then((results) => results.map(plucker)))
        .resolves.toEqual([
        { prediction: "what would you like to heal later today?", weight: 1, cursorPosition: 27 },
        { prediction: "what would you like to health risk later today?", weight: 1, cursorPosition: 34 },
        { prediction: "what would you like to heart attack later today?", weight: Math.exp(-1), cursorPosition: 35 },
        { prediction: "what would you like to heat later today?", weight: Math.exp(-1), cursorPosition: 27 },
        { prediction: "what would you like to hepatitis later today?", weight: Math.exp(-2), cursorPosition: 32 },
    ].map(plucker));
});

test("Cancellable FuzzyTriePredictor with flat cost 1 should find correct completions", () => {
    const prior = (token) => 1;
    const plucker = (result) => pluck(result, ["cursorPosition", "prediction", "weight"]);
    const costModuleFactory = (ignored) => new FlatLevenshteinCostModule(1);
    const fuzzyPredictor = new FuzzyTriePredictor(
        testTree,
        (token) => token.split(""),
        costModuleFactory,
        undefined,
        undefined,
        1,
    );
    const resultsP = fuzzyPredictor.predict(prior, "heal");
    expect.assertions(1);
    return expect(resultsP.then((results) => results.map(plucker)))
        .resolves.toEqual([
            {cursorPosition: 11, prediction: "health risk", weight: 1},
            {cursorPosition: 4, prediction: "heal", weight: 1},
        ].map(plucker));
});

test("Cancellable FuzzyTriePredictor should abort all but last predict call.", () => {
    const prior = (token) => 1;
    const plucker = (result) => pluck(result, ["cursorPosition", "prediction", "weight"]);
    const costModuleFactory = (ignored) => new FlatLevenshteinCostModule(1);
    const fuzzyPredictor = new FuzzyTriePredictor(
        testTree,
        (token) => token.split(""),
        costModuleFactory,
        undefined,
        undefined,
        1,
    );
    const resultsP = fuzzyPredictor.predict(prior, "heal");
    // Call it again with a different input, this should abort the first call.
    fuzzyPredictor.predict(prior, "healing");
    expect.assertions(1);
    return expect(resultsP.then((results) => results.map(plucker)))
        .rejects.toEqual("Tree search aborted.");
});
