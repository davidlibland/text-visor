"use strict";
/**
 * @file LevenshteinAutomata.ts
 * @desc An implementation of a levenstein automata.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractAutomata_1 = require("./AbstractAutomata");
class LevenshteinEditCostModule {
}
exports.LevenshteinEditCostModule = LevenshteinEditCostModule;
class FlatLevenshteinCostModule extends LevenshteinEditCostModule {
    constructor(maxEditCostThreshold) {
        super();
        this.maxEditCostThreshold = maxEditCostThreshold;
    }
    /**
     * @public
     * @method swapCost
     * @desc this is the cost of swapping alpha for beta; must be non-negative.
     * @param {A} alpha
     * @param {A} beta
     * @returns {number}
     */
    swapCost(alpha, beta) {
        return alpha === beta ? 0 : 1;
    }
    /**
     * @public
     * @method deleteCost
     * @desc this is the cost of deleting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    deleteCost(alpha) {
        return 1;
    }
    /**
     * @public
     * @method insertCost
     * @desc this is the cost of inserting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    insertCost(alpha) {
        return 1;
    }
    /**
     * @public
     * @method editCostAcceptor
     * @desc This returns true if an editCost is acceptable at a given step.
     * @param {number} editCost
     * @param {number} step
     * @returns {boolean}
     */
    editCostAcceptor(editCost, step) {
        return (editCost < this.maxEditCostThreshold);
    }
}
exports.FlatLevenshteinCostModule = FlatLevenshteinCostModule;
class FlatLevenshteinRelativeCostModule extends FlatLevenshteinCostModule {
    constructor(reletiveAcceptanceThreshold, maxEditCostThreshold) {
        super(maxEditCostThreshold);
        this.reletiveAcceptanceThreshold = reletiveAcceptanceThreshold;
    }
    /**
     * @public
     * @method editCostAcceptor
     * @desc This returns true if an editCost is acceptable at a given step.
     * @param {number} editCost
     * @param {number} step
     * @returns {boolean}
     */
    editCostAcceptor(editCost, step) {
        return (editCost <= this.reletiveAcceptanceThreshold * step);
    }
}
exports.FlatLevenshteinRelativeCostModule = FlatLevenshteinRelativeCostModule;
class LevenshteinAutomaton extends AbstractAutomata_1.AbstractAutomaton {
    constructor(str, costModule) {
        super();
        this.str = str;
        this.costModule = costModule;
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
            data: [state.data[0] + this.costModule.deleteCost(nextChar)],
            histEditCost: state.histEditCost,
            step: state.step + 1,
        };
        for (let i = 0; i < state.data.length - 1; i++) {
            newState.data.push(Math.min(newState.data[i] + this.costModule.insertCost(this.str[i]), state.data[i] + this.costModule.swapCost(nextChar, this.str[i]), state.data[i + 1] + this.costModule.deleteCost(nextChar), this.costModule.maxEditCostThreshold));
        }
        const curEditCost = {
            editCost: newState.data[newState.data.length - 1],
            step: newState.step,
        };
        if (this.status(Object.assign({}, newState, { histEditCost: curEditCost })).status === AbstractAutomata_1.STATUS_TYPE.ACCEPT) {
            if (this.status(state).status === AbstractAutomata_1.STATUS_TYPE.ACCEPT) {
                if (newState.data[newState.data.length - 1] < newState.histEditCost.editCost) {
                    newState.histEditCost = curEditCost;
                }
            }
            else {
                newState.histEditCost = curEditCost;
            }
        }
        return newState;
    }
    status(state) {
        if (this.costModule.editCostAcceptor(state.histEditCost.editCost, state.histEditCost.step)) {
            return {
                editCost: state.histEditCost.editCost,
                status: AbstractAutomata_1.STATUS_TYPE.ACCEPT,
                step: state.histEditCost.step,
            };
        }
        else if (this.costModule.editCostAcceptor(Math.min(...state.data), state.step)) {
            return {
                editCost: this.costModule.maxEditCostThreshold,
                status: AbstractAutomata_1.STATUS_TYPE.UNKNOWN,
                step: state.step,
            };
        }
        else {
            return {
                editCost: this.costModule.maxEditCostThreshold,
                status: AbstractAutomata_1.STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
    }
}
exports.LevenshteinAutomaton = LevenshteinAutomaton;
//# sourceMappingURL=LevenshteinAutomata.js.map