"use strict";

function parseQuantityAndName(raw) {
    if (typeof raw !== "string") throw new Error("entree invalide");
    const cleaned = raw.trim();
    const m = cleaned.match(/^(\d+)\s+(.+)$/);
    if (!m) throw new Error("Format attendu: 'nombre nom'");
    const qty = parseInt(m[1], 10);
    if (!Number.isFinite(qty) || qty < 0) throw new Error("qte invalide");
    const name = m[2].trim();
    return { qty, name };
}

class RecipeBook {
    constructor(recipesObject) {
        this.compiled = new Map();
        for (const [potionName, reqList] of Object.entries(recipesObject)) {
            const needs = new Map();
            for (const item of reqList) {
                const { qty, name } = parseQuantityAndName(item);
                needs.set(name.trim(), (needs.get(name.trim()) || 0) + qty);
            }
            this.compiled.set(potionName, needs);
        }
    }

    getRequirements(potionName) {
        return this.compiled.get(potionName);
    }
}

module.exports = { RecipeBook, parseQuantityAndName };


