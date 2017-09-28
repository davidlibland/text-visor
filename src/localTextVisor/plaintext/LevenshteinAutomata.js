"use strict";
/**
 * @file LevenshteinAutomata.ts
 * @desc An implementation of a levenstein automata.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class LevenshteinAutomaton {
    constructor(str, maxEditDistance) {
        this.str = str;
        this.maxEdits = maxEditDistance;
    }
    start() {
        return Array.from(Array(this.maxEdits + 1).keys());
    }
    step(state, nextChar) {
        let newState = [state[0] + 1];
        for (let i = 0; i < state.length - 1; i++) {
            const cost = this.str[i] === nextChar ? 0 : 1;
            newState.push(Math.min(newState[i] + 1, state[i] + cost, state[i + 1] + 1));
        }
        return newState;
    }
    isMatch(state) {
        return state[-1] <= this.maxEdits;
    }
    canMatch(state) {
        return Math.min(...state) <= this.maxEdits;
    }
}
exports.LevenshteinAutomaton = LevenshteinAutomaton;
//# sourceMappingURL=LevenshteinAutomata.js.map