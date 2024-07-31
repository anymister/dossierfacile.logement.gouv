const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Configuration de la connexion à la base de données PostgreSQL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Vérifiez si l'URL de connexion est bien définie
if (!process.env.POSTGRES_URL) {
  console.error('La variable d\'environnement POSTGRES_URL n\'est pas définie.');
  process.exit(1);
}

// Utiliser express.json() pour analyser les corps de requête en JSON
app.use(express.json());

app.post('/upload', async (req, res) => {
  const { content } = req.body;

  // Assurez-vous que 'content' est défini et est une chaîne de caractères
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Le contenu est requis et doit être une chaîne de caractères' });
  }

  try {
    // Connexion à la base de données
    const client = await pool.connect();
    try {
      // Exécution de la requête d'insertion
      const result = await client.query('INSERT INTO users (content) VALUES ($1)', [content]);
      console.log('Insertion réussie:', result);
      res.json({ message: 'Données enregistrées avec succès' });
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la requête SQL:', err);
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement des données' });
    } finally {
      // Toujours libérer le client dans un bloc finally
      client.release();
    }
  } catch (err) {
    // Gestion des erreurs
    console.error('Erreur lors de la connexion à la base de données:', err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement des données' });
  }
});

app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});
