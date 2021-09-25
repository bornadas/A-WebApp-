const dbDriver = require('better-sqlite3');

const db = dbDriver('products, stores and warehouse.sqlite3');
const express = require('express');

const app = express();
app.use(express.static('frontend'));
app.use(express.json());

function setupAllRoutes() {

  let statement = db.prepare(`
    SELECT name, type FROM sqlite_schema
    WHERE
      type IN ('table', 'view')
      AND name NOT LIKE 'sqlite_%'
  `);
  let tablesAndViews = statement.all();

  for (let { name, type } of tablesAndViews) {
    setUpRoutesForOneDbTable(name, type);
    console.log('Routes created for the', type, name);
  }
}
function setUpRoutesForOneDbTable(tableName, type) {

  // Get all
  app.get('/api/' + tableName, (req, res) => {
    let statement = db.prepare(`
    SELECT * FROM ${tableName}
  `);
    let result = statement.all();
    res.json(result);
  });

  // Get one
  app.get('/api/' + tableName + '/:id', (req, res) => {
    let searchId = req.params.id;
    let statement = db.prepare(`
    SELECT * FROM ${tableName} WHERE id = :searchId
  `);
    let result = statement.all({ searchId });
    res.json(result[0] || null);
  });

  if (type === 'view') { return; }


  // Create one
  app.post('/api/' + tableName, (req, res) => {
    let statement = db.prepare(`
    INSERT INTO ${tableName} (${Object.keys(req.body).join(', ')})
    VALUES (${Object.keys(req.body).map(x => ':' + x).join(', ')})
  `);
    let result;
    try {
      result = statement.run(req.body);
    }
    catch (error) {
      result = { error: error + '' };
    }
    res.json(result);
  });

  // Delete one
  app.delete('/api/' + tableName + '/:id', (req, res) => {
    let statement = db.prepare(`
    DELETE FROM ${tableName}
    WHERE id = :idToDelete
  `);
    let result = statement.run({
      idToDelete: req.params.id
    });
    res.json(result);
  });

  // Change one
  app.put('/api/' + tableName + '/:id', (req, res) => {
    let result;
    try {
      let statement = db.prepare(`
      UPDATE ${tableName}
      SET ${Object.keys(req.body).map(x => x + ' = :' + x).join(', ')}
      WHERE id = :id
    `);
      result = statement.run({ ...req.body, id: req.params.id });
    }
    catch (error) {
      result = { error: error + '' }
    }
    res.json(result);
  });
}
setupAllRoutes();

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
