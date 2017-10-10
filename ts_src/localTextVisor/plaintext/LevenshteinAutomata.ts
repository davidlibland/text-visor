/**
 * @file LevenshteinAutomata.ts
 * @desc An implementation of a levenstein automata.
 */

import { UnionKeyToValue } from "../Enums";
import { AbstractAutomaton, StatusContainer, StatusType, STATUS_TYPE } from "./AbstractAutomata";

export interface LAStatus extends StatusContainer {
    status: StatusType;
    editCost: number;
    step: number;
}

export interface LAState {
    histEditCost: {editCost: number, step: number};
    state: number;
    step: number;
}

export abstract class LevenshteinEditCostModule<A> {
    /**
     * @property rejectCostThreshold
     * @desc All costs are capped at this threshold (to keep the number of
     * states finite). Any state whose cost is as large as this threshold is
     * rejected.
     */
    public rejectCostThreshold: number;

    /**
     * @public
     * @method swapCost
     * @desc this is the cost of swapping alpha for beta; must be non-negative.
     * @param {A} alpha
     * @param {A} beta
     * @returns {number}
     */
    public abstract swapCost(alpha: A, beta: A): number;

    /**
     * @public
     * @method deleteCost
     * @desc this is the cost of deleting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    public abstract deleteCost(alpha: A): number;

    /**
     * @public
     * @method insertCost
     * @desc this is the cost of inserting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    public abstract insertCost(alpha: A): number;

    /**
     * @public
     * @method editCostAcceptor
     * @desc This returns true if an editCost is acceptable at a given step.
     * @param {number} editCost
     * @param {number} step
     * @returns {boolean}
     */
    public abstract editCostAcceptor(editCost: number, step: number): boolean;
}

