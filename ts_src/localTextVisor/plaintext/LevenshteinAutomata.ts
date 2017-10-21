/**
 * @file LevenshteinAutomata.ts
 * @desc An implementation of a levenstein automata.
 */

import { UnionKeyToValue } from "../Enums";
import {
    AbstractAutomaton,
    STATUS_TYPE,
    StatusContainer,
    StatusType,
} from "./AbstractAutomata";

export interface LAStatus extends StatusContainer {
    status: StatusType;
    prefixEditCost: number;
    step: number;
    editCost: number;
}

export interface LAState {
    prefixEditCost: {editCost: number, step: number};
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
     * (i.e. Cost of swapping unintended alpha and for intended beta).
     * @param {A} alpha
     * @param {A} beta
     * @returns {number}
     */
    public abstract swapCost(alpha: A, beta: A): number;

    /**
     * @public
     * @method deleteCost
     * @desc this is the cost of deleting alpha; must be non-negative.
     * (i.e. Cost of deleting an unintended symbol alpha).
     * @param {A} alpha
     * @returns {number}
     */
    public abstract deleteCost(alpha: A): number;

    /**
     * @public
     * @method insertCost
     * @desc this is the cost of inserting alpha; must be non-negative.
     * (i.e. Cost of inserting an intended symbol alpha).
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
    protected relativeAcceptanceThreshold: number;
    constructor(relativeAcceptanceThreshold: number, rejectCostThreshold: number, flatWeight: number = 1) {
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
    public editCostAcceptor(editCost: number, step: number): boolean {
        return (editCost < this.rejectCostThreshold) && (editCost <= this.relativeAcceptanceThreshold * step);
    }
}

export class LevenshteinAutomaton<A> extends AbstractAutomaton<LAState, A, LAStatus> {
    private str: A[];
    private costModule;
    private numericStateLookup: Map<string, number>;
    private hiddenStateLookup: number[][];
    private numericStateTransitions: Map<[number, A], number>;
    private initialState: LAState;
    private initialHiddenState: number[];

    constructor(str: A[], costModule: LevenshteinEditCostModule<A>) {
        super();
        this.str = str;
        this.costModule = costModule;
        this.numericStateLookup = new Map<string, number>();
        this.hiddenStateLookup = [];
        this.numericStateTransitions = new Map<[number, A], number>();
        const initialHiddenState = str.reduce<number[]>((accState, char) => {
                const prevValue = accState[accState.length - 1];
                costModule.insertCost(char);
                return [...accState, prevValue + costModule.deleteCost(char)];
            },
            [0],
        );
        const initialNumericState = this.getNumericState(initialHiddenState);
        this.initialState = {
            prefixEditCost: {editCost: initialHiddenState[initialHiddenState.length - 1], step: 0},
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
        if ( this.numericStateTransitions.has([sourceNumericState, nextChar]) ) {
            targetNumericState = this.numericStateTransitions.get([sourceNumericState, nextChar]);
            targetHiddenState = this.hiddenStateLookup[targetNumericState];
        } else {
            const sourceHiddenState = this.hiddenStateLookup[laState.state];
            targetHiddenState = [Math.min(
                sourceHiddenState[0] + this.costModule.insertCost(nextChar),
                this.costModule.rejectCostThreshold,
            )];
            for (let i = 0; i < sourceHiddenState.length - 1; i++) {
                targetHiddenState.push(Math.min(
                    targetHiddenState[i] + this.costModule.deleteCost(this.str[i]),
                    sourceHiddenState[i] + this.costModule.swapCost(this.str[i], nextChar),
                    sourceHiddenState[i + 1] + this.costModule.insertCost(nextChar),
                    this.costModule.rejectCostThreshold,
                ));
            }
            targetNumericState = this.getNumericState(targetHiddenState);
            this.numericStateTransitions.set([sourceNumericState, nextChar], targetNumericState);
        }
        const targetLaState: LAState = {
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
        const targetLAStateProposal: LAState = {
            prefixEditCost: targetEditCost,
            state: targetNumericState,
            step: targetStep,
        };
        if (this.status(targetLAStateProposal).status === STATUS_TYPE.ACCEPT) {
            if (this.status(laState).status === STATUS_TYPE.ACCEPT) {
                if (targetHiddenState[targetHiddenState.length - 1] > laState.prefixEditCost.editCost) {
                    targetLAStateProposal.prefixEditCost = sourceHistEditCost;
                }
            }
        } else {
            targetLAStateProposal.prefixEditCost = sourceHistEditCost;
        }
        return targetLAStateProposal;
    }

    public status(state: LAState): LAStatus {
        if (state.state >= this.hiddenStateLookup.length) {
            console.warn(`The State ${state.state} has never been seen before.` +
                `Pass only allowed states to the automaton's step method.`);
            return {
                editCost: this.costModule.rejectCostThreshold,
                prefixEditCost: this.costModule.rejectCostThreshold,
                status: STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
        if (this.costModule.editCostAcceptor(state.prefixEditCost.editCost, state.prefixEditCost.step)) {
            const curState = this.hiddenStateLookup[state.state];
            return {
                editCost: curState[curState.length - 1],
                prefixEditCost: state.prefixEditCost.editCost,
                status: STATUS_TYPE.ACCEPT,
                step: state.prefixEditCost.step,
            };
        } else if (this.costModule.editCostAcceptor(Math.min(...this.hiddenStateLookup[state.state]), state.step)) {
            const curState = this.hiddenStateLookup[state.state];
            return {
                editCost: curState[curState.length - 1],
                prefixEditCost: this.hiddenStateLookup[state.state][this.hiddenStateLookup[state.state].length - 1],
                status: STATUS_TYPE.UNKNOWN,
                step: state.step,
            };
        } else {
            const curState = this.hiddenStateLookup[state.state];
            return {
                editCost: curState[curState.length - 1],
                prefixEditCost: this.costModule.rejectCostThreshold,
                status: STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
    }

    private getNumericState(state: number[]): number {
        const numericState = this.numericStateLookup.get(state.toString());
        if (numericState === undefined) {
            const newNumericState = this.hiddenStateLookup.length;
            this.numericStateLookup.set(state.toString(), newNumericState);
            this.hiddenStateLookup.push(state);
            return newNumericState;
        }
        return numericState;
    }
}
