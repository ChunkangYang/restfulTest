const express = require('express');
const app = express();

app.use(express.json());


let recipes = [];


app.post('/recipes', (req, res) => {
  const recipe = req.body;
  recipes.push(recipe);
  res.status(201).json(recipe);
});

app.get('/recipes', (req, res) => {
  res.json(recipes);
});

app.get('/recipes/:id', (req, res) => {
  const id = req.params.id;
  const recipe = recipes.find(r => r.id === id);
  if (recipe) {
    res.json(recipe);
  } else {
    res.status(404).json({ error: 'Recipe not found' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
