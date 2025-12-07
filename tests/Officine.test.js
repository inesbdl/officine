"use strict";

const assert = require("assert");
const { Officine } = require("../src/Officine");
// couleurs terminal sinon ilisisble
const chalk = require("chalk");

function runTest(name, fn) {
    try {
        fn();
        console.log(chalk.green("OK" + ` |  ${name}`))
    } catch (err) {
        console.error(chalk.red("PAS OK" + ` | ${name}`))
        console.error(chalk.red(err) )
        process.exitCode = 1
    }
}


// function runTest(name, fn) {
//     try {
//         fn()
//         console.log(`OK |  ${name}`)
//     } catch (err) {
//         console.error(`PAS OK | ${name}`)
//         console.error(err && err.stack ? err.stack : err)
//         process.exitCode = 1
//     }
// }

// Test de base
runTest("test singulier pluriel", () => {
    const officine = new Officine()
    assert.strictEqual(officine.quantite("oeil de grenouille"), 0)
    officine.rentrer("3 yeux de grenouille")
    assert.strictEqual(officine.quantite("oeil de grenouille"), 3)
    assert.strictEqual(officine.quantite("yeux de grenouille"), 3)
})

// Test si ça marche avec les accents aussi
runTest("accents", () => {
    const officine = new Officine()
    officine.rentrer("6 larmes de brume funèbre")
    officine.rentrer("2 gouttes de sang de citrouille")
    const made = officine.preparer("3 fioles de glaires purulentes")
    assert.strictEqual(made, 2)
    assert.strictEqual(officine.quantite("fiole de glaires purulentes"), 2)
    assert.strictEqual(officine.quantite("larme de brume funebre"), 2)
    assert.strictEqual(officine.quantite("goutte de sang de citrouille"), 0)
})

runTest("pas assez d'ingrédients pour les sous potions", () => {
    const officine = new Officine()
    officine.rentrer("3 radicelles de racine hurlante")
    const made = officine.preparer("1 baton de pâte sépulcrale")
    assert.strictEqual(made, 0)
    assert.strictEqual(officine.quantite("baton de pâte sépulcrale"), 0)
})

runTest("preparer 0 fioles", () => {
    const officine = new Officine()
    const made = officine.preparer("0 fioles de glaires purulentes")
    assert.strictEqual(made, 0)
    assert.strictEqual(officine.quantite("fiole de glaires purulentes"), 0)
})


runTest("limite par ingredient manquant", () => {
    const officine = new Officine()
    officine.rentrer("999999 larmes de brume funèbre")
    officine.rentrer("1 goutte de sang de citrouille")
    const made = officine.preparer("1000 fioles de glaires purulentes")
    assert.strictEqual(made, 1)
    assert.strictEqual(officine.quantite("fiole de glaires purulentes"), 1)
})

// tests validation ds entrées
runTest("rentrer nombre au lieu de string", () => {
    const officine = new Officine()
    let erreur = false
    try {
        officine.rentrer(123)
    } catch(e) {
        erreur = true
        assert.ok(e.message.includes("Entrée invalide"))
    }
    assert.ok(erreur)
})

runTest("format invalide", () => {
    const officine = new Officine()
    let erreur = false
    try {
        officine.rentrer("aze")
    } catch(e) {
        erreur = true
        assert.ok(e.message.includes("Format attendu"))
    }
    assert.ok(erreur)
})

runTest("quantité negative", () => {
    const officine = new Officine()
    try {
        officine.rentrer("-1 oeil de grenouille")
        assert.fail("devrait lever une erreur")
    } catch(e) {
        assert.ok(e.message.includes("Quantité invalide"))
    }
})

runTest("nom inconnu dans quantite", () => {
    const officine = new Officine()
    try {
        officine.quantite("coucou")
        assert.fail("devrait lever une erreur")
    } catch(e) {
        assert.ok(e.message.includes("Nom inconnu"))
    }
})

runTest("preparer un ingredient", () => {
    const officine = new Officine()
    try {
        officine.preparer("1 oeil de grenouille")
        assert.fail("devrait pas pouvoir préparer un ingrédient")
    } catch(e) {
        assert.ok(e.message.includes("On ne peut préparer que des potions pas des ingredients"))
    }
})

runTest("preparer potion inconnue", () => {
    const officine = new Officine()
    try {
        officine.preparer("1 potion inconnue")
        assert.fail()
    } catch(e) {
        assert.ok(e.message.includes("Nom inconnu"))
    }
})

// Test gestion dse stocks
runTest("gestion stock", () => {
    const officine = new Officine()
    officine.rentrer("4 larmes de brume funèbre")
    officine.rentrer("2 gouttes de sang de citrouille")
    const made = officine.preparer("2 fioles de glaires purulentes")
    assert.strictEqual(made, 2)
    assert.strictEqual(officine.quantite("fiole de glaires purulentes"), 2)
    assert.strictEqual(officine.quantite("larme de brume funèbre"), 0)
    assert.strictEqual(officine.quantite("goutte de sang de citrouille"), 0)
})