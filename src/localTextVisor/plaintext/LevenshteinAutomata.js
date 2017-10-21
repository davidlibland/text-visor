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
    constructor(rejectCostThreshold, flatWeight = 1) {
        super();
        this.rejectCostThreshold = rejectCostThreshold;
        this.flatWeight = flatWeight;
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
        return alpha === beta ? 0 : this.flatWeight;
    }
    /**
     * @public
     * @method deleteCost
     * @desc this is the cost of deleting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    deleteCost(alpha) {
        return this.flatWeight;
    }
    /**
     * @public
     * @method insertCost
     * @desc this is the cost of inserting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    insertCost(alpha) {
        return this.flatWeight;
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
        return (editCost < this.rejectCostThreshold);
    }
}
exports.FlatLevenshteinCostModule = FlatLevenshteinCostModule;
class FlatLevenshteinRelativeCostModule extends FlatLevenshteinCostModule {
    constructor(relativeAcceptanceThreshold, rejectCostThreshold, flatWeight = 1) {
        super(rejectCostThreshold, flatWeight);
        this.relativeAcceptanceThreshold = relativeAcceptanceThreshold;
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
        return (editCost < this.rejectCostThreshold) && (editCost <= this.relativeAcceptanceThreshold * step);
    }
}
exports.FlatLevenshteinRelativeCostModule = FlatLevenshteinRelativeCostModule;
class LevenshteinAutomaton extends AbstractAutomata_1.AbstractAutomaton {
    constructor(str, costModule) {
        super();
        this.str = str;
        this.costModule = costModule;
        this.numericStateLookup = {};
        this.hiddenStateLookup = [];
        this.numericStateTransitions = new Map();
        const initialHiddenState = str.reduce((accState, char) => {
            const prevValue = accState[accState.length - 1];
            costModule.insertCost(char);
            return [...accState, prevValue + costModule.deleteCost(char)];
        }, [0]);
        const initialNumericState = this.getNumericState(initialHiddenState);
        this.initialState = {
            prefixEditCost: { editCost: initialHiddenState[initialHiddenState.length - 1], step: 0 },
            state: initialNumericState,
            step: 0,
        };
    }
    start() {
        return this.initialState;
    }
    step(laState, nextChar) {
        const sourceNumericState = laState.state;
        if (sourceNumericState >= this.hiddenStateLookup.length) {
            console.warn(`The State ${sourceNumericState} has never been seen before.` +
                `Pass only allowed states to the automaton's step method.`);
            return laState;
        }
        let targetNumericState;
        let targetHiddenState;
        if (this.numericStateTransitions.has([sourceNumericState, nextChar])) {
            targetNumericState = this.numericStateTransitions.get([sourceNumericState, nextChar]);
            targetHiddenState = this.hiddenStateLookup[targetNumericState];
        }
        else {
            const sourceHiddenState = this.hiddenStateLookup[laState.state];
            targetHiddenState = [Math.min(sourceHiddenState[0] + this.costModule.insertCost(nextChar), this.costModule.rejectCostThreshold)];
            for (let i = 0; i < sourceHiddenState.length - 1; i++) {
                targetHiddenState.push(Math.min(targetHiddenState[i] + this.costModule.deleteCost(this.str[i]), sourceHiddenState[i] + this.costModule.swapCost(this.str[i], nextChar), sourceHiddenState[i + 1] + this.costModule.insertCost(nextChar), this.costModule.rejectCostThreshold));
            }
            targetNumericState = this.getNumericState(targetHiddenState);
            this.numericStateTransitions.set([sourceNumericState, nextChar], targetNumericState);
        }
        const targetLaState = {
            prefixEditCost: laState.prefixEditCost,
            state: targetNumericState,
            step: laState.step + 1,
        };
        const targetStep = laState.step + 1;
        const targetEditCost = {
            editCost: targetHiddenState[targetHiddenState.length - 1],
            step: targetStep,
        };
        const sourceHistEditCost = laState.prefixEditCost;
        const targetLAStateProposal = {
            prefixEditCost: targetEditCost,
            state: targetNumericState,
            step: targetStep,
        };
        if (this.status(targetLAStateProposal).status === AbstractAutomata_1.STATUS_TYPE.ACCEPT) {
            if (this.status(laState).status === AbstractAutomata_1.STATUS_TYPE.ACCEPT) {
                if (targetHiddenState[targetHiddenState.length - 1] > laState.prefixEditCost.editCost) {
                    targetLAStateProposal.prefixEditCost = sourceHistEditCost;
                }
            }
        }
        else {
            targetLAStateProposal.prefixEditCost = sourceHistEditCost;
        }
        return targetLAStateProposal;
    }
    status(state) {
        if (state.state >= this.hiddenStateLookup.length) {
            console.warn(`The State ${state.state} has never been seen before.` +
                `Pass only allowed states to the automaton's step method.`);
            return {
                editCost: this.costModule.rejectCostThreshold,
                prefixEditCost: this.costModule.rejectCostThreshold,
                status: AbstractAutomata_1.STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
        if (this.costModule.editCostAcceptor(state.prefixEditCost.editCost, state.prefixEditCost.step)) {
            const curState = this.hiddenStateLookup[state.state];
            return {
                editCost: curState[curState.length - 1],
                prefixEditCost: state.prefixEditCost.editCost,
                status: AbstractAutomata_1.STATUS_TYPE.ACCEPT,
                step: state.prefixEditCost.step,
            };
        }
        else if (this.costModule.editCostAcceptor(Math.min(...this.hiddenStateLookup[state.state]), state.step)) {
            const curState = this.hiddenStateLookup[state.state];
            return {
                editCost: curState[curState.length - 1],
                prefixEditCost: this.hiddenStateLookup[state.state][this.hiddenStateLookup[state.state].length - 1],
                status: AbstractAutomata_1.STATUS_TYPE.UNKNOWN,
                step: state.step,
            };
        }
        else {
            const curState = this.hiddenStateLookup[state.state];
            return {
                editCost: curState[curState.length - 1],
                prefixEditCost: this.costModule.rejectCostThreshold,
                status: AbstractAutomata_1.STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
    }
    getNumericState(state) {
        const numericState = this.numericStateLookup[state.toString()];
        if (numericState === undefined) {
            const newNumericState = this.hiddenStateLookup.length;
            this.numericStateLookup[state.toString()] = newNumericState;
            this.hiddenStateLookup.push(state);
            return newNumericState;
        }
        return numericState;
    }
}
exports.LevenshteinAutomaton = LevenshteinAutomaton;
//# sourceMappingURL=LevenshteinAutomata.js.map