export class FlatLevenshteinCostModule<A> extends LevenshteinEditCostModule<A> {
    /**
     * @property maxEditCostThreshold
     * @desc All costs are capped at this threshold (to keep the number of
     * states finite). Any state whose cost is as large as this threshold is
     * rejected.
     */
    public rejectCostThreshold: number;
    protected flatWeight: number;
    constructor(rejectCostThreshold: number, flatWeight: number = 1) {
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
    public swapCost(alpha: A, beta: A): number {
        return alpha === beta ? 0 : this.flatWeight;
    }

    /**
     * @public
     * @method deleteCost
     * @desc this is the cost of deleting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    public deleteCost(alpha: A): number {
        return this.flatWeight;
    }

    /**
     * @public
     * @method insertCost
     * @desc this is the cost of inserting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    public insertCost(alpha: A): number {
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
    public editCostAcceptor(editCost: number, step: number): boolean {
        return (editCost < this.rejectCostThreshold);
    }
}

export class FlatLevenshteinRelativeCostModule<A> extends FlatLevenshteinCostModule<A> {
    /**
     * @property maxEditCostThreshold
     * @desc All costs are capped at this threshold (to keep the number of
     * states finite). Any state whose cost is as large as this threshold is
     * rejected.
     */
    public maxEditCostThreshold: number;
    protected reletiveAcceptanceThreshold: number;
    constructor(reletiveAcceptanceThreshold: number, rejectCostThreshold: number, flatWeight: number = 1) {
        super(rejectCostThreshold, flatWeight);
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
    public editCostAcceptor(editCost: number, step: number): boolean {
        return (editCost < this.rejectCostThreshold) && (editCost <= this.reletiveAcceptanceThreshold * step);
    }
}

export class LevenshteinAutomaton<A> extends AbstractAutomaton<LAState, A, LAStatus> {
    private str: A[];
    private costModule;
    private numericStateLookup: Map<number[], number>;
    private hiddenStateLookup: number[][];
    private numericStateTransitions: Map<number, number>;
    private initialState: LAState;
    private initialHiddenState: number[];

    constructor(str: A[], costModule: LevenshteinEditCostModule<A>) {
        super();
        this.str = str;
        this.costModule = costModule;
        this.numericStateLookup = new Map<number[], number>();
        this.hiddenStateLookup = [];
        this.numericStateTransitions = new Map<number, number>();
        const initialNumericState = this.getNumericState(Array.from(Array(this.str.length + 1).keys()));
        this.initialState = {
            histEditCost: {editCost: this.str.length, step: 0},
            state: initialNumericState,
            step: 0,
        };
    }

    public start(): LAState {
        return this.initialState;
    }

    public step(laState: LAState, nextChar: A): LAState {
        const sourceNumericState = laState.state;
        if (sourceNumericState >= this.hiddenStateLookup.length) {
            console.warn(`The State ${sourceNumericState} has never been seen before.` +
                `Pass only allowed states to the automaton's step method.`);
            return laState;
        }
        let targetNumericState: number;
        let targetHiddenState: number[];
        if ( this.numericStateTransitions.get(sourceNumericState) ) {
            targetNumericState = this.numericStateTransitions.get(sourceNumericState);
            targetHiddenState = this.hiddenStateLookup[targetNumericState];
        } else {
            const sourceHiddenState = this.hiddenStateLookup[laState.state];
            targetHiddenState = [sourceHiddenState[0] + this.costModule.deleteCost(nextChar)];
            for (let i = 0; i < sourceHiddenState.length - 1; i++) {
                targetHiddenState.push(Math.min(
                    targetHiddenState[i] + this.costModule.insertCost(this.str[i]),
                    sourceHiddenState[i] + this.costModule.swapCost(nextChar, this.str[i]),
                    sourceHiddenState[i + 1] + this.costModule.deleteCost(nextChar),
                    this.costModule.rejectCostThreshold,
                ));
            }
            targetNumericState = this.getNumericState(targetHiddenState);
        }
        const targetLaState: LAState = {
            histEditCost: laState.histEditCost,
            state: targetNumericState,
            step: laState.step + 1,
        };
        const targetStep = laState.step + 1;
        const targetEditCost = {
            editCost: targetHiddenState[targetHiddenState.length - 1],
            step: targetStep,
        };
        const sourceHistEditCost = laState.histEditCost;
        const targetLAStateProposal = {state: targetNumericState, histEditCost: targetEditCost, step: targetStep};
        if (this.status(targetLAStateProposal).status === STATUS_TYPE.ACCEPT) {
            if (this.status(laState).status === STATUS_TYPE.ACCEPT) {
                if (targetHiddenState[targetHiddenState.length - 1] > laState.histEditCost.editCost) {
                    targetLAStateProposal.histEditCost = sourceHistEditCost;
                }
            }
        } else {
            targetLAStateProposal.histEditCost = sourceHistEditCost;
        }
        return targetLAStateProposal;
    }

    public status(state: LAState): LAStatus {
        if (state.state >= this.hiddenStateLookup.length) {
            console.warn(`The State ${state.state} has never been seen before.` +
                `Pass only allowed states to the automaton's step method.`);
            return {
                editCost: this.costModule.rejectCostThreshold,
                status: STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
        if (this.costModule.editCostAcceptor(state.histEditCost.editCost, state.histEditCost.step)) {
            return {
                editCost: state.histEditCost.editCost,
                status: STATUS_TYPE.ACCEPT,
                step: state.histEditCost.step,
            };
        } else if (this.costModule.editCostAcceptor(Math.min(...this.hiddenStateLookup[state.state]), state.step)) {
            return {
                editCost: this.costModule.rejectCostThreshold,
                status: STATUS_TYPE.UNKNOWN,
                step: state.step,
            };
        } else {
            return {
                editCost: this.costModule.rejectCostThreshold,
                status: STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
    }

    private getNumericState(state: number[]): number {
        const numericState = this.numericStateLookup.get(state);
        if (numericState === undefined) {
            const newNumericState = this.hiddenStateLookup.length;
            this.numericStateLookup.set(state, newNumericState);
            this.hiddenStateLookup.push(state);
            return newNumericState;
        }
        return numericState;
    }
}
