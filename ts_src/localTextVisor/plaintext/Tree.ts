/**
 * @file Tree.ts
 * @desc A Tree data structure.
 */
import { AbstractAutomaton, STATUS_TYPE, StatusContainer } from "./AbstractAutomata";
import { Accumulator, FutureAccumulator, PresentAccumulator } from "./Accumulator";

interface Tree<A, V> {
    node: A;
    children: Array<Tree<A, V>>;
    data: V[];
}
export default Tree;

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
export function buildSortedTreeFromSortedPaths<A, V>(
    root: A,
    ...wrappedPaths: Array<{nodePath: A[], data?: V}>): Tree<A, V> {
    const reducer = (tree: Tree<A, V>, wrappedPath: {nodePath: A[], data: V}) =>
        lazyInsert(tree, wrappedPath.nodePath, wrappedPath.data);
    return wrappedPaths.reduce<Tree<A, V>>(
        reducer,
        {node: root, children: [], data: []},
    );
}

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
export function buildSortedTreeFromPaths<A, V>(root: A, ...wrappedPaths: Array<{nodePath: A[], data?: V}>): Tree<A, V> {
    const reducer = (tree: Tree<A, V>, wrappedPath: {nodePath: A[], data: V}) =>
        sortedInsert(tree, wrappedPath.nodePath, wrappedPath.data);
    return wrappedPaths.reduce<Tree<A, V>>(
        reducer,
        {node: root, children: [], data: []},
    );
}

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
export function buildTreeFromPaths<A, V>(root: A, ...wrappedPaths: Array<{nodePath: A[], data?: V}>): Tree<A, V> {
    const reducer = (tree: Tree<A, V>, wrappedPath: {nodePath: A[], data: V}) =>
        insert(tree, wrappedPath.nodePath, wrappedPath.data);
    return wrappedPaths.reduce<Tree<A, V>>(
        reducer,
        {node: root, children: [], data: []},
    );
}

export function insert<A, V>(tree: Tree<A, V>, token: A[], data?: V) {
    if (token.length > 0) {
        const currentSymbol = token[0];
        let branch = tree.children.find((child) => (child.node === currentSymbol));
        if (branch === undefined) {
            branch = { node: currentSymbol, children: [], data: [] };
            tree.children.push(branch);
        }
        insert(branch, token.slice(1), data);
    } else if (data) {
        tree.data.push(data);
    }
    return tree;
}

interface PotentialIndex {
    exists: boolean;
    index: number;
}

export function sortedInsert<A, V>(
    tree: Tree<A, V>,
    token: A[],
    data?: V,
    comparisonFunc: ((obj1: A, obj2: A) => number) = stdComparisonFunc) {
    if (token.length > 0) {
        const currentSymbol = token[0];
        const childNodes = tree.children.map((x) => x.node);
        const potIndex = findObjectIndexInSortedArray<A>(currentSymbol, childNodes, comparisonFunc);
        if (!potIndex.exists) {
            const leftChildren = tree.children.slice(0, potIndex.index);
            const rightChildren = tree.children.slice(potIndex.index);
            const newChild = { node: currentSymbol, children: [], data: [] };
            tree.children = [...leftChildren, newChild, ...rightChildren];
        }
        sortedInsert(tree.children[potIndex.index], token.slice(1), data, comparisonFunc);
    } else if (data) {
        tree.data.push(data);
    }
    return tree;
}

const stdComparisonFunc = (a, b) => {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
};

export function lazyInsert<A, V>(tree: Tree<A, V>, token: A[], data?: V) {
    if (token.length > 0) {
        const currentSymbol = token[0];
        let branch;
        if (tree.children.length > 0 ? tree.children[tree.children.length - 1].node === currentSymbol : false) {
            branch = tree.children[tree.children.length - 1];
        } else {
            branch = { node: currentSymbol, children: [], data: [] };
            tree.children.push(branch);
        }
        lazyInsert(branch, token.slice(1), data);
    } else if (data) {
        tree.data.push(data);
    }
    return tree;
}

/**
 * @export @function findNewObjectIndexInSortedArray
 * This function finds the index at which an item is/should-be-inserted
 * in a strictly increasing array.
 * @param newObject
 * @param arrayOfObjects
 * @param comparisonFunc Compares two objects with respect to an order.
 * Returns -1 if the first object is smaller than the second, 1 if the
 * second object is smaller, and 0 otherwise.
 * @returns {PotentialIndex} The index is where the item is or
 * should-be-inserted, exists reflect whether the item is already there.
 */
