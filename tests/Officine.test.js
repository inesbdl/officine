"use strict";

const assert = require("assert");
const { Officine } = require("../src/Officine");

function runTest(name, fn) {
    try {
        fn();
        console.log(`OK :  ${name}`);
    } catch (err) {
        console.error(`PAS OK ${name}`);
        console.error(err && err.stack ? err.stack : err);
        process.exitCode = 1;
    }
}

function expectThrows(fn, messageIncludes) {
    let threw = false;
    try {
        fn();
    } catch (e) {
        threw = true;
        if (messageIncludes) {
            assert.ok(String(e.message || e).includes(messageIncludes), `Message d'erreur attendu contenant: ${messageIncludes}, reçu: ${e.message || e}`);
        }
    }
    assert.ok(threw, "Une exception était attendue");
}

runTest("rentrer des quantités", () => {
    const officine = new Officine();
    assert.strictEqual(officine.quantite("oeil de grenouille"), 0);
    officine.rentrer("3 yeux de grenouille");
    assert.strictEqual(officine.quantite("oeil de grenouille"), 3);
    assert.strictEqual(officine.quantite("yeux de grenouille"), 3);
});

