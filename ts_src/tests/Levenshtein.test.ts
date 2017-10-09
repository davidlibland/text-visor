/**
 * @file Context.test.ts
 * @desc Some basic tests for the context module.
 */

import "ts-jest";
import { STATUS_TYPE } from "../localTextVisor/plaintext/AbstractAutomata";
import {
    FlatLevenshteinCostModule,
    LAState,
    LevenshteinAutomaton
} from "../localTextVisor/plaintext/LevenshteinAutomata";

test("After making at most 1 edit it is possible to complete Heat to Heart Attack", () => {
    const str1 = "Heat";
    const str2 = "Heart Attack";
    const costModule = new FlatLevenshteinCostModule(2);
    const leven = new LevenshteinAutomaton(str1.split(""), costModule);
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.ACCEPT);
});

test("Despite making at most 1 edit it is not possible to complete Help to Heart Attack", () => {
    const str1 = "Help";
    const str2 = "Heart Attack";
    const costModule = new FlatLevenshteinCostModule(2);
    const leven = new LevenshteinAutomaton(str1.split(""), costModule);
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.REJECT);
});

test("Some completion of Hep might be within edit distance 1 of Heart A", () => {
    const str1 = "Heart A";
    const str2 = "Hep";
    const costModule = new FlatLevenshteinCostModule(2);
    const leven = new LevenshteinAutomaton(str1.split(""), costModule);
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.UNKNOWN);
});

test("Some completion of Hepa might be within edit distance 1 of Heart A", () => {
    const str1 = "Heart A";
    const str2 = "Hepa";
    const costModule = new FlatLevenshteinCostModule(2);
    const leven = new LevenshteinAutomaton(str1.split(""), costModule);
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.UNKNOWN);
});

test("No completion of Hepat is within edit distance 1 of Heart A", () => {
    const str1 = "Heart A";
    const str2 = "Hepat";
    const costModule = new FlatLevenshteinCostModule(2);
    const leven = new LevenshteinAutomaton(str1.split(""), costModule);
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.REJECT);
});

test("Some completion of Hepat might be within edit distance 2 of Heart A", () => {
    const str1 = "Heart A";
    const str2 = "Hepat";
    const costModule = new FlatLevenshteinCostModule(3);
    const leven = new LevenshteinAutomaton(str1.split(""), costModule);
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.UNKNOWN);
});
