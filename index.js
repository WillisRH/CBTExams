// server.js
const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 7991;
const bodyParser = require("body-parser");
// MySQL Connection
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "cbt",
    charset: "utf8mb4",
});

// Set up the Express app
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Home route - Render index.ejs
// app.post('/save_questions', (req, res) => {
//     const question = req.body.question;
//     const optionA = req.body.option_a;
//     const optionB = req.body.option_b;
//     const optionC = req.body.option_c;
//     const optionD = req.body.option_d;
//     const answer = req.body.answer;
  
//     const sql = 'INSERT INTO questions (question, option_a, option_b, option_c, option_d, answer) VALUES (?, ?, ?, ?, ?, ?)';
//     connection.query(sql, [question, optionA, optionB, optionC, optionD, answer], (err, result) => {
//       if (err) {
//         console.error('Error saving question:', err);
//         res.status(500).send('Error saving question');
//       } else {
//         console.log('Question saved successfully');
//         const newQuestionId = result.insertId; // Retrieve the ID of the newly inserted question
  
//         // Redirect to the next question creation page
//         res.redirect(`/createquestion/`);
//       }
//     });
//   });
// //   app.get('/createquestion/:id?', (req, res) => {
// //     const id = req.params.id;
  
// //     if (!id) {
// //       // Retrieve the latest question ID from the database
// //       const sql = 'SELECT id FROM questions ORDER BY id DESC LIMIT 1';
// //       connection.query(sql, (err, result) => {
// //         if (err) {
// //           console.error('Error retrieving latest question ID:', err);
// //           res.status(500).send('Error retrieving latest question ID');
// //         } else {
// //           const latestQuestionId = result.length > 0 ? result[0].id : 0;
// //           const nextQuestionId = latestQuestionId + 1;
  
// //           // Redirect to the next question creation page
// //           res.redirect(`/createquestion/${nextQuestionId}`);
// //         }
// //       });
// //     } else {
// //       // Render the index page
// //       res.render('index', {id: id});
// //     }
// //   });
app.get('/createquestion/:table?/:id?', (req, res) => {
    const table = req.params.table;
    const id = req.params.id;
  
    if (!id) {
      // Redirect to the next question creation page
      const sqlLatest = `SELECT id FROM ${table} ORDER BY id DESC LIMIT 1`;
      connection.query(sqlLatest, (err, result) => {
        if (err) {
          console.error('Error retrieving latest question ID:', err);
          res.status(500).send('Error retrieving latest question ID');
        } else {
          const latestQuestionId = result.length > 0 ? result[0].id : 0;
          const nextQuestionId = latestQuestionId + 1;
  
          res.redirect(`/createquestion/${table}/${nextQuestionId}`);
        }
      });
    } else if (id > 0) {
      // Check if the provided ID exists in the database
      const sqlExists = `SELECT id FROM ${table} WHERE id = ?`;
      connection.query(sqlExists, [id], (err, result) => {
        if (err) {
          console.error('Error checking question existence:', err);
          res.status(500).send('Error checking question existence');
        } else {
          if (result.length) {
            // ID exists, redirect to the latest question
            const sqlLatest = `SELECT id FROM ${table} ORDER BY id DESC LIMIT 1`;
            connection.query(sqlLatest, (err, result) => {
              if (err) {
                console.error('Error retrieving latest question ID:', err);
                res.status(500).send('Error retrieving latest question ID');
              } else {
                const latestQuestionId = result.length > 0 ? result[0].id : 0;
  
                res.redirect(`/createquestion/${table}/${latestQuestionId + 1}`);
              }
            });
          } else {
            // Render the index page with the provided ID
            res.render('index', { id: id, table: table });
          }
        }
      });
    } else {
      // Invalid ID, render the index page
      res.render('index', { table: table });
    }
  });
  
  
app.get('/createquestion/:table/:id', (req, res) => {
    const table = req.params.table;
    const id = req.params.id;
  
    // Render the index.ejs file
    res.render('index', { id: id, table: table });
  });
  
  

  
// // Save questions route - Handle form submission
app.post('/save_questions/:table/:id', (req, res) => {
    const question = req.body.question;
    const optionA = req.body.option_a;
    const optionB = req.body.option_b;
    const optionC = req.body.option_c;
    const optionD = req.body.option_d;
    const answer = req.body.answer;
    const table = req.params.table;
    const id = parseInt(req.params.id);
  
    console.log(id);
  
    // Save the question to the database
    const sql = `INSERT INTO ${table} (id, question, option_a, option_b, option_c, option_d, answer) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    connection.query(sql, [id, question, optionA, optionB, optionC, optionD, answer], (err, result) => {
      if (err) {
        console.error('Error saving question:', err);
        res.status(500).send('Error saving question');
      } else {
        console.log('Question saved successfully');
        const newQuestionId = result.insertId;
        console.log(newQuestionId) // Retrieve the ID of the newly inserted question
  
        // Redirect to the next question creation page
        res.redirect(`/createquestion/${table}/${newQuestionId + 1}`);
      }
    });
  });
  
  

// Display questions route - Render questions.ejs
app.get('/questions/:table', (req, res) => {
    const table = req.params.table;
  
    const sql = `SELECT * FROM ${table}`;
    connection.query(sql, (err, results) => {
      if (err) {
        console.error(`Error retrieving data from table ${table}: `, err);
        return;
      }
      res.render('questions', { questions: results, table: table });
    });
  });
  


app.get('/tables', (req, res) => {
    const showTablesQuery = 'SHOW TABLES';
  
    connection.query(showTablesQuery, (err, results) => {
      if (err) {
        console.error('Error retrieving tables:', err);
        res.status(500).send('Error retrieving tables');
      } else {
        const tables = results.map((row) => row[`Tables_in_${connection.config.database}`]);
        res.render('tables', { tables });
      }
    });
  });
  
  // Route to create a table based on user input if it doesn't exist
  // server.js
// ...

// Route to create a table based on user input if it doesn't exist
app.post('/create-table', (req, res) => {
    const { tableName } = req.body;
  
    const createTableQuery = `
  CREATE TABLE IF NOT EXISTS ${tableName} (
    id INT(2) NOT NULL AUTO_INCREMENT,
    questionid INT(5),
    question VARCHAR(255) NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    answer VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
  )
`;

  
    connection.query(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        res.status(500).send('Error creating table');
      } else {
        console.log('Table created successfully');
        res.redirect('/tables');
      }
    });
  });
  
  // ...
  


// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
