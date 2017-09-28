/**
 * @file Tree.ts
 * @desc A Tree data structure.
 */
export interface Tree<A, V> {
    node: A;
    children: Tree<A, V>[];
    data: V[];
}
export declare function insert<A, V>(tree: Tree<A, V>, token: A[], data?: V): Tree<A, V>;
export declare function sortedInsert<A, V>(comparisonFunc: ((obj1: A, obj2: A) => number), tree: Tree<A, V>, token: A[], data?: V): Tree<A, V>;
