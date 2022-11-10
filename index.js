const express = require('express');
const bp = require('body-parser');

const sqlite = require('sqlite3');

const db = new sqlite.Database(__dirname + '/db.sqlite', (err) =>{
   if(err) throw err;
});

db.serialize(() => {
    const sql = `
        CREATE TABLE IF NOT EXISTS phone_contact (
            id integer primary key autoincrement,
            fullname varchar(50) not null,
            telephone varchar(13) not null
        )
    `;
    db.run(sql, (err) => {
        if(err) throw err;
    });
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(bp.urlencoded({extended: false}));

app.get('/',(req, res) => {
    // Display List
    db.serialize(() => {
        const sql = 'SELECT * FROM phone_contact';
        db.all(sql, (err, rows) => {
            if (err) throw err;
            res.render('index.ejs', { phone_contact: rows }); 
        });
    });
});

app.get('/:id', (req, res) => {
    // Display Detail
    const { id } = req.params;

    db.serialize(() => {
        const sql = `SELECT * FROM phone_contact WHERE id="${id}"`;
        db.get(sql, (err, rows) => {
            if (err) throw err;
            res.render('detail.ejs', { phone_contact: rows });
        });
    });
})

app.post('/', (req, res) =>{
    // Create Data
    const { fullname, phone_number } = req.body;
    db.serialize(() => {
        const sql = `INSERT INTO phone_contact(fullname, telephone) VALUES('${fullname}', '${phone_number}')`;
        db.run(sql, (err, rows) => {
            if (err) throw err;
            res.redirect('/');
        });
    });
})

app.get('/:id/edit', (req, res) => {
    // Edit Data
    const { id } = req.params;
    db.serialize(() => {
        const sql = `SELECT * FROM phone_contact WHERE id="${id}"`;
        db.get(sql, (err, rows) => {
            if (err) throw err;
            res.render('edit.ejs', { phone_contact: rows });
        });
    });
})

app.post('/:id/edit', (req, res) => {
    // Save Data After Edit
    const { id } = req.params;
    const { fullname, phone_number } = req.body;

    db.serialize(() => {
        const sql = `UPDATE phone_contact set fullname="${fullname}", telephone="${phone_number}" WHERE id="${id}"`;
        db.run(sql, (err, rows) => {
            if (err) throw err;
            res.redirect('/');
        });
    });
})

app.get('/:id/delete', (req, res) =>{
    // Delete Data
    const { id } = req.params;
    db.serialize(() => {
        const sql = `DELETE FROM phone_contact WHERE id="${id}"`;
        db.run(sql, (err) => {
            if (err) throw err;
            res.redirect('/');
        });
    });
})

app.listen(8080, () =>{
    console.log("Program is running");
});