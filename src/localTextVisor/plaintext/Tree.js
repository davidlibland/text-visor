"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file Tree.ts
 * @desc A Tree data structure.
 */
const AbstractAutomata_1 = require("./AbstractAutomata");
function insert(tree, token, data) {
    if (token.length > 0) {
        const currentSymbol = token.shift();
        let branch = tree.children.find(child => (child.node == currentSymbol));
        if (branch === undefined) {
            branch = { node: currentSymbol, children: [], data: [] };
            tree.children.push(branch);
        }
        insert(branch, token, data);
    }
    else if (data) {
        tree.data.push(data);
    }
    return tree;
}
exports.insert = insert;
function sortedInsert(tree, token, data, comparisonFunc = stdComparisonFunc) {
    if (token.length > 0) {
        const currentSymbol = token.shift();
        const potIndex = findObjectIndexInSortedArray(currentSymbol, tree.children.map(x => x.node), comparisonFunc);
        if (!potIndex.exists) {
            tree.children = [...tree.children.slice(0, potIndex.index), { node: currentSymbol, children: [], data: [] }, ...tree.children.slice(potIndex.index)];
        }
        sortedInsert(tree.children[potIndex.index], token, data, comparisonFunc);
    }
    else if (data) {
        tree.data.push(data);
    }
    return tree;
}
exports.sortedInsert = sortedInsert;
let stdComparisonFunc = (a, b) => {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
};
/**
 * @export @function findNewObjectIndexInSortedArray
 * This function finds the index at which an item is/should-be-inserted
 * in a strictly increasing array.
 * @param newObject
 * @param arrayOfObjects
 * @param comparisonFunc Compares two objects with respect to an order.
 * Returns -1 if the first object is smaller than the second, 1 if the
 * second object is smaller, and 0 otherwise.
 * @returns {exists: bool, index: number} The index is where the item is or
 * should-be-inserted, exists reflect whether the item is already there.
 */
function findObjectIndexInSortedArray(newObject, arrayOfObjects, comparisonFunc) {
    let low = 0;
    let high = arrayOfObjects.length;
    while (low < high) {
        let mid = (low + high) >> 1; //divide by two.
        let comparison = comparisonFunc(arrayOfObjects[mid], newObject);
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
    const addStatusToData = (data, state) => data.map(dataPt => Object.assign({}, automata.status(state), dataPt));
    const isAcceptedState = (state) => (automata.status(state).status === AbstractAutomata_1.STATUS_TYPE.ACCEPT);
    const isNotRejectedState = (state) => (automata.status(state).status !== AbstractAutomata_1.STATUS_TYPE.REJECT);
    return tree.children.map((child) => ({
        child: child,
        state: automata.step(state, child.node)
    })).filter((childAndState) => isNotRejectedState(childAndState.state)).map((childAndState) => automatonTreeSearch(childAndState.child, automata, childAndState.state)).reduce((results, result) => results.concat(result), isAcceptedState(state) ? addStatusToData(tree.data, state) : []);
}
exports.automatonTreeSearch = automatonTreeSearch;
//# sourceMappingURL=Tree.js.map