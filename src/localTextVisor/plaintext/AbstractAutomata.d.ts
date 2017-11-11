/**
 * @file AbstractAutomata.ts
 * @desc An automata abstraction.
 */
/**
 * Imports:
 */
import { UnionKeyToValue } from "../Enums";
export declare type StatusType = "ACCEPT" | "REJECT" | "UNKNOWN";
export declare const STATUS_TYPE: UnionKeyToValue<StatusType>;
export interface StatusContainer {
    status: StatusType;
}
/**
 * An abstract automaton.
 * @typeparam S The type of the state.
 * @typeparam A The type of the action.
 * @typeparam E The type of status, extends "Accept", "Reject", and "Unknown".
 */
export declare abstract class AbstractAutomaton<S, A, E extends StatusContainer> {
    /**
     * Returns the initial state for the automaton.
     * @returns {S} The initial state
     */
    abstract start(): S;
    /**
     * Given the current state and an action, returns the next state.
     * @param {S} state The current state.
     * @param {A} action An action.
     * @returns {S} The next state.
     */
    abstract step(state: S, action: A): S;
    /**
     * Returns the status of the automaton at a given state.
     * @param {S} state The state to query.
     * @returns {E} The corresponding status.
     */
    abstract status(state: S): E;
}
