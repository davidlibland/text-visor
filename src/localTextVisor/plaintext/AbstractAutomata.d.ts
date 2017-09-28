/**
 * @file AbstractAutomata.ts
 * @desc An automata abstraction
 */
import { UnionKeyToValue } from "../Enums";
export declare type StatusType = "ACCEPT" | "REJECT" | "UNKNOWN";
export declare const STATUS_TYPE: UnionKeyToValue<StatusType>;
export interface StatusContainer {
    status: StatusType;
}
export declare abstract class AbstractAutomaton<S, A, E extends StatusContainer> {
    abstract start(): S;
    abstract step(state: S, action: A): S;
    abstract status(state: S): E;
}