function findObjectIndexInSortedArray<A>(
    newObject: A,
    arrayOfObjects: A[],
    comparisonFunc: ((obj1: A, obj2: A) => number),
): PotentialIndex {
    let low = 0;
    let high = arrayOfObjects.length;

    while (low < high) {
        const mid = (low + high) >> 1; // divide by two.
        const comparison = comparisonFunc(arrayOfObjects[mid], newObject);
        if (comparison < 0) {
            // then we should insert our object strictly to the right of mid.
            low = mid + 1;
            // low is an inclusive bound, so we add 1 to mid
            // (to ensure we actually skip mid on the next round)
        } else if (comparison > 0) {
            // then we should insert our object strictly to the left of mid.
            high = mid;
            // high is an exclusive bound, so we just set high
            // to mid (since we will exclude it automatically).
        } else {
            return { exists: true, index: mid };
        }
    }
    return { exists: false, index: low };
}

export function automatonTreeSearch<S, A, V extends object, E extends StatusContainer = StatusContainer>(
    tree: Tree<A, V>,
    automata: AbstractAutomaton<S, A, E>,
    state: S): Array<V & E> {
    const addStatusToData = (data: V[], internalState: S) => data.map(
        (dataPt) => Object.assign({}, automata.status(internalState), dataPt),
    );
    const isAcceptedState = (internalState) => (automata.status(internalState).status === STATUS_TYPE.ACCEPT);
    const isNotRejectedState = (internalState) => (automata.status(internalState).status !== STATUS_TYPE.REJECT);
    const localSearchResult = isAcceptedState(state) ? addStatusToData(tree.data, state) : [];
    return tree.children
        .map((child) => ({child, state: automata.step(state, child.node)}))
        .filter((childAndState) => isNotRejectedState(childAndState.state))
        .map((childAndState) => automatonTreeSearch<S, A, V, E>(childAndState.child, automata, childAndState.state))
        .reduce((results, result) => results.concat(result), localSearchResult);
}

/**
 * Performs an automaton tree search which can be aborted midway.
 * @param {Tree<A, V extends Object>} tree The tree to search.
 * @param {AbstractAutomaton<S, A, E extends StatusContainer>} automata
 * The automata to use for the search.
 * @param {S} state The initial state.
 * @param {() => boolean} abortCallback This is a callback which should return
 * true if the computation is to be aborted, false otherwise.
 * @param {number} checkCount The number of steps to take before checking if
 * the computation should be aborted.
 * @param {{i: number}} counter A counter to keep track of how many steps have
 * been taken during the search.
 * @returns {Promise<Array<V & E>>}
 */
export function abortableAutomatonTreeSearch<S, A, V extends object, E extends StatusContainer = StatusContainer>(
    tree: Tree<A, V>,
    automata: AbstractAutomaton<S, A, E>,
    state: S,
    abortCallback: () => boolean,
    checkCount: number = 1,
    counter: number = 0): Accumulator<V & E> {
    const addStatusToData = (data: V[], internalState: S) => data.map(
        (dataPt) => Object.assign({}, automata.status(internalState), dataPt),
    );
    const isAcceptedState = (internalState) => (automata.status(internalState).status === STATUS_TYPE.ACCEPT);
    const isNotRejectedState = (internalState) => (automata.status(internalState).status !== STATUS_TYPE.REJECT);
    const localSearchResult = isAcceptedState(state) ? addStatusToData(tree.data, state) : [];
    const subcomputation = (): Accumulator<V & E> => {
        const resultsA: Array<Accumulator<V & E>> = tree.children
            .map((child) => ({
                child,
                state: automata.step(state, child.node),
            }))
            .filter((childAndState) => isNotRejectedState(childAndState.state))
            .map((childAndState) =>
                abortableAutomatonTreeSearch<S, A, V, E>(
                    childAndState.child,
                    automata,
                    childAndState.state,
                    abortCallback,
                    checkCount,
                    counter + 1,
                    ));
        return new PresentAccumulator([]).concat(...resultsA, new PresentAccumulator(localSearchResult));
    };
    if (counter % checkCount === 0) {
        return new FutureAccumulator<V & E>((resolve) =>
            setImmediate( () => {
                if (!abortCallback()) {
                    subcomputation().fold(resolve);
                } else {
                    resolve([]);
                }
            })
        );
    } else {
        return subcomputation();
    }
}
