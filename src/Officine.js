"use strict";

const { NameNormalizer } = require("./NameNormalizer");
const { RecipeBook, parseQuantityAndName } = require("./RecipeBook");
const { Stock } = require("./Stock");

const BASE_INGREDIENTS = [
    "œil de grenouille",
    "larme de brume funèbre",
    "radicelle de racine hurlante",
    "pincée de poudre de lune",
    "croc de troll",
    "fragment d'écaille de dragonnet",
    "goutte de sang de citrouille"
];

const BASE_RECETTES = {
    "fiole de glaires purulentes": [
        "2 larmes de brume funèbre",
        "1 goutte de sang de citrouille"
    ],
    "bille d'âme évanescente": [
        "3 pincées de poudre de lune",
        "1 œil de grenouille"
    ],
    "soupçon de sels suffocants": [
        "2 crocs de troll",
        "1 fragment d'écaille de dragonnet",
        "1 radicelle de racine hurlante"
    ],
    "baton de pâte sépulcrale": [
        "3 radicelles de racine hurlante",
        "1 fiole de glaires purulentes"
    ],
    "bouffée d'essence de cauchemar": [
        "2 pincées de poudre de lune",
        "2 larmes de brume funèbre"
    ]
};

class Officine {
    constructor(options = {}) {
        const ingredients = options.ingredients || BASE_INGREDIENTS;
        const recettesObj = options.recettes || BASE_RECETTES;
        this.normalizer = new NameNormalizer();
        this.recipeBook = new RecipeBook(recettesObj);
        const { aliasToCanonical, ingredientSet, potionSet } = this.normalizer.buildAliasMap(ingredients, recettesObj);
        this.aliasToCanonical = aliasToCanonical;
        this.ingredientSet = ingredientSet;
        this.potionSet = potionSet;
        this.stock = new Stock([...ingredients, ...Object.keys(recettesObj)]);
    }

    _resolveCanonical(name) {
        const key = this.normalizer.normalize(name);
        const canonical = this.aliasToCanonical.get(key);
        if (!canonical) throw new Error(`Nom inconnu: ${name}`);
        return canonical;
    }

    _isIngredient(canonical) {
        return this.ingredientSet.has(canonical);
    }

    _isPotion(canonical) {
        return this.potionSet.has(canonical);
    }

    rentrer(spec) {
        const { qty, name } = parseQuantityAndName(spec);
        const canonical = this._resolveCanonical(name);
        if (!this._isIngredient(canonical)) {
            throw new Error("Seuls les ingrédients peuvent être rentrés en stock");
        }
        return this.stock.add(canonical, qty);
    }

    quantite(name) {
        const canonical = this._resolveCanonical(name);
        return this.stock.get(canonical);
    }

    preparer(spec) {
        const { qty: requested, name } = parseQuantityAndName(spec);
        const potion = this._resolveCanonical(name);
        if (!this._isPotion(potion)) throw new Error("On ne peut préparer que des potions");
        const recette = this.recipeBook.getRequirements(potion);
        if (!recette) return 0;

        let maxPossible = Infinity;
        for (const [reqName, perQty] of recette.entries()) {
            const canonicalReq = this._resolveCanonical(reqName);
            const available = this.stock.get(canonicalReq);
            const canDo = Math.floor(available / perQty);
            if (canDo < maxPossible) maxPossible = canDo;
        }
        const toMake = Math.max(0, Math.min(requested, isFinite(maxPossible) ? maxPossible : 0));
        if (toMake === 0) return 0;

        for (const [reqName, perQty] of recette.entries()) {
            const canonicalReq = this._resolveCanonical(reqName);
            const need = perQty * toMake;
            this.stock.consume(canonicalReq, need);
        }

        this.stock.add(potion, toMake);
        return toMake;
    }
}

module.exports = { Officine, BASE_INGREDIENTS, BASE_RECETTES };


