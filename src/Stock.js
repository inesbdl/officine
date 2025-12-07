"use strict";

class Stock {
    constructor(items) {
        this.data = new Map();
        for (const item of items) {
            this.data.set(item, 0);
        }
    }

    add(name, qty) {
        this.data.set(name, this.get(name) + qty);
    }

    consume(name, qty) {
        const current = this.get(name);
        if (current < qty) throw new Error("Stock insuffisant");
        this.data.set(name, current - qty);
    }

    get(name) {
        if (!this.data.has(name)) throw new Error("Nom inconnu: " + name);
        return this.data.get(name);
    }
}

module.exports = { Stock };
