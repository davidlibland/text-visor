"use strict";
/**
 * @file BasicQWERTYCost.ts
 * @desc A basic implementation of a qwerty cost module.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const LevenshteinAutomata_1 = require("./LevenshteinAutomata");
class DetailedBalanceCostModule extends LevenshteinAutomata_1.FlatLevenshteinRelativeCostModule {
    /**
     * @desc We assume that the process of editing an incorrect prefix to the
     * correct one can be modeled via a transition matrix which satisfies
     * detailed balance, where the states labels are the symbols in the
     * alphabet, and the steady state is the frequency of symbols in correct
     * text. In more detail, if Aij is the transition probability
     * (the likelihood that the editor correct a symbol j to a symbol i), and Pj
     * is the frequency of symbol j in correct text, then detailed balance is:
     *             Pi Aij = Pj Aji
     * In particular, Qij := Aij/Pj is a symmetric matrix.
     *
     * In this framework, the parameter symbolPairCosts corresponds to
     * -log(Q), while the parameter symbolCosts corresponds to -log(P).
     * The swap cost for i->j
     * is modeled as -log(Qij * Pj), while the insertion cost for i is modeled as
     * -log(Pi) (i.e. insertion frequency for symbol i is proportional to the
     * frequence of symbol i in the text). Detailed balance (for the transitions
     * between symbol i and no-symbol) then implies that the deletion cost is
     * constant (i.e. incorrect characters are all equally likely).
     *
     * Constraints:
     * 1) We assume that symbolPairCosts is symmetric
     * (i.e. invariant with respect to the swap:
     * [key1,key2, cost] => [key2, key1, cost]).
     * 2) We assume that all costs have been normalized to be non-negative.
     * @param {number} relativeAcceptanceThreshold
     * @param {number} rejectCostThreshold
     * @param {Array<PairCostElement<A>>} symbolPairCosts
     * @param {Array<CostElement<A>>} symbolCosts The costs
     * correspond to the negative log frequency of the symbols in correct text.
     * @param {number} defaultCost To be used when no cost is specified
     * @param {number} swapScaleUnit
     * @param {number} insertScaleUnit
     * @param {number} deleteScaleUnit
     */
    constructor(relativeAcceptanceThreshold, rejectCostThreshold, symbolPairCosts, symbolCosts, defaultCost, swapScaleUnit = 1, insertScaleUnit = 1, deleteScaleUnit = 1) {
        super(relativeAcceptanceThreshold, rejectCostThreshold);
        const averageCost = Math.ceil([
            ...symbolPairCosts.map(([key1, key2, cost]) => cost),
            ...symbolCosts.map(([key, cost]) => cost),
        ].reduce((avg, cost, i) => ((cost + avg * i) / (i + 1)), 0));
        this.symbolPairCostMap = new Map(symbolPairCosts
            .map(([key1, key2, cost]) => [[key1, key2], cost]));
        this.symbolCostMap = new Map(symbolCosts);
        this.defaultCost = defaultCost !== undefined ? defaultCost : averageCost;
        this.swapScaleUnit = swapScaleUnit;
        this.insertScaleUnit = insertScaleUnit;
        this.deleteScaleUnit = deleteScaleUnit;
        this.validateCosts();
    }
    /**
     * @public
     * @method swapCost
     * @desc this is the cost of swapping alpha for beta; must be non-negative.
     * @param {A} alpha
     * @param {A} beta
     * @returns {number}
     */
    swapCost(alpha, beta) {
        if (alpha === beta) {
            return 0;
        }
        const transitionCost = this.symbolPairCostMap.has([alpha, beta]) ?
            this.symbolPairCostMap.get([alpha, beta]) : this.defaultCost;
        const targetCost = this.symbolCostMap.has(beta) ?
            this.symbolCostMap.get(beta) : this.defaultCost;
        const cost = transitionCost + targetCost;
        return alpha === beta ? 0 : Math.max(cost * this.swapScaleUnit, 0);
    }
    /**
     * @public
     * @method deleteCost
     * @desc this is the cost of deleting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    deleteCost(alpha) {
        return Math.max(this.defaultCost * this.deleteScaleUnit, 0);
    }
    /**
     * @public
     * @method insertCost
     * @desc this is the cost of inserting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    insertCost(alpha) {
        const cost = this.symbolCostMap.has(alpha) ?
            this.symbolCostMap.get(alpha) : this.defaultCost;
        return Math.max(cost * this.insertScaleUnit, 0);
    }
    /**
     * Ensures symmetry and positivity.
     */
    validateCosts() {
        for (const [[key1, key2], cost] of this.symbolPairCostMap.entries()) {
            if (key1 < key2) {
                this.symbolPairCostMap.set([key2, key1], cost);
            }
            if (cost < 0) {
                throw (new Error("Costs must be Positive."));
            }
        }
        for (const [key, cost] of this.symbolCostMap.entries()) {
            if (cost < 0) {
                throw (new Error("Costs must be Positive."));
            }
        }
    }
}
exports.DetailedBalanceCostModule = DetailedBalanceCostModule;
const qwertyKeyLocs = [
    ["q", -.5, 0],
    ["w", .5, 0],
    ["e", 1.5, 0],
    ["r", 2.5, 0],
    ["t", 3.5, 0],
    ["y", 4.5, 0],
    ["u", 5.5, 0],
    ["i", 6.5, 0],
    ["o", 7.5, 0],
    ["p", 8.5, 0],
    ["a", 0, 1],
    ["s", 1, 1],
    ["d", 2, 1],
    ["f", 3, 1],
    ["g", 4, 1],
    ["h", 5, 1],
    ["j", 6, 1],
    ["k", 7, 1],
    ["l", 8, 1],
    ["z", 1, 2],
    ["x", 2, 2],
    ["c", 3, 2],
    ["v", 4, 2],
    ["b", 5, 2],
    ["n", 6, 2],
    ["m", 7, 2],
];
const cartesianProduct = (array1, array2) => {
    return [].concat(...array1.map((el1) => array2.map((el2) => [el1, el2])));
};
const generateCosts = (keyLocs) => {
    return cartesianProduct(keyLocs, keyLocs)
        .map(([keyLoc1, keyLoc2]) => {
        const [symbol1, x1, y1] = keyLoc1;
        const [symbol2, x2, y2] = keyLoc2;
        const cost = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
        return [symbol1, symbol2, cost];
    });
};
const qwertyCosts = generateCosts(qwertyKeyLocs);
const qwertyIntCosts = qwertyCosts
    .map(([key1, key2, x]) => ([key1, key2, Math.round(x)]));
