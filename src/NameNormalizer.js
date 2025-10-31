"use strict";

class NameNormalizer {
    normalize(input) {
        if (typeof input !== "string") return "";
        let s = input.trim().toLowerCase();
        s = s.replace(/œ/g, "oe").replace(/Œ/g, "oe");
        s = s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
        s = s.replace(/[’']/g, "'");
        s = s.replace(/[^a-z0-9'\s\-]/g, " ");
        s = s.replace(/\s+/g, " ").trim();
        return s;
    }

    buildAliasMap(ingredientsList, recettes) {
        const aliasToCanonical = new Map();
        const ingredientSet = new Set(ingredientsList);
        const potionSet = new Set(Object.keys(recettes));

        const addAliases = (canonical, customPlural) => {
            const normSing = this.normalize(canonical);
            aliasToCanonical.set(normSing, canonical);
            const firstSpace = canonical.indexOf(" ");
            if (firstSpace > 0) {
                const first = canonical.slice(0, firstSpace);
                const rest = canonical.slice(firstSpace);
                const naivePlural = first + "s" + rest;
                aliasToCanonical.set(this.normalize(naivePlural), canonical);
            }
            if (customPlural) aliasToCanonical.set(this.normalize(customPlural), canonical);
        };

        for (const ing of ingredientsList) {
            if (this.normalize(ing) === this.normalize("œil de grenouille")) {
                addAliases(ing, "yeux de grenouille");
            } else {
                addAliases(ing);
            }
        }

        for (const pot of Object.keys(recettes)) {
            addAliases(pot);
        }

        return { aliasToCanonical, ingredientSet, potionSet };
    }
}

module.exports = { NameNormalizer };


