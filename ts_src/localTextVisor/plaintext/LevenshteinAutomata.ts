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
    acceptedPrefixData?: {editCost: number, step: number};
    stateId: number;
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
    private stateIdLookup: {[key: string]: number};
    private hiddenStateLookup: number[][];
    private hiddenStateLookupMin: number[];
    private stateIdTransitions: Array< Map<A, number>>;
    private initialState: LAState;
    private initialHiddenState: number[];

    constructor(str: A[], costModule: LevenshteinEditCostModule<A>) {
        super();
        this.str = str;
        this.costModule = costModule;
        this.stateIdLookup = {};
        this.hiddenStateLookup = [];
        this.hiddenStateLookupMin = [];
        this.stateIdTransitions = [];
        const initialHiddenState = str.reduce<number[]>((accState, char) => {
                const prevValue = accState[accState.length - 1];
                costModule.insertCost(char);
                return [
                    ...accState,
                    Math.min(prevValue + costModule.deleteCost(char), this.costModule.rejectCostThreshold)
                ];
            },
            [0],
        );
        const initialStateId = this.getStateId(initialHiddenState);
        const prefixEditCost = this.costModule.editCostAcceptor(initialHiddenState[initialHiddenState.length - 1], 0) ?
            {editCost: initialHiddenState[initialHiddenState.length - 1], step: 0} : undefined;
        this.initialState = {
            acceptedPrefixData: prefixEditCost,
            stateId: initialStateId,
            step: 0,
        };
    }

    public start(): LAState {
        return this.initialState;
    }

    public step(sourceState: LAState, nextChar: A): LAState {
        const sourceStateId = sourceState.stateId;
        if (sourceStateId >= this.hiddenStateLookup.length) {
            console.warn(`The State ${sourceStateId} has never been seen before.` +
                `Pass only allowed states to the automaton's step method.`);
            return sourceState;
        }
        let targetStateId: number = this.stateIdTransitions[sourceStateId].get( nextChar);
        let targetHiddenState: number[];
        if ( targetStateId !== undefined) {
            targetHiddenState = this.hiddenStateLookup[targetStateId];
        } else {
            const sourceHiddenState = this.hiddenStateLookup[sourceStateId];
            targetHiddenState = new Array(sourceHiddenState.length);
            targetHiddenState[0] = Math.min(
                sourceHiddenState[0] + this.costModule.insertCost(nextChar),
                this.costModule.rejectCostThreshold,
            );
            for (let i = 0; i < sourceHiddenState.length - 1; i++) {
                targetHiddenState[i + 1] = (Math.min(
                    targetHiddenState[i] + this.costModule.deleteCost(this.str[i]),
                    sourceHiddenState[i] + this.costModule.swapCost(this.str[i], nextChar),
                    sourceHiddenState[i + 1] + this.costModule.insertCost(nextChar),
                    this.costModule.rejectCostThreshold,
                ));
            }
            targetStateId = this.getStateId(targetHiddenState);
            this.stateIdTransitions[sourceStateId].set(nextChar, targetStateId);
        }
        const targetStep = sourceState.step + 1;
        const targetLAStateProposal: LAState = {
            acceptedPrefixData: sourceState.acceptedPrefixData,
            stateId: targetStateId,
            step: targetStep,
        };
        const targetStateAccepted = this.costModule.editCostAcceptor(
            targetHiddenState[targetHiddenState.length - 1],
            targetStep);
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

    public status(state: LAState): LAStatus {
        if (state.stateId >= this.hiddenStateLookup.length) {
            console.warn(`The State ${state.stateId} has never been seen before.` +
                `Pass only allowed states to the automaton's step method.`);
            return {
                editCost: this.costModule.rejectCostThreshold,
                prefixEditCost: this.costModule.rejectCostThreshold,
                status: STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
        if (state.acceptedPrefixData !== undefined) {
            const curState = this.hiddenStateLookup[state.stateId];
            return {
                editCost: curState[curState.length - 1],
                prefixEditCost: state.acceptedPrefixData.editCost,
                status: STATUS_TYPE.ACCEPT,
                step: state.acceptedPrefixData.step,
            };
        } else if (this.costModule.editCostAcceptor(this.hiddenStateLookupMin[state.stateId], state.step)) {
            const curState = this.hiddenStateLookup[state.stateId];
            return {
                editCost: curState[curState.length - 1],
                prefixEditCost: curState[curState.length - 1],
                status: STATUS_TYPE.UNKNOWN,
                step: state.step,
            };
        } else {
            const curState = this.hiddenStateLookup[state.stateId];
            return {
                editCost: curState[curState.length - 1],
                prefixEditCost: this.costModule.rejectCostThreshold,
                status: STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
    }

    private getStateId(state: number[]): number {
        const stateId = this.stateIdLookup[state.toString()];
        if (stateId === undefined) {
            const newStateId = this.hiddenStateLookup.length;
            this.stateIdLookup[state.toString()] = newStateId;
            this.hiddenStateLookup.push(state);
            this.hiddenStateLookupMin.push(Math.min(...state));
            this.stateIdTransitions.push(new Map<A, number>());
            return newStateId;
        }
        return stateId;
    }
}