exports.qwertyIntCostsWithCaseChange = [
    ...qwertyIntCosts,
    ...qwertyIntCosts
        .map(([key1, key2, x]) => ([key1.toUpperCase(), key2, Math.round(x) + 1])),
    ...qwertyIntCosts
        .map(([key1, key2, x]) => ([key1, key2.toUpperCase(), Math.round(x) + 1])),
    ...qwertyIntCosts
        .map(([key1, key2, x]) => ([key1.toUpperCase(), key2.toUpperCase(), Math.round(x)])),
];
const charEnglishPercentages = [
    ["a", 7.52766],
    ["e", 7.0925],
    ["o", 5.17],
    ["r", 4.96032],
    ["i", 4.69732],
    ["s", 4.61079],
    ["n", 4.56899],
    ["1", 4.35053],
    ["t", 3.87388],
    ["l", 3.77728],
    ["2", 3.12312],
    ["m", 2.99913],
    ["d", 2.76401],
    ["0", 2.74381],
    ["c", 2.57276],
    ["p", 2.45578],
    ["3", 2.43339],
    ["h", 2.41319],
    ["b", 2.29145],
    ["u", 2.10191],
    ["k", 1.96828],
    ["4", 1.94265],
    ["5", 1.88577],
    ["g", 1.85331],
    ["9", 1.79558],
    ["6", 1.75647],
    ["8", 1.66225],
    ["7", 1.621],
    ["y", 1.52483],
    ["f", 1.2476],
    ["w", 1.24492],
    ["j", 0.836677],
    ["v", 0.833626],
    ["z", 0.632558],
    ["x", 0.573305],
    ["q", 0.346119],
    ["A", 0.130466],
    ["S", 0.108132],
    ["E", 0.0970865],
    ["R", 0.08476],
    ["B", 0.0806715],
    ["T", 0.0801223],
    ["M", 0.0782306],
    ["L", 0.0775594],
    ["N", 0.0748134],
    ["P", 0.073715],
    ["O", 0.0729217],
    ["I", 0.070908],
    ["D", 0.0698096],
    ["C", 0.0660872],
    ["H", 0.0544319],
    ["G", 0.0497332],
    ["K", 0.0460719],
    ["F", 0.0417393],
    ["J", 0.0363083],
    ["U", 0.0350268],
    ["W", 0.0320367],
    [".", 0.0316706],
    ["!", 0.0306942],
    ["Y", 0.0255073],
    ["*", 0.0241648],
    ["@", 0.0238597],
    ["V", 0.0235546],
    ["-", 0.0197712],
    ["Z", 0.0170252],
    ["Q", 0.0147064],
    ["X", 0.0142182],
    ["_", 0.0122655],
    ["$", 0.00970255],
    ["#", 0.00854313],
    [",", 0.00323418],
    ["/", 0.00311214],
    ["+", 0.00231885],
    ["?", 0.00207476],
    [";", 0.00207476],
    ["^", 0.00195272],
    ["", 0.00189169],
    ["%", 0.00170863],
    ["~", 0.00152556],
    ["=", 0.00140351],
    ["&", 0.00134249],
    ["`", 0.00115942],
    ["\\", 0.00115942],
    [")", 0.00115942],
    ["]", 0.0010984],
    ["[", 0.0010984],
    [":", 0.000549201],
    ["<", 0.000427156],
    ["(", 0.000427156],
    ["æ", 0.000183067],
    [">", 0.000183067],
    ['"', 0.000183067],
    ["ü", 0.000122045],
    ["|", 0.000122045],
    ["{", 0.000122045],
    ["'", 0.000122045],
    ["ö", 6.10223e-05],
    ["ä", 6.10223e-05],
    ["}", 6.10223e-05],
];
const normalizePercentagesToCosts = (charPercentages) => {
    const unNormalizedCharIntCosts = charPercentages
        .map(([char, freq]) => [char, -Math.log(freq * 0.01)]);
    const minIntCost = Math.min(...unNormalizedCharIntCosts.map(([char, cost]) => cost));
    return unNormalizedCharIntCosts.map(([char, cost]) => [char, cost - minIntCost]);
};
exports.charEnglishIntCosts = normalizePercentagesToCosts(charEnglishPercentages)
    .map(([char, cost]) => [char, Math.round(cost)]);
//# sourceMappingURL=DetailedBalancedCost.js.map