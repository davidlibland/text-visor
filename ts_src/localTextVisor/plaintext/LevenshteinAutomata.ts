/**
 * @file LevenshteinAutomata.ts
 * @desc An implementation of a levenstein automata.
 */

export class LevenshteinAutomaton {
    private str: string;
    private maxEdits: number;
    constructor(str: string, maxEditDistance: number) {
        this.str = str;
        this.maxEdits = maxEditDistance
    }

    start(): number[] {
        return Array.from(Array(this.maxEdits + 1).keys());
    }

    step(state: number[], nextChar: string): number[] {
        let newState = [state[0] + 1];
        for (let i = 0; i < state.length - 1; i++) {
            const cost = this.str[i] == nextChar ? 0 : 1;
            newState.push(Math.min(newState[i] + 1, state[i] + cost, state[i + 1] + 1))
        }
        return newState
    }

    isMatch(state: number[]): boolean {
        return state[-1] <= this.maxEdits;
    }

    canMatch(state: number[]): boolean {
        return Math.min(...state) <= this.maxEdits
    }
}