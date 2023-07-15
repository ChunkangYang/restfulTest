const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());


const pool = new Pool({
  connectionString: 'postgres://root:TLaNNuzwcGtixcp73G67XfguyUAMFk3i@dpg-cip2fq6nqql4qa1bll3g-a/restful_test',
});


app.post('/recipes', async (req, res) => {
  const recipe = req.body;
  
  if (!recipe.title || !recipe.making_time || !recipe.serves || !recipe.ingredients || !recipe.cost) {
    res.status(200).json({ message: 'Recipe creation failed!', required: 'title, making_time, serves, ingredients, cost' });
    return;
  }

  try {
    const { title, making_time, serves, ingredients, cost } = req.body;
    const query = 'INSERT INTO recipes (title, making_time, serves, ingredients, cost) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [title, making_time, serves, ingredients, cost];
    const result = await pool.query(query, values);
    const recipes = result.rows.map(row => ({ id: row.id, title: row.title, making_time: row.making_time,
        servers: row.servers, ingredients: row.ingredients, cost: row.cost, created_at: row.created_at, updated_at: row.updated_at }));

    res.status(200).json({
        message: 'Recipe successfully created!',
        recipe: recipes
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', e: err });
  }
});


app.get('/recipes', async (req, res) => {
  try {
    const query = 'SELECT id, title, making_time, serves, ingredients, cost FROM recipes';
    const result = await pool.query(query);
    const recipes = result.rows.map(row => ({ id: row.id, title: row.title, making_time: row.making_time,
      serves: row.serves, ingredients: row.ingredients, cost: row.cost }));
    res.status(200).json({ recipes });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', e: err });
  }
});


app.get('/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM recipes WHERE id = $1';
    const result = await pool.query(query, [id]);
    const recipes = result.rows.map(row => ({ id: row.id, title: row.title, making_time: row.making_time,
      serves: row.serves, ingredients: row.ingredients, cost: row.cost }));
    res.status(200).json({
      message: 'Recipe details by id',
      recipe: recipes
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;
    const query = `UPDATE recipes SET ${buildUpdateQuery(updatedFields)} WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    const recipes = result.rows.map(row => ({ id: row.id, title: row.title, making_time: row.making_time,
      servers: row.servers, ingredients: row.ingredients, cost: row.cost }));

    res.status(200).json({
      message: 'Recipe updated successfully',
      recipe: recipes
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/recipes/:id', async (req, res) => {
  try {
    let msg = "start";
    const { id } = req.params;
    const query = 'DELETE FROM recipes WHERE id = $1'
    msg += " before await";
    const result = await pool.query(query, [id]);
    msg += " after await";
    const rowsAffected = result.rowCount;
    if (rowsAffected == 0) {
      msg += " true";
      res.status(200).json({ message: 'No Recipe found' });
    } else {
      msg += " false";
      res.status(200).json({ message: 'Recipe successfully removed!' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', e: msg });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

function buildUpdateQuery(fields) {
  const queryParts = [];
  for (const [key, value] of Object.entries(fields)) {
    queryParts.push(`${key} = '${value}'`);
  }
  return queryParts.join(', ');
}