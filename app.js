const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Connexion à la base de données (crée le fichier blog.db s'il n'existe pas)
const db = new sqlite3.Database('./blog.db', (err) => {
    if (err) console.error(err.message);
    console.log('Connecté à la base de données SQLite.');
});

// Création de la table Articles selon les consignes du TP
db.run(`CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    contenu TEXT,
    auteur TEXT NOT NULL,
    date TEXT,
    categorie TEXT,
    tags TEXT
)`);

// --- LES ROUTES DE L'API ---

// 1. LIRE TOUS LES ARTICLES (GET /api/articles)
app.get('/api/articles', (req, res) => {
    db.all("SELECT * FROM articles", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. CRÉER UN ARTICLE (POST /api/articles)
app.post('/api/articles', (req, res) => {
    const { titre, contenu, auteur, date, categorie, tags } = req.body;
    // Bonne pratique : Validation des entrées
    if (!titre || !auteur) {
        return res.status(400).json({ error: "Le titre et l'auteur sont obligatoires (Code 400)" });
    }
    const sql = `INSERT INTO articles (titre, contenu, auteur, date, categorie, tags) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [titre, contenu, auteur, date, categorie, tags], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: "Article créé avec succès ! (Code 201)" });
    });
});

// 3. SUPPRIMER UN ARTICLE (DELETE /api/articles/:id)
app.delete('/api/articles/:id', (req, res) => {
    db.run(`DELETE FROM articles WHERE id = ?`, req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Article supprimé", changes: this.changes });
    });
});

// Démarrage du serveur sur le port 3000
app.listen(3000, () => {
    console.log("-----------------------------------------");
    console.log("SERVEUR ACTIF : http://localhost:3000");
    console.log("-----------------------------------------");
});
