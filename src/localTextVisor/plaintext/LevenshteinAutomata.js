"use strict";
/**
 * @file LevenshteinAutomata.ts
 * @desc An implementation of a levenstein automata.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractAutomata_1 = require("./AbstractAutomata");
function maxEditCostAcceptor(maxEdit) {
    return (editCost, step) => (editCost <= maxEdit);
}
exports.maxEditCostAcceptor = maxEditCostAcceptor;
function maxRelativeEditCostAcceptor(maxRelEdit) {
    return (editCost, step) => (editCost <= maxRelEdit * step);
}
exports.maxRelativeEditCostAcceptor = maxRelativeEditCostAcceptor;
class LevenshteinAutomaton extends AbstractAutomata_1.AbstractAutomaton {
    constructor(str, maxEditCost, editCostAcceptor) {
        super();
        this.str = str;
        this.maxEdits = maxEditCost;
        this.editCostAcceptor = editCostAcceptor !== undefined ? editCostAcceptor : maxEditCostAcceptor(this.maxEdits);
    }
    start() {
        return {
            data: Array.from(Array(this.str.length + 1).keys()),
            histEditCost: { editCost: this.str.length, step: 0 },
            step: 0,
        };
    }
    step(state, nextChar) {
        const newState = {
            data: [state.data[0] + 1],
            histEditCost: state.histEditCost,
            step: state.step + 1,
        };
        for (let i = 0; i < state.data.length - 1; i++) {
            const cost = this.str[i] === nextChar ? 0 : 1;
            newState.data.push(Math.min(newState.data[i] + 1, state.data[i] + cost, state.data[i + 1] + 1));
        }
        if (newState.data[newState.data.length - 1] < newState.histEditCost.editCost) {
            newState.histEditCost = {
                editCost: newState.data[newState.data.length - 1],
                step: newState.step,
            };
        }
        return newState;
    }
    status(state) {
        if (this.editCostAcceptor(state.histEditCost.editCost, state.histEditCost.step)) {
            return {
                editCost: state.histEditCost.editCost,
                status: AbstractAutomata_1.STATUS_TYPE.ACCEPT,
                step: state.histEditCost.step,
            };
        }
        else if (this.editCostAcceptor(Math.min(...state.data), state.step)) {
            return {
                editCost: this.maxEdits + 1,
                status: AbstractAutomata_1.STATUS_TYPE.UNKNOWN,
                step: state.step,
            };
        }
        else {
            return {
                editCost: this.maxEdits + 1,
                status: AbstractAutomata_1.STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
    }
}
exports.LevenshteinAutomaton = LevenshteinAutomaton;
//# sourceMappingURL=LevenshteinAutomata.js.map