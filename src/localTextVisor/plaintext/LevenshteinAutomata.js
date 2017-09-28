"use strict";
/**
 * @file LevenshteinAutomata.ts
 * @desc An implementation of a levenstein automata.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractAutomata_1 = require("./AbstractAutomata");
class LevenshteinAutomaton extends AbstractAutomata_1.AbstractAutomaton {
    constructor(str, maxEditCost) {
        super();
        this.str = str;
        this.maxEdits = maxEditCost;
    }
    start() {
        return {
            data: Array.from(Array(this.str.length + 1).keys()),
            histEditCost: this.str.length
        };
    }
    step(state, nextChar) {
        let newState = {
            data: [state.data[0] + 1],
            histEditCost: state.histEditCost
        };
        for (let i = 0; i < state.data.length - 1; i++) {
            const cost = this.str[i] === nextChar ? 0 : 1;
            newState.data.push(Math.min(newState.data[i] + 1, state.data[i] + cost, state.data[i + 1] + 1));
        }
        newState.histEditCost = Math.min(newState.data[newState.data.length - 1], newState.histEditCost);
        return newState;
    }
    status(state) {
        if (state.histEditCost <= this.maxEdits) {
            return {
                status: AbstractAutomata_1.STATUS_TYPE.ACCEPT,
                editCost: state.histEditCost
            };
        }
        else if (Math.min(...state.data) <= this.maxEdits) {
            return {
                status: AbstractAutomata_1.STATUS_TYPE.UNKNOWN,
                editCost: this.maxEdits + 1
            };
        }
        else {
            return {
                status: AbstractAutomata_1.STATUS_TYPE.REJECT,
                editCost: this.maxEdits + 1
            };
        }
    }
}
exports.LevenshteinAutomaton = LevenshteinAutomaton;
//# sourceMappingURL=LevenshteinAutomata.js.map