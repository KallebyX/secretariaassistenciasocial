import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Conecta ao banco de dados SQLite (cria o arquivo se não existir)
const db = new sqlite3.Database('/tmp/database.db', (err) => {
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

// Cria a tabela para armazenar dados do Cadastro Único (versão local)
db.run(`CREATE TABLE IF NOT EXISTS cadunico_data (
  cpf TEXT PRIMARY KEY,
  nis TEXT,
  name TEXT
)`);

// Cria a tabela de notícias se ela não existir
db.run(`CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Cria a tabela de agendamentos se ela não existir
db.run(`CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beneficiary_id INTEGER NOT NULL,
  server_id INTEGER,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'Agendado',
  FOREIGN KEY(beneficiary_id) REFERENCES beneficiaries(id)
)`);


// Rota para obter todos os beneficiários com busca
app.get('/api/beneficiaries', (req, res) => {
  const { search } = req.query;
  let sql = "SELECT * FROM beneficiaries";
  const params = [];

  if (search) {
    sql += " WHERE name LIKE ? OR cpf LIKE ?";
    params.push(`%${search}%`, `%${search}%`);
  }

  db.all(sql, params, (err, rows) => {
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

// Rota para obter um único beneficiário
app.get('/api/beneficiaries/:id', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM beneficiaries WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    if (row) {
      res.json({ "message": "success", "data": row });
    } else {
      res.status(404).json({ "message": "Beneficiário não encontrado." });
    }
  });
});

// Rota para criar um novo beneficiário
app.post('/api/beneficiaries', (req, res) => {
  const { name, cpf, nis, birthDate, address, phone } = req.body;
  const sql = `INSERT INTO beneficiaries (name, cpf, nis, birthDate, address, phone) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [name, cpf, nis, birthDate, address, phone];
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.status(201).json({
      "message": "success",
      "data": { id: this.lastID, ...req.body }
    });
  });
});

// Rota para atualizar um beneficiário
app.put('/api/beneficiaries/:id', (req, res) => {
  const { id } = req.params;
  const { name, cpf, nis, birthDate, address, phone } = req.body;
  const sql = `UPDATE beneficiaries SET 
    name = ?, 
    cpf = ?, 
    nis = ?, 
    birthDate = ?, 
    address = ?, 
    phone = ? 
    WHERE id = ?`;
  const params = [name, cpf, nis, birthDate, address, phone, id];
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": { id, ...req.body },
      "changes": this.changes
    });
  });
});

// Rota para deletar um beneficiário
app.delete('/api/beneficiaries/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM beneficiaries WHERE id = ?';
  db.run(sql, id, function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({ "message": "deleted", "changes": this.changes });
  });
});


// --- ROTAS DE PROGRAMAS ---

// Rota para obter todos os programas
app.get('/api/programs', (req, res) => {
  const sql = "SELECT * FROM programs ORDER BY name";
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

// Rota para criar um novo programa
app.post('/api/programs', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ "error": "O nome do programa é obrigatório." });
  }
  const sql = `INSERT INTO programs (name) VALUES (?)`;
  db.run(sql, [name], function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.status(201).json({
      "message": "success",
      "data": { id: this.lastID, name }
    });
  });
});

// Rota para atualizar um programa
app.put('/api/programs/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ "error": "O nome do programa é obrigatório." });
  }
  const sql = `UPDATE programs SET name = ? WHERE id = ?`;
  db.run(sql, [name, id], function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": { id, name },
      "changes": this.changes
    });
  });
});

// Rota para deletar um programa
app.delete('/api/programs/:id', (req, res) => {
  const { id } = req.params;
  // Também remove associações ao deletar um programa
  db.run('DELETE FROM beneficiary_programs WHERE program_id = ?', id, (err) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    const sql = 'DELETE FROM programs WHERE id = ?';
    db.run(sql, id, function(err) {
      if (err) {
        res.status(400).json({ "error": err.message });
        return;
      }
      res.json({ "message": "deleted", "changes": this.changes });
    });
  });
});


// --- ROTAS DE NOTÍCIAS ---

// Rota para obter todas as notícias
app.get('/api/news', (req, res) => {
  const sql = "SELECT * FROM news ORDER BY createdAt DESC";
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

// Rota para obter uma única notícia
app.get('/api/news/:id', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM news WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    if (row) {
      res.json({ "message": "success", "data": row });
    } else {
      res.status(404).json({ "message": "Notícia não encontrada." });
    }
  });
});

// Rota para criar uma nova notícia
app.post('/api/news', (req, res) => {
  const { title, content, author } = req.body;
  const sql = `INSERT INTO news (title, content, author) VALUES (?, ?, ?)`;
  const params = [title, content, author];
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.status(201).json({
      "message": "success",
      "data": { id: this.lastID, ...req.body }
    });
  });
});

// Rota para atualizar uma notícia
app.put('/api/news/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, author } = req.body;
  const sql = `UPDATE news SET title = ?, content = ?, author = ? WHERE id = ?`;
  const params = [title, content, author, id];
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": { id, ...req.body },
      "changes": this.changes
    });
  });
});

// Rota para deletar uma notícia
app.delete('/api/news/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM news WHERE id = ?';
  db.run(sql, id, function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({ "message": "deleted", "changes": this.changes });
  });
});


// --- ROTAS DE AGENDAMENTOS ---

