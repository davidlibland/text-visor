"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file Tree.ts
 * @desc A Tree data structure.
 */
const AbstractAutomata_1 = require("./AbstractAutomata");
const Accumulator_1 = require("./Accumulator");
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
function buildSortedTreeFromSortedPaths(root, ...wrappedPaths) {
    const reducer = (tree, wrappedPath) => lazyInsert(tree, wrappedPath.nodePath, wrappedPath.data);
    return wrappedPaths.reduce(reducer, { node: root, children: [], data: [] });
}
exports.buildSortedTreeFromSortedPaths = buildSortedTreeFromSortedPaths;
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
function buildSortedTreeFromPaths(root, ...wrappedPaths) {
    const reducer = (tree, wrappedPath) => sortedInsert(tree, wrappedPath.nodePath, wrappedPath.data);
    return wrappedPaths.reduce(reducer, { node: root, children: [], data: [] });
}
exports.buildSortedTreeFromPaths = buildSortedTreeFromPaths;
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
function buildTreeFromPaths(root, ...wrappedPaths) {
    const reducer = (tree, wrappedPath) => insert(tree, wrappedPath.nodePath, wrappedPath.data);
    return wrappedPaths.reduce(reducer, { node: root, children: [], data: [] });
}
exports.buildTreeFromPaths = buildTreeFromPaths;
function insert(tree, token, data) {
    if (token.length > 0) {
        const currentSymbol = token[0];
        let branch = tree.children.find((child) => (child.node === currentSymbol));
        if (branch === undefined) {
            branch = { node: currentSymbol, children: [], data: [] };
            tree.children.push(branch);
        }
        insert(branch, token.slice(1), data);
    }
    else if (data) {
        tree.data.push(data);
    }
    return tree;
}
exports.insert = insert;
function sortedInsert(tree, token, data, comparisonFunc = stdComparisonFunc) {
    if (token.length > 0) {
        const currentSymbol = token[0];
        const childNodes = tree.children.map((x) => x.node);
        const potIndex = findObjectIndexInSortedArray(currentSymbol, childNodes, comparisonFunc);
        if (!potIndex.exists) {
            const leftChildren = tree.children.slice(0, potIndex.index);
            const rightChildren = tree.children.slice(potIndex.index);
            const newChild = { node: currentSymbol, children: [], data: [] };
            tree.children = [...leftChildren, newChild, ...rightChildren];
        }
        sortedInsert(tree.children[potIndex.index], token.slice(1), data, comparisonFunc);
    }
    else if (data) {
        tree.data.push(data);
    }
    return tree;
}
exports.sortedInsert = sortedInsert;
const stdComparisonFunc = (a, b) => {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
};
function lazyInsert(tree, token, data) {
    if (token.length > 0) {
        const currentSymbol = token[0];
        let branch;
        if (tree.children.length > 0 ? tree.children[tree.children.length - 1].node === currentSymbol : false) {
            branch = tree.children[tree.children.length - 1];
        }
        else {
            branch = { node: currentSymbol, children: [], data: [] };
            tree.children.push(branch);
        }
        lazyInsert(branch, token.slice(1), data);
    }
    else if (data) {
        tree.data.push(data);
    }
    return tree;
}
exports.lazyInsert = lazyInsert;
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
function findObjectIndexInSortedArray(newObject, arrayOfObjects, comparisonFunc) {
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
        }
        else if (comparison > 0) {
            // then we should insert our object strictly to the left of mid.
            high = mid;
            // high is an exclusive bound, so we just set high
            // to mid (since we will exclude it automatically).
        }
        else {
            return { exists: true, index: mid };
        }
    }
    return { exists: false, index: low };
}
function automatonTreeSearch(tree, automata, state) {
    const addStatusToData = (data, internalState) => data.map((dataPt) => Object.assign({}, automata.status(internalState), dataPt));
    const isAcceptedState = (internalState) => (automata.status(internalState).status === AbstractAutomata_1.STATUS_TYPE.ACCEPT);
    const isNotRejectedState = (internalState) => (automata.status(internalState).status !== AbstractAutomata_1.STATUS_TYPE.REJECT);
    const localSearchResult = isAcceptedState(state) ? addStatusToData(tree.data, state) : [];
    return tree.children
        .map((child) => ({ child, state: automata.step(state, child.node) }))
        .filter((childAndState) => isNotRejectedState(childAndState.state))
        .map((childAndState) => automatonTreeSearch(childAndState.child, automata, childAndState.state))
        .reduce((results, result) => results.concat(result), localSearchResult);
}
exports.automatonTreeSearch = automatonTreeSearch;
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
function abortableAutomatonTreeSearch(tree, automata, state, abortCallback, checkCount = 1, counter = 0) {
    const addStatusToData = (data, internalState) => data.map((dataPt) => Object.assign({}, automata.status(internalState), dataPt));
    const isAcceptedState = (internalState) => (automata.status(internalState).status === AbstractAutomata_1.STATUS_TYPE.ACCEPT);
    const isNotRejectedState = (internalState) => (automata.status(internalState).status !== AbstractAutomata_1.STATUS_TYPE.REJECT);
    const localSearchResult = isAcceptedState(state) ? addStatusToData(tree.data, state) : [];
    const subcomputation = () => {
        const resultsA = tree.children
            .map((child) => ({
            child,
            state: automata.step(state, child.node),
        }))
            .filter((childAndState) => isNotRejectedState(childAndState.state))
            .map((childAndState) => abortableAutomatonTreeSearch(childAndState.child, automata, childAndState.state, abortCallback, checkCount, counter + 1));
        return Accumulator_1.nowAccumulator([]).concat(...resultsA, Accumulator_1.nowAccumulator(localSearchResult));
    };
    if (counter % checkCount === 0) {
        return Accumulator_1.futureAccumulator((resolve) => {
            setImmediate(() => {
                if (!abortCallback()) {
                    subcomputation().fold(resolve);
                }
                else {
                    resolve([]);
                }
            });
        });
    }
    else {
        return subcomputation();
    }
}
exports.abortableAutomatonTreeSearch = abortableAutomatonTreeSearch;
//# sourceMappingURL=Tree.js.map