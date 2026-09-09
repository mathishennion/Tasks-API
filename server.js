const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON envoyé dans le corps des requêtes
app.use(express.json());

// Stockage en mémoire (pas de base de données pour ce TP)
let tasks = [];
let nextId = 1;

/**
 * POST /tasks
 * Ajoute une nouvelle tâche
 * Body attendu : { "titre": "Faire les courses" }
 */
app.post('/tasks', (req, res) => {
  const { titre } = req.body;

  if (!titre || typeof titre !== 'string' || titre.trim() === '') {
    return res.status(400).json({ error: 'Le champ "titre" est requis et doit être une chaîne non vide.' });
  }

  const newTask = {
    id: nextId++,
    titre: titre.trim(),
    completed: false
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

/**
 * GET /tasks
 * Récupère la liste complète des tâches
 */
app.get('/tasks', (req, res) => {
  if (req.query.completed){
    if (req.query.completed === 'true') {
      return res.status(200).json(tasks.filter((t) => t.completed === true));
    } else {
      return res.status(200).json(tasks.filter((t) => t.completed === false));
    } 
  } else {
    return res.status(200).json(tasks);
  }
});

/**
 * PUT /tasks/:id
 * Modifie une tâche spécifique (titre et/ou statut)
 * Body attendu : { "titre": "...", "complete": true }
 */
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Aucune tâche trouvée avec l'id ${id}.` });
  }

  const { titre, complete } = req.body;

  if (titre !== undefined) {
    if (typeof titre !== 'string' || titre.trim() === '') {
      return res.status(400).json({ error: 'Le champ "titre" doit être une chaîne non vide.' });
    }
    task.titre = titre.trim();
  }

  if (complete !== undefined) {
    if (typeof complete !== 'boolean') {
      return res.status(400).json({ error: 'Le champ "complete" doit être un booléen.' });
    }
    task.complete = complete;
  }

  res.status(200).json(task);
});

/**
 * DELETE /tasks/:id
 * Supprime une tâche spécifique
 */
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Aucune tâche trouvée avec l'id ${id}.` });
  }

  const deleted = tasks.splice(index, 1)[0];
  res.status(200).json({ message: 'Tâche supprimée.', task: deleted });
});

/**Nouvelle fonctionnalité 1 (pour l'étudiant A)
§ Ajouter une fonctionnalité permettant de marquer une tâche comme
complétée/non complétée.
§ Route suggérée : PATCH /tasks/:id/completed
*/
app.patch('/tasks/:id/completed', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Aucune tâche trouvée avec l'id ${id}.` });
  }

  const { complete } = req.body;

  if (typeof complete !== 'boolean') {
    return res.status(400).json({ error: 'Le champ "complete" doit être un booléen.' });
  }

  task.complete = complete;
  res.status(200).json(task);
});

// Route de vérification que le serveur tourne
app.get('/', (req, res) => {
  res.send('Tasks API en ligne. Voir /tasks');
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
