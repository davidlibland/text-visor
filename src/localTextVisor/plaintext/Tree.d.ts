/**
 * @file Tree.ts
 * @desc A Tree data structure.
 */
import { AbstractAutomaton, StatusContainer } from "./AbstractAutomata";
export interface Tree<A, V> {
    node: A;
    children: Tree<A, V>[];
    data: V[];
}
export declare function insert<A, V>(tree: Tree<A, V>, token: A[], data?: V): Tree<A, V>;
export declare function sortedInsert<A, V>(tree: Tree<A, V>, token: A[], data?: V, comparisonFunc?: ((obj1: A, obj2: A) => number)): Tree<A, V>;
export declare function automatonTreeSearch<S, A, V extends Object, E extends StatusContainer = StatusContainer>(tree: Tree<A, V>, automata: AbstractAutomaton<S, A, E>, state: S): (V & E)[];
