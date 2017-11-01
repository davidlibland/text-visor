/**
 * @file Tree.ts
 * @desc A Tree data structure.
 */
import { AbstractAutomaton, StatusContainer } from "./AbstractAutomata";
export interface Tree<A, V> {
    node: A;
    children: Array<Tree<A, V>>;
    data: V[];
}
/**
 * @function buildSortedTreeFromSortedPaths
 * @desc This function assumes that wrappedPaths has been sorted
 * lexicographically by nodePath, and builds a tree from the wrapped paths
 * significantly faster than buildSortedTreeFromPaths or buildTreeFromPaths.
 * However, if wrappedPaths have not been sorted, the resulting tree will be
 * incorrectly built. Complexity is O(nm) on the number n of the wrappedPaths,
 * and max-length m of a nodePath.
 * @param {A} root The node label for the root of the tree.
 * @param {Array<{nodePath: A[]; data?: V}>} wrappedPaths A (sorted) list of nodePaths
 * along with associated data. For each wrappedPath, the resulting tree will
 * contain the specified nodePath (from the root) and the associated data will
 * be placed at that node in the tree.
 * @returns {Tree<A, V>}
 */
export declare function buildSortedTreeFromSortedPaths<A, V>(root: A, ...wrappedPaths: Array<{
    nodePath: A[];
    data?: V;
}>): Tree<A, V>;
/**
 * @function buildSortedTreeFromPaths
 * @desc This function builds a tree from the wrapped paths
 * significantly faster than buildTreeFromPaths by doing a sorted insert, it is
 * assumed that the data type A is totally ordered with the comparisons
 * operators >, <.
 * Complexity is O(nmln(k)) on the number n of the wrappedPaths,
 * max-length m of a nodePath, and size k of the symbol set. Heuristically, n is
 * on the order of k^m, so that the complexity is roughly O(nln(n)), the same as
 * a sort.
 * @param {A} root The node label for the root of the tree.
 * @param {Array<{nodePath: A[]; data?: V}>} wrappedPaths A list of nodePaths
 * along with associated data. For each wrappedPath, the resulting tree will
 * contain the specified nodePath (from the root) and the associated data will
 * be placed at that node in the tree.
 * @returns {Tree<A, V>}
 */
export declare function buildSortedTreeFromPaths<A, V>(root: A, ...wrappedPaths: Array<{
    nodePath: A[];
    data?: V;
}>): Tree<A, V>;
/**
 * @function buildSortedTreeFromPaths
 * @desc This function builds a tree from the wrapped paths, use this only if
 * data type A is not totally ordered, as it is significantly slower than
 * buildSortedTreeFromPaths.
 * Complexity is O(nmk) on the number n of the wrappedPaths,
 * max-length m of a nodePath, and size k of the symbol set. Average complexity
 * is on the order of n^2.
 * @param {A} root The node label for the root of the tree.
 * @param {Array<{nodePath: A[]; data?: V}>} wrappedPaths A list of nodePaths
 * along with associated data. For each wrappedPath, the resulting tree will
 * contain the specified nodePath (from the root) and the associated data will
 * be placed at that node in the tree.
 * @returns {Tree<A, V>}
 */
export declare function buildTreeFromPaths<A, V>(root: A, ...wrappedPaths: Array<{
    nodePath: A[];
    data?: V;
}>): Tree<A, V>;
export declare function insert<A, V>(tree: Tree<A, V>, token: A[], data?: V): Tree<A, V>;
export declare function sortedInsert<A, V>(tree: Tree<A, V>, token: A[], data?: V, comparisonFunc?: ((obj1: A, obj2: A) => number)): Tree<A, V>;
export declare function lazyInsert<A, V>(tree: Tree<A, V>, token: A[], data?: V): Tree<A, V>;
export declare function automatonTreeSearch<S, A, V extends object, E extends StatusContainer = StatusContainer>(tree: Tree<A, V>, automata: AbstractAutomaton<S, A, E>, state: S): Array<V & E>;
export declare function cancelableAutomatonTreeSearch<S, A, V extends object, E extends StatusContainer = StatusContainer>(tree: Tree<A, V>, automata: AbstractAutomaton<S, A, E>, state: S, cancelCallback: () => boolean): Promise<Array<V & E>>;
