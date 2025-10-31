"use strict";

const assert = require("assert");
const { Officine } = require("../src/Officine");

function run(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (err) {
        console.error(`✗ ${name}`);
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

run("rentrer et quantite gèrent singulier/pluriel/accents", () => {
    const o = new Officine();
    assert.strictEqual(o.quantite("œil de grenouille"), 0);
    o.rentrer("3 yeux de grenouille");
    assert.strictEqual(o.quantite("œil de grenouille"), 3);
    assert.strictEqual(o.quantite("yeux de grenouille"), 3);
});

run("preparer limite la production selon le stock", () => {
    const o = new Officine();
    o.rentrer("6 larmes de brume funèbre");
    o.rentrer("2 gouttes de sang de citrouille");
    const made = o.preparer("3 fioles de glaires purulentes");
    assert.strictEqual(made, 2);
    assert.strictEqual(o.quantite("fiole de glaires purulentes"), 2);
    assert.strictEqual(o.quantite("larme de brume funebre"), 2);
    assert.strictEqual(o.quantite("goutte de sang de citrouille"), 0);
});

run("preparer ne fabrique pas automatiquement les sous-potions", () => {
    const o = new Officine();
    o.rentrer("3 radicelles de racine hurlante");
    const made = o.preparer("1 baton de pâte sépulcrale");
    assert.strictEqual(made, 0);
    assert.strictEqual(o.quantite("baton de pâte sépulcrale"), 0);
});

run("preparer avec quantité 0 ne change rien", () => {
    const o = new Officine();
    const made = o.preparer("0 fioles de glaires purulentes");
    assert.strictEqual(made, 0);
    assert.strictEqual(o.quantite("fiole de glaires purulentes"), 0);
});

run("grandes quantités limitées par le stock disponible", () => {
    const o = new Officine();
    o.rentrer("1000 larmes de brume funèbre");
    o.rentrer("1 goutte de sang de citrouille");
    const made = o.preparer("1000 fioles de glaires purulentes");
    assert.strictEqual(made, 1);
    assert.strictEqual(o.quantite("fiole de glaires purulentes"), 1);
});

run("rentrer rejette une entrée non-string", () => {
    const o = new Officine();
    expectThrows(() => o.rentrer(123), "Entrée invalide");
});

run("rentrer rejette un format invalide", () => {
    const o = new Officine();
    expectThrows(() => o.rentrer("abc"), "Format attendu");
});

run("rentrer rejette une quantité négative", () => {
    const o = new Officine();
    expectThrows(() => o.rentrer("-1 yeux de grenouille"), "Quantité invalide");
});

run("quantite avec nom inconnu lève une erreur", () => {
    const o = new Officine();
    expectThrows(() => o.quantite("coucou"), "Nom inconnu");
});

run("preparer sur un ingrédient lève une erreur", () => {
    const o = new Officine();
    expectThrows(() => o.preparer("1 œil de grenouille"), "On ne peut préparer que des potions");
});

run("preparer avec nom inconnu lève une erreur", () => {
    const o = new Officine();
    expectThrows(() => o.preparer("1 potion inconnue"), "Nom inconnu");
});

run("preparer consomme exactement le stock requis", () => {
    const o = new Officine();
    o.rentrer("4 larmes de brume funèbre");
    o.rentrer("2 gouttes de sang de citrouille");
    const made = o.preparer("2 fioles de glaires purulentes");
    assert.strictEqual(made, 2);
    assert.strictEqual(o.quantite("fiole de glaires purulentes"), 2);
    assert.strictEqual(o.quantite("larme de brume funèbre"), 0);
    assert.strictEqual(o.quantite("goutte de sang de citrouille"), 0);
});


