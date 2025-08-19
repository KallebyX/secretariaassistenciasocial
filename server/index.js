import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Conecta ao banco de dados SQLite (cria o arquivo se não existir)
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Conectado ao banco de dados SQLite.');
});

// Cria a tabela de beneficiários se ela não existir
db.run(`CREATE TABLE IF NOT EXISTS beneficiaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  nis TEXT,
  birthDate TEXT,
  address TEXT,
  phone TEXT
)`);

// Cria a tabela de programas se ela não existir
db.run(`CREATE TABLE IF NOT EXISTS programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
)`);

// Cria a tabela de associação entre beneficiários e programas
db.run(`CREATE TABLE IF NOT EXISTS beneficiary_programs (
  beneficiary_id INTEGER,
  program_id INTEGER,
  FOREIGN KEY(beneficiary_id) REFERENCES beneficiaries(id),
  FOREIGN KEY(program_id) REFERENCES programs(id),
  PRIMARY KEY (beneficiary_id, program_id)
)`);


// Rota para obter todos os beneficiários
app.get('/api/beneficiaries', (req, res) => {
  const sql = "SELECT * FROM beneficiaries";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// Adiciona alguns dados de exemplo se o banco estiver vazio
db.get("SELECT count(*) as count FROM beneficiaries", (err, row) => {
    if(row.count === 0) {
        const stmt = db.prepare("INSERT INTO beneficiaries (name, cpf, nis, birthDate, address, phone) VALUES (?, ?, ?, ?, ?, ?)");
        stmt.run("Maria da Silva", "123.456.789-00", "12345678901", "1985-05-20", "Rua das Flores, 123, Centro", "(55) 99999-8888");
        stmt.run("João Pereira", "987.654.321-00", "09876543210", "1990-02-15", "Av. Principal, 456, Bairro Norte", "(55) 98888-7777");
        stmt.finalize();
        console.log('Dados de exemplo inseridos na tabela beneficiaries.');
    }
});
