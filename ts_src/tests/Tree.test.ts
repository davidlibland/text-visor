/**
 * @file Context.test.ts
 * @desc Some basic tests for the context module.
 */

import { Tree, sortedInsert, insert } from "../localTextVisor/plaintext/Tree";
import "ts-jest";

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
                                            children: []
                                        }
                                    ]
                                },
                                {
                                    node: "p",
                                    data: [],
                                    children: []
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

test("Testing insertion into a tree", () => {
    let testTree: Tree<string, void> = {node: "root", children:[], data:[]};
    let comparisonFunc = (a, b) => {
        if( a < b) {
            return -1
        }
        if (a == b) {
            return 0
        }
        return 1};
    sortedInsert(comparisonFunc, testTree, str1.split(""));
    sortedInsert(comparisonFunc, testTree, str2.split(""));
    expect(testTree).toEqual(finalTree)
});


test("Testing insertion into a tree", () => {
    let testTree: Tree<string, void> = {node: "root", children:[], data:[]};
    let comparisonFunc = (a, b) => {
        if( a < b) {
            return -1
        }
        if (a == b) {
            return 0
        }
        return 1};
    sortedInsert(comparisonFunc, testTree, ["b"]);
    sortedInsert(comparisonFunc, testTree, ["c"]);
    sortedInsert(comparisonFunc, testTree, ["a"]);
    sortedInsert(comparisonFunc, testTree, ["c","d"]);
    sortedInsert(comparisonFunc, testTree, ["c","a"]);
    expect(testTree).toEqual(
        {
            children: [
                {children: [], data: [], node: "a"},
                {children: [], data: [], node: "b"},
                {
                    children: [
                        {children: [], data: [], node: "a"},
                        {children: [], data: [], node: "d"}
                    ],
                    data: [],
                    node: "c"}
                    ],
            data: [],
            node: "root"
        }
    );
});