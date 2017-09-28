/**
 * @file Context.test.ts
 * @desc Some basic tests for the context module.
 */

import { Tree, sortedInsert, automatonTreeSearch } from "../localTextVisor/plaintext/Tree";
import { LevenshteinAutomaton } from "../localTextVisor/plaintext/LevenshteinAutomata";
import "ts-jest";

type tokenData = {token: string};

test("FuzzyTreeSearch should find correct completions", () => {
    let testTree: Tree<string, tokenData> = {node: "root", children:[], data:[]};
    sortedInsert(testTree, "heart attack".split(""), {token: "heart attack"});
    sortedInsert(testTree, "health risk".split(""), {token: "health risk"});
    sortedInsert(testTree, "hepatitis".split(""), {token: "hepatitis"});
    sortedInsert(testTree, "heal".split(""), {token: "heal"});
    sortedInsert(testTree, "heat".split(""), {token: "heat"});
    let leven = new LevenshteinAutomaton("heal".split(""), 0);
    let results = automatonTreeSearch(testTree, leven, leven.start());
    expect(results).toEqual([
        { status: 'ACCEPT', editCost: 0, token: 'heal' },
        { status: 'ACCEPT', editCost: 0, token: 'health risk' }
        ]);

    leven = new LevenshteinAutomaton("heal".split(""), 1);
    results = automatonTreeSearch(testTree, leven, leven.start());
    expect(results).toEqual([
        { status: 'ACCEPT', editCost: 0, token: 'heal' },
        { status: 'ACCEPT', editCost: 0, token: 'health risk' },
        { status: 'ACCEPT', editCost: 1, token: 'heart attack' },
        { status: 'ACCEPT', editCost: 1, token: 'heat' }
    ]);

    leven = new LevenshteinAutomaton("heal".split(""), 2);
    results = automatonTreeSearch(testTree, leven, leven.start());
    expect(results).toEqual([
        { status: 'ACCEPT', editCost: 0, token: 'heal' },
        { status: 'ACCEPT', editCost: 0, token: 'health risk' },
        { status: 'ACCEPT', editCost: 1, token: 'heart attack' },
        { status: 'ACCEPT', editCost: 1, token: 'heat' },
        { status: 'ACCEPT', editCost: 2, token: 'hepatitis' }
    ]);
});