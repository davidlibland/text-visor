/**
 * @file Context.test.ts
 * @desc Some basic tests for the context module.
 */

import { LevenshteinAutomaton, LAState } from "../localTextVisor/plaintext/LevenshteinAutomata";
import { STATUS_TYPE } from "../localTextVisor/plaintext/AbstractAutomata"
import "ts-jest";



test("After making at most 1 edit it is possible to complete Heat to Heart Attack", () => {
    const str1 = "Heat";
    const str2 = "Heart Attack";
    const leven = new LevenshteinAutomaton(str1.split(""), 1);
    let state = leven.start();
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.ACCEPT);
});

test("Despite making at most 1 edit it is not possible to complete Help to Heart Attack", () => {
    const str1 = "Help";
    const str2 = "Heart Attack";
    const leven = new LevenshteinAutomaton(str1.split(""), 1);
    let state = leven.start();
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.REJECT);
});

test("Some completion of Hep might be within edit distance 1 of Heart A", () => {
    const str1 = "Heart A";
    const str2 = "Hep";
    const leven = new LevenshteinAutomaton(str1.split(""), 1);
    let state = leven.start();
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.UNKNOWN);
});

test("Some completion of Hepa might be within edit distance 1 of Heart A", () => {
    const str1 = "Heart A";
    const str2 = "Hepa";
    const leven = new LevenshteinAutomaton(str1.split(""), 1);
    let state = leven.start();
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.UNKNOWN);
});

test("No completion of Hepat is within edit distance 1 of Heart A", () => {
    const str1 = "Heart A";
    const str2 = "Hepat";
    const leven = new LevenshteinAutomaton(str1.split(""), 1);
    let state = leven.start();
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.REJECT);
});

test("Some completion of Hepat might be within edit distance 2 of Heart A", () => {
    const str1 = "Heart A";
    const str2 = "Hepat";
    const leven = new LevenshteinAutomaton(str1.split(""), 2);
    let state = leven.start();
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.UNKNOWN);
});

// Perhaps the following tests can be ommitted:

test("Help should be within edit distance 1 of a prefix of Hello", () => {
    const str1 = "Help";
    const str2 = "Hello";
    const leven = new LevenshteinAutomaton(str1.split(""), 1);
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.ACCEPT);
});

test("Help should be within edit distance 2 of a prefix of Health", () => {
    const str1 = "Help";
    const str2 = "Health";
    const leven = new LevenshteinAutomaton(str1.split(""), 2);
    let state = leven.start();
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.ACCEPT);
});

test("Heat should be within edit distance 1 of a prefix of Heart Attack", () => {
    const str1 = "Heat";
    const str2 = "Heart Attack";
    const leven = new LevenshteinAutomaton(str1.split(""), 1);
    let state = leven.start();
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.ACCEPT);
});

test("Heart Attack should be within edit distance 1 of a completion of Heat", () => {
    const str1 = "Heart Attack";
    const str2 = "Heat";
    const leven = new LevenshteinAutomaton(str1.split(""), 1);
    let state = leven.start();
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.UNKNOWN);
});

test("Heart should be within edit distance 0 of a completion of Hea", () => {
    const str1 = "Heart";
    const str2 = "Hea";
    const leven = new LevenshteinAutomaton(str1.split(""), 0);
    let state = leven.start();
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.UNKNOWN);
});

test("Heart should be within edit distance 1 of Heat", () => {
    const str1 = "Heart";
    const str2 = "Heat";
    const leven = new LevenshteinAutomaton(str1.split(""), 1);
    let state = leven.start();
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.ACCEPT);
});

test("Heart should be within edit distance 1 of a completion of Heal", () => {
    const str1 = "Heart";
    const str2 = "Heal";
    const leven = new LevenshteinAutomaton(str1.split(""), 1);
    let state = leven.start();
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.UNKNOWN);
});

test("Health should be within edit distance 1 of a completion of Heart", () => {
    const str1 = "Heart";
    const str2 = "Health";
    const leven = new LevenshteinAutomaton(str1.split(""), 1);
    let state = leven.start();
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.ACCEPT);
});

test("No completion of Heart Attack should be within edit distance 1 of any completion of Health Risk", () => {
    const str1 = "Health Risk";
    const str2 = "Heart Attack";
    const leven = new LevenshteinAutomaton(str1.split(""), 1);
    let state = leven.start();
    const finalState = str2.split("").reduce<LAState>((state, char) => leven.step(state, char), leven.start());
    expect(leven.status(finalState).status).toBe(STATUS_TYPE.REJECT);
});