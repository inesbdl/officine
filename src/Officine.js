"use strict";

const { RecipeBook, parseQuantityAndName } = require("./RecipeBook");
const { Stock } = require("./Stock");

const BASE_INGREDIENTS = [
    "oeil/yeux de grenouille",
    "larme/larmes de brume funèbre",
    "radicelle/radicelles de racine hurlante",
    "pincée/pincées de poudre de lune",
    "croc/crocs de troll",
    "fragment/fragments d'écaille de dragonnet",
    "goutte/gouttes de sang de citrouille"
]

const BASE_RECETTES = {
    "fiole/fioles de glaires purulentes": [
        "2 larmes de brume funèbre",
        "1 goutte de sang de citrouille"
    ],
    "bille/billes d'âme évanescente": [
        "3 pincées de poudre de lune",
        "1 oeil de grenouille"
    ],
    "soupçon/soupçons de sels suffocants": [
        "2 crocs de troll",
        "1 fragment d'écaille de dragonnet",
        "1 radicelle de racine hurlante"
    ],
    "baton/batons de pâte sépulcrale": [
        "3 radicelles de racine hurlante",
        "1 fiole de glaires purulentes"
    ],
    "bouffée/bouffées d'essence de cauchemar": [
        "2 pincées de poudre de lune",
        "2 larmes de brume funèbre"
    ]
}

class Officine {
    constructor() {
        this.alias = new Map()
        this.ingredients = new Set()
        this.potions = new Set()

        for (const item of BASE_INGREDIENTS) {
            this._register(item, this.ingredients)
        }

        for (const item of Object.keys(BASE_RECETTES)) {
            this._register(item, this.potions)
        }

        this.recipeBook = new RecipeBook(BASE_RECETTES, (t) => this._normalize(t))

        this.stock = new Stock([...this.ingredients, ...this.potions])
    }

    _normalize(text) {
        return text
            .replace(/œ/g, "oe")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim()
    }

    _register(text, targetSet) {
        if (text.includes("/")) {
            const [left, rightRaw] = text.split("/")
            const singWord = left.trim()
            const right = rightRaw.trim()
            const firstSpace = right.indexOf(" ")

            let plurWord = right
            let suffix = ""
            if (firstSpace !== -1) {
                plurWord = right.substring(0, firstSpace)
                suffix = right.substring(firstSpace)
            }

            if (targetSet === this.potions) {
                const canonical = this._normalize(singWord)
                const aliasSingBare = canonical
                const aliasPlurBare = this._normalize(plurWord)
                const aliasSingFull = this._normalize(singWord + suffix)
                const aliasPlurFull = this._normalize(plurWord + suffix)

                targetSet.add(canonical)
                this.alias.set(aliasSingBare, canonical)
                this.alias.set(aliasPlurBare, canonical)
                this.alias.set(aliasSingFull, canonical)
                this.alias.set(aliasPlurFull, canonical)
            } else {
                const singularFull = singWord + suffix
                const pluralFull = plurWord + suffix

                const canonical = this._normalize(singularFull)
                const sNorm = canonical
                const pNorm = this._normalize(pluralFull)

                targetSet.add(canonical)
                this.alias.set(sNorm, canonical)
                this.alias.set(pNorm, canonical)
            }
            return
        }

        const norm = this._normalize(text)
        targetSet.add(norm)
        this.alias.set(norm, norm)
    }

    _resolve(name) {
        const n = this._normalize(name)
        const res = this.alias.get(n)
        if (!res) {
            throw new Error(`Nom inconnu: ${name}`)
        }
        return res
    }

    rentrer(spec) {
        const { qty, name } = parseQuantityAndName(spec)
        const canonical = this._resolve(name)

        if (!this.ingredients.has(canonical)) {
            throw new Error("Seuls les ingrédients peuvent être rentrés en stock")
        }

        this.stock.add(canonical, qty)
    }

    quantite(name) {
        const canonical = this._resolve(name)
        return this.stock.get(canonical)
    }

    preparer(spec) {
        const { qty: requested, name } = parseQuantityAndName(spec)
        const canonicalPotion = this._resolve(name)

        if (!this.potions.has(canonicalPotion)) {
            throw new Error("On ne peut préparer que des potions")
        }

        const recette = this.recipeBook.getRequirements(canonicalPotion)
        if (!recette) {
            return 0
        }

        let maxPossible = Infinity
        for (const [reqNameNorm, perQty] of recette.entries()) {
            const canonicalReq = this._resolve(reqNameNorm)
            const available = this.stock.get(canonicalReq)
            const canDo = Math.floor(available / perQty)
            if (canDo < maxPossible) {
                maxPossible = canDo
            }
        }

        const toMake = Math.max(
            0,
            Math.min(requested, Number.isFinite(maxPossible) ? maxPossible : 0)
        )

        if (toMake === 0) {
            return 0
        }

        for (const [reqNameNorm, perQty] of recette.entries()) {
            const canonicalReq = this._resolve(reqNameNorm)
            const need = perQty * toMake
            this.stock.consume(canonicalReq, need)
        }

        this.stock.add(canonicalPotion, toMake)
        return toMake
    }
}

module.exports = { Officine, BASE_INGREDIENTS, BASE_RECETTES };
