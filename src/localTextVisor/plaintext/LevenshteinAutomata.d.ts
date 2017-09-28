/**
 * @file LevenshteinAutomata.ts
 * @desc An implementation of a levenstein automata.
 */
export declare class LevenshteinAutomaton {
    private str;
    private maxEdits;
    constructor(str: string, maxEditDistance: number);
    start(): number[];
    step(state: number[], nextChar: string): number[];
    isMatch(state: number[]): boolean;
    canMatch(state: number[]): boolean;
}
