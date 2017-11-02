/**
 * @file Context.test.ts
 * @desc Some basic tests for the context module.
 */

import "ts-jest";
import {
    FlatLevenshteinCostModule,
    FlatLevenshteinRelativeCostModule,
    LevenshteinAutomaton,
} from "../localTextVisor/plaintext/LevenshteinAutomata";
import {
    abortableAutomatonTreeSearch,
    Accumulator,
    automatonTreeSearch,
    buildSortedTreeFromPaths,
    buildSortedTreeFromSortedPaths,
    insert,
    sortedInsert,
    Tree,
} from "../localTextVisor/plaintext/Tree";

const str1 = "hello";
const str2 = "help";
const finalTree: Tree<string, void> = {
    node: "root",
    data: [],
    children: [
        {
            node: "h",
            data: [],
            children: [
                {
                    node: "e",
                    data: [],
                    children: [
                        {
                            node: "l",
                            data: [],
                            children: [
                                {
                                    node: "l",
                                    data: [],
                                    children: [
                                        {
                                            node: "o",
                                            data: [],
                                            children: [],
                                        },
                                    ],
                                },
                                {
                                    node: "p",
                                    data: [],
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

test("Testing sortedInsert into a tree", () => {
    const testTree: Tree<string, void> = { node: "root", children: [], data: [] };
    sortedInsert(testTree, str1.split(""));
    sortedInsert(testTree, str2.split(""));
    expect(testTree).toEqual(finalTree);
});

test("Testing sortedInsert into a tree", () => {
    const testTree: Tree<string, void> = { node: "root", children: [], data: [] };
    sortedInsert(testTree, ["b"]);
    sortedInsert(testTree, ["c"]);
    sortedInsert(testTree, ["a"]);
    sortedInsert(testTree, ["c", "d"]);
    sortedInsert(testTree, ["c", "a"]);
    expect(testTree).toEqual(
        {
            children: [
                { children: [], data: [], node: "a" },
                { children: [], data: [], node: "b" },
                {
                    children: [
                        { children: [], data: [], node: "a" },
                        { children: [], data: [], node: "d" },
                    ],
                    data: [],
                    node: "c",
                },
            ],
            data: [],
            node: "root",
        },
    );
});

test("Testing buildSortedTreeFromPaths", () => {
    const wrappedPaths = [
        {nodePath: ["b"]},
        {nodePath: ["c"]},
        {nodePath: ["a"], data: "here is A"},
        {nodePath: ["c", "d"], data: "here is CD"},
        {nodePath: ["c", "a"]},
    ];
    const testTree = buildSortedTreeFromPaths("root", ...wrappedPaths);
    expect(testTree).toEqual(
        {
            children: [
                { children: [], data: ["here is A"], node: "a" },
                { children: [], data: [], node: "b" },
                {
                    children: [
                        { children: [], data: [], node: "a" },
                        { children: [], data: ["here is CD"], node: "d" },
                    ],
                    data: [],
                    node: "c",
                },
            ],
            data: [],
            node: "root",
        },
    );
});

test("Testing buildSortedTreeFromSortedPaths", () => {
    const wrappedPaths = [
        {nodePath: ["b"]},
        {nodePath: ["c"]},
        {nodePath: ["a"], data: "here is A"},
        {nodePath: ["c", "d"], data: "here is CD"},
        {nodePath: ["c", "a"]},
    ].sort((a, b) => {
            if (a.nodePath < b.nodePath) {
                return -1;
            } else if (a.nodePath > b.nodePath) {
                return 1;
            } else {
                return 0;
            }
        },
    );
    const testTree = buildSortedTreeFromSortedPaths("root", ...wrappedPaths);
    expect(testTree).toEqual(
        {
            children: [
                { children: [], data: ["here is A"], node: "a" },
                { children: [], data: [], node: "b" },
                {
                    children: [
                        { children: [], data: [], node: "a" },
                        { children: [], data: ["here is CD"], node: "d" },
                    ],
                    data: [],
                    node: "c",
                },
            ],
            data: [],
            node: "root",
        },
    );
});

// Automaton Tree Search

interface tokenData { token: string; }

function pluck<T, K extends keyof T>(o: T, names: K[]): Array<T[K]> {
    return names.map((n) => o[n]);
}

test("FuzzyTreeSearch should find correct completions", () => {
    const testTree: Tree<string, tokenData> = { node: "root", children: [], data: [] };
    sortedInsert(testTree, "heart attack".split(""), { token: "heart attack" });
    sortedInsert(testTree, "health risk".split(""), { token: "health risk" });
    sortedInsert(testTree, "hepatitis".split(""), { token: "hepatitis" });
    sortedInsert(testTree, "heal".split(""), { token: "heal" });
    sortedInsert(testTree, "heat".split(""), { token: "heat" });
    const plucker = (result) => pluck(result, ["status", "prefixEditCost", "token"]);
    let costModule = new FlatLevenshteinCostModule(1);
    let leven = new LevenshteinAutomaton("heal".split(""), costModule);
    let results = automatonTreeSearch(testTree, leven, leven.start());
    expect(results.map(plucker)).toEqual([
        { status: "ACCEPT", prefixEditCost: 0, token: "heal" },
        { status: "ACCEPT", prefixEditCost: 0, token: "health risk" },
    ].map(plucker));

    costModule = new FlatLevenshteinCostModule(2);
    leven = new LevenshteinAutomaton("heal".split(""), costModule);
    results = automatonTreeSearch(testTree, leven, leven.start());
    expect(results.map(plucker)).toEqual([
        { status: "ACCEPT", prefixEditCost: 0, token: "heal" },
        { status: "ACCEPT", prefixEditCost: 0, token: "health risk" },
        { status: "ACCEPT", prefixEditCost: 1, token: "heart attack" },
        { status: "ACCEPT", prefixEditCost: 1, token: "heat" },
    ].map(plucker));

    costModule = new FlatLevenshteinCostModule(3);
    leven = new LevenshteinAutomaton("heal".split(""), costModule);
    results = automatonTreeSearch(testTree, leven, leven.start());
    expect(results.map(plucker)).toEqual([
        { status: "ACCEPT", prefixEditCost: 0, token: "heal" },
        { status: "ACCEPT", prefixEditCost: 0, token: "health risk" },
        { status: "ACCEPT", prefixEditCost: 1, token: "heart attack" },
        { status: "ACCEPT", prefixEditCost: 1, token: "heat" },
        { status: "ACCEPT", prefixEditCost: 2, token: "hepatitis" },
    ].map(plucker));
});

test("FuzzyTreeSearch with Rel Edit Distance should find correct completions", () => {
    const testTree: Tree<string, tokenData> = { node: "root", children: [], data: [] };
    sortedInsert(testTree, "heart attack".split(""), { token: "heart attack" });
    sortedInsert(testTree, "health risk".split(""), { token: "health risk" });
    sortedInsert(testTree, "hepatitis".split(""), { token: "hepatitis" });
    sortedInsert(testTree, "heal".split(""), { token: "heal" });
    sortedInsert(testTree, "heat".split(""), { token: "heat" });
    const plucker = (result) => pluck(result, ["status", "prefixEditCost", "token"]);
    let costModule = new FlatLevenshteinRelativeCostModule(0, 4);
    let leven = new LevenshteinAutomaton("heal".split(""), costModule);
    let results = automatonTreeSearch(testTree, leven, leven.start());
    expect(results.map(plucker)).toEqual([
        { status: "ACCEPT", prefixEditCost: 0, token: "heal" },
        { status: "ACCEPT", prefixEditCost: 0, token: "health risk" },
    ].map(plucker));

    costModule = new FlatLevenshteinRelativeCostModule(0.3, 4);
    leven = new LevenshteinAutomaton("heal".split(""), costModule);
    results = automatonTreeSearch(testTree, leven, leven.start());
    expect(results.map(plucker)).toEqual([
        { status: "ACCEPT", prefixEditCost: 0, token: "heal" },
        { status: "ACCEPT", prefixEditCost: 0, token: "health risk" },
        { status: "ACCEPT", prefixEditCost: 1, token: "heart attack" },
        { status: "ACCEPT", prefixEditCost: 1, token: "heat" },
    ].map(plucker));

    costModule = new FlatLevenshteinRelativeCostModule(0.5, 4);
    leven = new LevenshteinAutomaton("heal".split(""), costModule);
    results = automatonTreeSearch(testTree, leven, leven.start());
    expect(results.map(plucker)).toEqual([
        { status: "ACCEPT", prefixEditCost: 0, token: "heal" },
        { status: "ACCEPT", prefixEditCost: 0, token: "health risk" },
        { status: "ACCEPT", prefixEditCost: 1, token: "heart attack" },
        { status: "ACCEPT", prefixEditCost: 1, token: "heat" },
        { status: "ACCEPT", prefixEditCost: 2, token: "hepatitis" },
    ].map(plucker));
});

test("Cancelable FuzzyTreeSearch should be cancellable", () => {
    const testTree: Tree<string, tokenData> = { node: "root", children: [], data: [] };
    sortedInsert(testTree, "heart attack".split(""), { token: "heart attack" });
    sortedInsert(testTree, "health risk".split(""), { token: "health risk" });
    sortedInsert(testTree, "hepatitis".split(""), { token: "hepatitis" });
    sortedInsert(testTree, "heal".split(""), { token: "heal" });
    sortedInsert(testTree, "heat".split(""), { token: "heat" });
    const costModule = new FlatLevenshteinRelativeCostModule(0, 4);
    const leven = new LevenshteinAutomaton("heal".split(""), costModule);
    const resultsA = abortableAutomatonTreeSearch(testTree, leven, leven.start(), () => true);
    resultsA.consume((results) => expect(results).toEqual([]));
});

test("Cancelable FuzzyTreeSearch should return results if not cancelled.", () => {
    const testTree: Tree<string, tokenData> = { node: "root", children: [], data: [] };
    sortedInsert(testTree, "heart attack".split(""), { token: "heart attack" });
    sortedInsert(testTree, "health risk".split(""), { token: "health risk" });
    sortedInsert(testTree, "hepatitis".split(""), { token: "hepatitis" });
    sortedInsert(testTree, "heal".split(""), { token: "heal" });
    sortedInsert(testTree, "heat".split(""), { token: "heat" });
    const plucker = (result) => pluck(result, ["status", "prefixEditCost", "token"]);
    const costModule = new FlatLevenshteinRelativeCostModule(0, 4);
    const leven = new LevenshteinAutomaton("heal".split(""), costModule);
    const resultsA = abortableAutomatonTreeSearch(testTree, leven, leven.start(), () => false)
        .then((results) => results.map(plucker));
    resultsA.consume((results) => {
        expect(results).toEqual([
            { status: "ACCEPT", prefixEditCost: 0, token: "health risk" },
            { status: "ACCEPT", prefixEditCost: 0, token: "heal" },
        ].map(plucker));
    });
});