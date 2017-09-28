/**
 * @file Tree.ts
 * @desc A Tree data structure.
 */

export interface Tree<A, V> {
    node: A;
    children: Tree<A, V>[];
    data: V[];
}

export function insert<A, V>(tree: Tree<A, V>, token: A[], data?: V) {
    if (token.length > 0) {
        const currentSymbol = token.shift();
        let branch = tree.children.find(child => (child.node == currentSymbol));
        if (branch === undefined) {
            branch = {node: currentSymbol, children: [], data: []};
            tree.children.push(branch)
        }
        insert(branch, token, data);
    } else if (data){
        tree.data.push(data)
    }
    return tree;
}

export function sortedInsert<A, V>(comparisonFunc: ((obj1: A, obj2: A) => number), tree: Tree<A, V>, token: A[], data?: V) {
    if (token.length > 0) {
        const currentSymbol = token.shift();
        const potIndex = findObjectIndexInSortedArray<A>(currentSymbol, tree.children.map(x => x.node), comparisonFunc);
        if (!potIndex.exists) {
            tree.children = [...tree.children.slice(0, potIndex.index), {node: currentSymbol, children: [], data: []}, ...tree.children.slice(potIndex.index)];
        }
        sortedInsert(comparisonFunc, tree.children[potIndex.index], token, data);
    } else if (data){
        tree.data.push(data)
    }
    return tree;
}

interface PotentialIndex {
    exists: boolean,
    index: number
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
 * @returns {exists: bool, index: number} The index is where the item is or
 * should-be-inserted, exists reflect whether the item is already there.
 */
function findObjectIndexInSortedArray<A>(newObject: A, arrayOfObjects: Array<A>, comparisonFunc: ((obj1: A, obj2: A) => number)): PotentialIndex {
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
        } else if (comparison > 0) {
            // then we should insert our object strictly to the left of mid.
            high = mid;
            // high is an exclusive bound, so we just set high
            // to mid (since we will exclude it automatically).
        } else {
            return {exists: true, index: mid};
        }
    }
    return {exists: false, index: low};
}