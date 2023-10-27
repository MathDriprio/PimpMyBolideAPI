const MySQL = require("mysql");
const { promisify, bind } = require("util");
const Express = require("express");

const app = Express();


app.listen(25286);

const pool = MySQL.createPool({
    connectionLimit: 100,
    host: 'mysql1.par1.adky.net',
    user: 'u17645_RA1rUDbQQd',
    password: 'qw8H.=M^XdkOS6VtF=YMyNy9',
    database: 's17645_PimpMyBolide'
});

pool.query("SELECT 1;", (err, row) => {
    if (err) throw err;
    console.log("Connected to database");
})

let poolAsync = async (query) => promisify(pool.query).bind(pool)(query);

// pool.query("SELECT * FROM `voiture` INNER JOIN marque ON marque.idMarque = voiture.idMarque INNER JOIN type_association ON voiture.idVoiture = type_association.idVoiture;", async (rowErr, row) => {
//     if (rowErr) throw rowErr;
//     let types = await poolAsync("SELECT * FROM type");
//     let voiture = {};
//     new Set(...[row.map(e => e.idVoiture)]).forEach(e => { voiture[e] = row.find(c => c.idVoiture == e) });
//     for (const [idVoiture, voitureInfo] of Object.entries(voiture)) {
//         voiture[idVoiture].types = row.filter(e => e.idVoiture == idVoiture).map(e => types.find(c => c.idType == e.idType).nomType)
//     }
//     for (const [idVoiture, e] of Object.entries(voiture)) {
//         console.log(`${e.nomMarque} ${e.nomVoiture}: ${e.prixVoiture.toString()}€ (${e.types.join(" / ")})`);
//     }
// });
app.get("/", (err, res) => {res.send("ntm")})
app.get("/voiture", async (req, res) => {
    let id = req.query.id;
    let type = req.query.type;
    let marque = req.query.marque;
    let where = [];
    if (id) where.push(`voiture.idVoiture = ${id}`);
    if (marque) where.push(`voiture.idMarque = ${marque}`);
    let row = await poolAsync(`SELECT * FROM voiture INNER JOIN marque ON marque.idMarque = voiture.idMarque INNER JOIN type_association ON voiture.idVoiture = type_association.idVoiture WHERE ${where.length ? where.join(" AND ") : "1"};`)
    let types = await poolAsync("SELECT * FROM type");
    let voiture = {};
    new Set(...[row.map(e => e.idVoiture)]).forEach(e => { voiture[e] = row.find(c => c.idVoiture == e) });
    for (const [idVoiture, voitureInfo] of Object.entries(voiture)) {
        let kjhdshdjfsv = row.filter(e => e.idVoiture == idVoiture);
        if (type && !kjhdshdjfsv.find(e => e.idType == type)) {
            delete voiture[idVoiture];
            continue;
        }
        voiture[idVoiture].types = row.filter(e => e.idVoiture == idVoiture).map(e => types.find(c => c.idType == e.idType).nomType);
    }
    voiture = Object.entries(voiture).map(e => e[1]);
    res.send(voiture);
});


app.get("/panier", async (req, res) => {
    let panier = await poolAsync(`SELECT * FROM panier`);
    let toReturn = [];
    for (const e of panier) {
        let voiture = await poolAsync(`SELECT chStage${e.stageVoiture}, nomVoiture, idVoiture, prixVoiture, description FROM voiture WHERE idVoiture = ${e.idVoiture}`);
        let prixPanier = (voiture[0].prixVoiture * Math.pow(1.1, e.stageVoiture)).toFixed(2);
        toReturn.push({...voiture[0], idPanier: e.idPanier, stage: e.stageVoiture, prixPanier});
    }
    res.send(toReturn);
});

app.post("/panier", async(req, res) => {
    let voiture = req.query.idVoiture;
    let stage = req.query.stageVoiture;
    await poolAsync(`INSERT INTO panier (idVoiture, stageVoiture) VALUES (${voiture}, ${stage})`);
    res.status(201).send("");
});

app.delete("/panier", async(req, res) => {
    let panier = req.query.idPanier;
    await poolAsync("DELETE FROM panier WHERE idPanier = "+panier);
    res.status(200).send("");
});