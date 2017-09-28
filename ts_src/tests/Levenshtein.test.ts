/**
 * @file Context.test.ts
 * @desc Some basic tests for the context module.
 */

import { LevenshteinAutomaton } from "../localTextVisor/plaintext/LevenshteinAutomata";
import "ts-jest";

test("Is Help within edit distance 1 of Hello", () => {
    const str1 = "Help";
    const str2 = "Hello";
    const leven = new LevenshteinAutomaton(str1, 1);
    const finalState = str2.split("").reduce<number[]>((state, char) => leven.step(state, char), leven.start());
    expect(leven.isMatch(finalState)).toBe(false);
});

test("Is Help within edit distance 2 of Hello", () => {
    const str1 = "Help";
    const str2 = "Hello";
    const leven = new LevenshteinAutomaton(str1, 2);
    let state = leven.start();
    const finalState = str2.split("").reduce<number[]>((state, char) => leven.step(state, char), leven.start());
    expect(leven.isMatch(finalState)).toBe(true);
});

test("Is a completion of Heat within edit distance 1 of Heart Attack", () => {
    const str1 = "Heat";
    const str2 = "Heart Attack";
    const leven = new LevenshteinAutomaton(str2, 1);
    let state = leven.start();
    const finalState = str1.split("").reduce<number[]>((state, char) => leven.step(state, char), leven.start());
    expect(leven.canMatch(finalState)).toBe(true);
});