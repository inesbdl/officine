"use strict";

class Stock {
    constructor(initialKeys = []) {
        this.map = new Map();
        for (const k of initialKeys) this.map.set(k, 0);
    }

    add(name, qty) {
        this.map.set(name, (this.map.get(name) || 0) + qty);
        return this.map.get(name);
    }

    get(name) {
        return this.map.get(name) || 0;
    }

    consume(name, qty) {
        const have = this.get(name);
        if (have < qty) throw new Error(" Stock insuffisant");
        this.map.set(name, have - qty);
    }
}

module.exports = { Stock };


