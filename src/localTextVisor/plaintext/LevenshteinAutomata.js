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
        this.stateIdLookup = {};
        this.hiddenStateLookup = [];
        this.hiddenStateLookupMin = [];
        this.stateIdTransitions = [];
        const initialHiddenState = str.reduce((accState, char) => {
            const prevValue = accState[accState.length - 1];
            costModule.insertCost(char);
            return [
                ...accState,
                Math.min(prevValue + costModule.deleteCost(char), this.costModule.rejectCostThreshold)
            ];
        }, [0]);
        const initialStateId = this.getStateId(initialHiddenState);
        const prefixEditCost = this.costModule.editCostAcceptor(initialHiddenState[initialHiddenState.length - 1], 0) ?
            { editCost: initialHiddenState[initialHiddenState.length - 1], step: 0 } : undefined;
        this.initialState = {
            acceptedPrefixData: prefixEditCost,
            stateId: initialStateId,
            step: 0,
        };
    }
    start() {
        return this.initialState;
    }
    step(sourceState, nextChar) {
        const sourceStateId = sourceState.stateId;
        if (sourceStateId >= this.hiddenStateLookup.length) {
            console.warn(`The State ${sourceStateId} has never been seen before.` +
                `Pass only allowed states to the automaton's step method.`);
            return sourceState;
        }
        let targetStateId = this.stateIdTransitions[sourceStateId].get(nextChar);
        let targetHiddenState;
        if (targetStateId !== undefined) {
            targetHiddenState = this.hiddenStateLookup[targetStateId];
        }
        else {
            const sourceHiddenState = this.hiddenStateLookup[sourceStateId];
            targetHiddenState = new Array(sourceHiddenState.length);
            targetHiddenState[0] = Math.min(sourceHiddenState[0] + this.costModule.insertCost(nextChar), this.costModule.rejectCostThreshold);
            for (let i = 0; i < sourceHiddenState.length - 1; i++) {
                targetHiddenState[i + 1] = (Math.min(targetHiddenState[i] + this.costModule.deleteCost(this.str[i]), sourceHiddenState[i] + this.costModule.swapCost(this.str[i], nextChar), sourceHiddenState[i + 1] + this.costModule.insertCost(nextChar), this.costModule.rejectCostThreshold));
            }
            targetStateId = this.getStateId(targetHiddenState);
            this.stateIdTransitions[sourceStateId].set(nextChar, targetStateId);
        }
        const targetStep = sourceState.step + 1;
        const targetLAStateProposal = {
            acceptedPrefixData: sourceState.acceptedPrefixData,
            stateId: targetStateId,
            step: targetStep,
        };
        const targetStateAccepted = this.costModule.editCostAcceptor(targetHiddenState[targetHiddenState.length - 1], targetStep);
        if (targetStateAccepted) {
            const sourceStateAccepted = sourceState.acceptedPrefixData !== undefined;
            const targetStateCloser = sourceStateAccepted ?
                targetHiddenState[targetHiddenState.length - 1] <= sourceState.acceptedPrefixData.editCost : true;
            if (targetStateCloser) {
                targetLAStateProposal.acceptedPrefixData = {
                    editCost: targetHiddenState[targetHiddenState.length - 1],
                    step: targetStep,
                };
            }
        }
        return targetLAStateProposal;
    }
    status(state) {
        if (state.stateId >= this.hiddenStateLookup.length) {
            console.warn(`The State ${state.stateId} has never been seen before.` +
                `Pass only allowed states to the automaton's step method.`);
            return {
                editCost: this.costModule.rejectCostThreshold,
                prefixEditCost: this.costModule.rejectCostThreshold,
                status: AbstractAutomata_1.STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
        if (state.acceptedPrefixData !== undefined) {
            const curState = this.hiddenStateLookup[state.stateId];
            return {
                editCost: curState[curState.length - 1],
                prefixEditCost: state.acceptedPrefixData.editCost,
                status: AbstractAutomata_1.STATUS_TYPE.ACCEPT,
                step: state.acceptedPrefixData.step,
            };
        }
        else if (this.costModule.editCostAcceptor(this.hiddenStateLookupMin[state.stateId], state.step)) {
            const curState = this.hiddenStateLookup[state.stateId];
            return {
                editCost: curState[curState.length - 1],
                prefixEditCost: curState[curState.length - 1],
                status: AbstractAutomata_1.STATUS_TYPE.UNKNOWN,
                step: state.step,
            };
        }
        else {
            const curState = this.hiddenStateLookup[state.stateId];
            return {
                editCost: curState[curState.length - 1],
                prefixEditCost: this.costModule.rejectCostThreshold,
                status: AbstractAutomata_1.STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
    }
    getStateId(state) {
        const stateId = this.stateIdLookup[state.toString()];
        if (stateId === undefined) {
            const newStateId = this.hiddenStateLookup.length;
            this.stateIdLookup[state.toString()] = newStateId;
            this.hiddenStateLookup.push(state);
            this.hiddenStateLookupMin.push(Math.min(...state));
            this.stateIdTransitions.push(new Map());
            return newStateId;
        }
        return stateId;
    }
}
exports.LevenshteinAutomaton = LevenshteinAutomaton;
//# sourceMappingURL=LevenshteinAutomata.js.map