// Rota para obter todos os agendamentos (pode ser filtrado por servidor ou beneficiário)
app.get('/api/appointments', (req, res) => {
  const { server_id, beneficiary_id } = req.query;
  let sql = `
    SELECT 
      a.id, a.date, a.time, a.reason, a.status,
      b.name as beneficiary_name,
      b.id as beneficiary_id
    FROM appointments a
    JOIN beneficiaries b ON a.beneficiary_id = b.id
  `;
  const params = [];

  if (server_id) {
    sql += ' WHERE a.server_id = ?';
    params.push(server_id);
  } else if (beneficiary_id) {
    sql += ' WHERE a.beneficiary_id = ?';
    params.push(beneficiary_id);
  }
  
  sql += ' ORDER BY a.date, a.time';

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({ "message": "success", "data": rows });
  });
});

// Rota para criar um novo agendamento
app.post('/api/appointments', (req, res) => {
  const { beneficiary_id, server_id, date, time, reason } = req.body;
  const sql = `INSERT INTO appointments (beneficiary_id, server_id, date, time, reason) VALUES (?, ?, ?, ?, ?)`;
  const params = [beneficiary_id, server_id, date, time, reason];
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.status(201).json({
      "message": "success",
      "data": { id: this.lastID, ...req.body }
    });
  });
});

// Rota para atualizar o status de um agendamento
app.put('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const sql = `UPDATE appointments SET status = ? WHERE id = ?`;
  const params = [status, id];
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "changes": this.changes
    });
  });
});

// --- ROTAS DE RELATÓRIOS ---

// Rota para obter estatísticas gerais
app.get('/api/reports/stats', (req, res) => {
  const queries = {
    totalBeneficiaries: "SELECT COUNT(*) as count FROM beneficiaries",
    totalAppointments: "SELECT COUNT(*) as count FROM appointments",
    appointmentsByStatus: "SELECT status, COUNT(*) as count FROM appointments GROUP BY status",
    beneficiariesByProgram: `
      SELECT p.name, COUNT(bp.beneficiary_id) as count 
      FROM programs p
      LEFT JOIN beneficiary_programs bp ON p.id = bp.program_id
      GROUP BY p.name
    `
  };

  const results = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, sql]) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        // Se uma query falhar, retorna erro
        if (!res.headersSent) {
          res.status(500).json({ "error": `Failed to fetch ${key}: ${err.message}` });
        }
        return;
      }
      
      // Processa os resultados
      if (key === 'totalBeneficiaries' || key === 'totalAppointments') {
        results[key] = rows[0].count;
      } else {
        results[key] = rows;
      }
      
      completedQueries++;
      if (completedQueries === totalQueries) {
        res.json({ "message": "success", "data": results });
      }
    });
  });
});


// Rota para buscar um CPF na base de dados local do CadÚnico
app.get('/api/cadunico/search', (req, res) => {
  const { cpf } = req.query;

  if (!cpf) {
    return res.status(400).json({ "error": "CPF é obrigatório" });
  }

  const sql = "SELECT * FROM cadunico_data WHERE cpf = ?";
  db.get(sql, [cpf], (err, row) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    if (row) {
      res.json({
        "message": "success",
        "data": row
      });
    } else {
      res.status(404).json({ "message": "CPF não encontrado na base de dados local do CadÚnico." });
    }
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

// Adiciona algumas notícias de exemplo se o banco estiver vazio
db.get("SELECT count(*) as count FROM news", (err, row) => {
    if(row.count === 0) {
        const stmt = db.prepare("INSERT INTO news (title, content, author) VALUES (?, ?, ?)");
        stmt.run("Campanha do Agasalho 2025", "A Secretaria de Assistência Social lança a Campanha do Agasalho 2025. Doe roupas e cobertores em bom estado nos pontos de coleta.", "Secretaria de Assistência Social");
        stmt.run("Abertura de Inscrições para Cursos", "Estão abertas as inscrições para cursos profissionalizantes gratuitos. Mais informações no CRAS.", "Secretaria de Assistência Social");
        stmt.finalize();
        console.log('Dados de exemplo inseridos na tabela news.');
    }
});

// Adiciona alguns agendamentos de exemplo se o banco estiver vazio
db.get("SELECT count(*) as count FROM appointments", (err, row) => {
    if(row.count === 0) {
        const stmt = db.prepare("INSERT INTO appointments (beneficiary_id, server_id, date, time, reason, status) VALUES (?, ?, ?, ?, ?, ?)");
        // Note: server_id is nullable for now, assuming any server can handle.
        stmt.run(1, null, "2025-08-25", "10:00", "Atualização do Cadastro Único", "Agendado");
        stmt.run(2, null, "2025-08-26", "14:30", "Solicitação de cesta básica", "Agendado");
        stmt.finalize();
        console.log('Dados de exemplo inseridos na tabela appointments.');
    }
});

// Adiciona alguns programas de exemplo se o banco estiver vazio
db.get("SELECT count(*) as count FROM programs", (err, row) => {
    if(row.count === 0) {
        const stmt = db.prepare("INSERT INTO programs (name) VALUES (?)");
        stmt.run("Programa Criança Feliz");
        stmt.run("Bolsa Família");
        stmt.run("Auxílio Gás");
        stmt.run("Serviço de Convivência e Fortalecimento de Vínculos");
        stmt.finalize();
        console.log('Dados de exemplo inseridos na tabela programs.');
    }
});
