const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());


const pool = new Pool({
  connectionString: 'postgres://root:TLaNNuzwcGtixcp73G67XfguyUAMFk3i@dpg-cip2fq6nqql4qa1bll3g-a/restful_test',
});


app.post('/recipes', async (req, res) => {
  try {
    const { title, making_time, serves, ingredients, cost } = req.body;
    const query = 'INSERT INTO recipes (title, making_time, serves, ingredients, cost) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [title, making_time, serves, ingredients, cost];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/recipes', async (req, res) => {
  try {
    const query = 'SELECT id, title, making_time, serves, ingredients, cost FROM recipes';
    const result = await pool.query(query);
    const recipes = result.rows.map(row => ({ id: row.id, title: row.title, making_time: row.making_time,
        servers: row.servers, ingredients: row.ingredients, cost: row.cost }));
    res.json({ recipes });
    // const query = 'SELECT * FROM recipes';
    // const result = await pool.query(query);
    // const recipes = result.rows.map(row => ({ id: row.id }));
    // res.json({ recipes });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', e: err });
  }
});


app.get('/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM recipes WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Recipe not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
