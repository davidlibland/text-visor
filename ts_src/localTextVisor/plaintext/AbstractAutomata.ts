/**
 * @file AbstractAutomata.ts
 * @desc An automata abstraction.
 */

/**
 * Imports:
 */
import { UnionKeyToValue } from "../Enums";

// These are the basic status types.
export type StatusType =
    "ACCEPT" |
    "REJECT" |
    "UNKNOWN";

export const STATUS_TYPE: UnionKeyToValue<StatusType> = {
    ACCEPT: "ACCEPT",
    REJECT: "REJECT",
    UNKNOWN: "UNKNOWN",
};

export interface StatusContainer {
    status: StatusType;
}

/**
 * An abstract automaton.
 * @typeparam S The type of the state.
 * @typeparam A The type of the action.
 * @typeparam E The type of status, extends "Accept", "Reject", and "Unknown".
 */
export abstract class AbstractAutomaton<S, A, E extends StatusContainer> {
    /**
     * Returns the initial state for the automaton.
     * @returns {S} The initial state
     */
    public abstract start(): S;

    /**
     * Given the current state and an action, returns the next state.
     * @param {S} state The current state.
     * @param {A} action An action.
     * @returns {S} The next state.
     */
    public abstract step(state: S, action: A): S;

    /**
     * Returns the status of the automaton at a given state.
     * @param {S} state The state to query.
     * @returns {E} The corresponding status.
     */
    public abstract status(state: S): E;
}