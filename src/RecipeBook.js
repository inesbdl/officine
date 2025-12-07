"use strict";

function parseQuantityAndName(raw) {
    if (typeof raw !== "string") {
        throw new Error("Entrée invalide");
    }

    const cleaned = raw.trim();
    const m = cleaned.match(/^(-?\d+)\s+(.+)$/);
    if (!m) {
        throw new Error("Format attendu: 'nombre nom'")
    }

    const qty = parseInt(m[1], 10);
    if (!Number.isFinite(qty) || qty < 0) {
        throw new Error("Quantité invalide")
    }

    const name = m[2].trim();
    return { qty, name };
}

class RecipeBook {
    constructor(recipesObject, normalizer) {
        this.compiled = new Map();
        this.normalizer = normalizer

        for (const [potionName, reqList] of Object.entries(recipesObject)) {
            const needs = new Map();

            for (const item of reqList) {
                const { qty, name } = parseQuantityAndName(item);
                const normalizedReq = this.normalizer(name)
                needs.set(normalizedReq, (needs.get(normalizedReq) || 0) + qty)
            }

            const potionSingular = potionName.split("/")[0].trim();
            const normalizedPotion = this.normalizer(potionSingular)
            this.compiled.set(normalizedPotion, needs);
        }
    }

    getRequirements(normalizedPotionName) {
        return this.compiled.get(normalizedPotionName)
    }
}

module.exports = { RecipeBook, parseQuantityAndName };
