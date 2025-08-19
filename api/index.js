import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const port = 3001;
const JWT_SECRET = 'seu-segredo-super-secreto-aqui'; // Troque por uma variável de ambiente em produção

app.use(cors());
app.use(express.json());

// Conecta ao banco de dados SQLite (cria o arquivo se não existir)
const db = new sqlite3.Database('/tmp/database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Conectado ao banco de dados SQLite.');
});

// Serializa a criação do banco de dados para garantir a ordem de execução
db.serialize(() => {
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

  // Cria a tabela de usuários se ela não existir
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('secretaria', 'servidor', 'beneficiario')) NOT NULL
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
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK(priority IN ('Baixa', 'Média', 'Alta')) NOT NULL DEFAULT 'Média',
    status TEXT CHECK(status IN ('Pendente', 'Em Andamento', 'Realizado')) NOT NULL DEFAULT 'Pendente',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(beneficiary_id) REFERENCES beneficiaries(id)
  )`);

  // Adiciona usuários de exemplo
  db.get("SELECT count(*) as count FROM users", (err, row) => {
    if (err) { console.error("Erro ao verificar usuários:", err.message); return; }
    if (row && row.count === 0) {
        const stmt = db.prepare("INSERT INTO users (name, cpf, password_hash, role) VALUES (?, ?, ?, ?)");
        const salt = bcrypt.genSaltSync(10);
        
        // Senha para todos é "senha123"
        const passwordHash = bcrypt.hashSync("senha123", salt);

        stmt.run("Secretária Exemplo", "99988877766", passwordHash, "secretaria");
        stmt.run("Servidor Exemplo", "11122233344", passwordHash, "servidor");
        stmt.run("Beneficiário Exemplo", "55566677788", passwordHash, "beneficiario");
        
        stmt.finalize(() => {
            console.log('Usuários de exemplo inseridos na tabela users.');
        });
    }
  });


  // Adiciona dados de exemplo
  db.get("SELECT count(*) as count FROM beneficiaries", (err, row) => {
      if (err) { console.error("Erro ao verificar beneficiários:", err.message); return; }
      if(row && row.count === 0) {
          const stmt = db.prepare("INSERT INTO beneficiaries (name, cpf, nis, birthDate, address, phone) VALUES (?, ?, ?, ?, ?, ?)");
          stmt.run("Maria da Silva", "123.456.789-00", "12345678901", "1985-05-20", "Rua das Flores, 123, Centro", "(55) 99999-8888");
          stmt.run("João Pereira", "987.654.321-00", "09876543210", "1990-02-15", "Av. Principal, 456, Bairro Norte", "(55) 98888-7777");
          stmt.finalize(() => {
            // Apenas depois de inserir beneficiários, insere agendamentos que dependem deles
            db.get("SELECT count(*) as count FROM appointments", (err, row) => {
                if (err) { console.error("Erro ao verificar agendamentos:", err.message); return; }
                if(row && row.count === 0) {
                    const stmt = db.prepare("INSERT INTO appointments (beneficiary_id, server_id, title, description, priority, status) VALUES (?, ?, ?, ?, ?, ?)");
                    stmt.run(1, null, "Atualização CadÚnico", "Beneficiária precisa atualizar o endereço e a renda familiar.", "Alta", "Pendente");
                    stmt.run(2, null, "Solicitação de Cesta Básica", "Beneficiário desempregado, primeira vez solicitando.", "Média", "Pendente");
                    stmt.run(1, null, "Inscrição SCFV", "Inscrever filho de 8 anos no Serviço de Convivência.", "Baixa", "Realizado");
                    stmt.finalize();
                    console.log('Dados de exemplo inseridos na tabela appointments.');
                }
            });
          });
          console.log('Dados de exemplo inseridos na tabela beneficiaries.');
      }
  });

  db.get("SELECT count(*) as count FROM news", (err, row) => {
      if (err) { console.error("Erro ao verificar notícias:", err.message); return; }
      if(row && row.count === 0) {
          const stmt = db.prepare("INSERT INTO news (title, content, author) VALUES (?, ?, ?)");
          stmt.run("Campanha do Agasalho 2025", "A Secretaria de Assistência Social lança a Campanha do Agasalho 2025. Doe roupas e cobertores em bom estado nos pontos de coleta.", "Prefeitura de Caçapava do Sul");
          stmt.run("Abertura de Inscrições para Cursos", "Estão abertas as inscrições para cursos profissionalizantes gratuitos. Mais informações no CRAS.", "Secretaria de Assistência Social");
          stmt.finalize();
          console.log('Dados de exemplo inseridos na tabela news.');
      }
  });

  db.get("SELECT count(*) as count FROM programs", (err, row) => {
      if (err) { console.error("Erro ao verificar programas:", err.message); return; }
      if(row && row.count === 0) {
          const stmt = db.prepare("INSERT INTO programs (name) VALUES (?)");
          stmt.run("Programa Criança Feliz");
          stmt.run("Bolsa Família");
          stmt.run("Auxílio Gás");
          stmt.run("Serviço de Convivência e Fortalecimento de Vínculos");
          stmt.finalize();
          console.log('Dados de exemplo inseridos na tabela programs.');
      }
  });
});


// --- ROTAS DE AUTENTICAÇÃO ---
app.post('/api/login', (req, res) => {
  const { cpf, senha } = req.body;
  if (!cpf || !senha) {
    return res.status(400).json({ "error": "CPF e senha são obrigatórios." });
  }

  const sql = "SELECT * FROM users WHERE cpf = ?";
  db.get(sql, [cpf], (err, user) => {
    if (err) { return res.status(500).json({ "error": err.message }); }
    if (!user) { return res.status(401).json({ "error": "Credenciais inválidas." }); }

    const isPasswordCorrect = bcrypt.compareSync(senha, user.password_hash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ "error": "Credenciais inválidas." });
    }

    const access_token = jwt.sign({ id: user.id, cpf: user.cpf, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ access_token });
  });
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.get('/api/profile', authenticateToken, (req, res) => {
    // O middleware authenticateToken já validou o token e adicionou o payload do user a req.user
    // Apenas retornamos as informações do usuário do payload do token.
    // Em um caso real, você poderia querer buscar dados frescos do banco de dados aqui.
    res.json({
        id: req.user.id,
        cpf: req.user.cpf,
        name: req.user.name,
        role: req.user.role
    });
});


// --- ROTAS DE BENEFICIÁRIOS ---
app.get('/api/beneficiaries', authenticateToken, (req, res) => {
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
    res.json({ "message": "success", "data": rows });
  });
});

app.get('/api/beneficiaries/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM beneficiaries WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    if (row) { res.json({ "message": "success", "data": row }); } 
    else { res.status(404).json({ "message": "Beneficiário não encontrado." }); }
  });
});

app.post('/api/beneficiaries', authenticateToken, (req, res) => {
  const { name, cpf, nis, birthDate, address, phone } = req.body;
  const sql = `INSERT INTO beneficiaries (name, cpf, nis, birthDate, address, phone) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [name, cpf, nis, birthDate, address, phone];
  db.run(sql, params, function(err) {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    res.status(201).json({ "message": "success", "data": { id: this.lastID, ...req.body } });
  });
});

app.put('/api/beneficiaries/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, cpf, nis, birthDate, address, phone } = req.body;
  const sql = `UPDATE beneficiaries SET name = ?, cpf = ?, nis = ?, birthDate = ?, address = ?, phone = ? WHERE id = ?`;
  const params = [name, cpf, nis, birthDate, address, phone, id];
  db.run(sql, params, function(err) {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    res.json({ "message": "success", "data": { id, ...req.body }, "changes": this.changes });
  });
});

app.delete('/api/beneficiaries/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM beneficiaries WHERE id = ?';
  db.run(sql, id, function(err) {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    res.json({ "message": "deleted", "changes": this.changes });
  });
});


// --- ROTAS DE PROGRAMAS ---
app.get('/api/programs', authenticateToken, (req, res) => {
  const sql = "SELECT * FROM programs ORDER BY name";
  db.all(sql, [], (err, rows) => {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    res.json({ "message": "success", "data": rows });
  });
});

app.post('/api/programs', authenticateToken, (req, res) => {
  const { name } = req.body;
  if (!name) { return res.status(400).json({ "error": "O nome do programa é obrigatório." }); }
  const sql = `INSERT INTO programs (name) VALUES (?)`;
  db.run(sql, [name], function(err) {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    res.status(201).json({ "message": "success", "data": { id: this.lastID, name } });
  });
});

app.put('/api/programs/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) { return res.status(400).json({ "error": "O nome do programa é obrigatório." }); }
  const sql = `UPDATE programs SET name = ? WHERE id = ?`;
  db.run(sql, [name, id], function(err) {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    res.json({ "message": "success", "data": { id, name }, "changes": this.changes });
  });
});

app.delete('/api/programs/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM beneficiary_programs WHERE program_id = ?', id, (err) => {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    const sql = 'DELETE FROM programs WHERE id = ?';
    db.run(sql, id, function(err) {
      if (err) { res.status(400).json({ "error": err.message }); return; }
      res.json({ "message": "deleted", "changes": this.changes });
    });
  });
});


// --- ROTAS DE ASSOCIAÇÃO BENEFICIÁRIO-PROGRAMA ---
app.get('/api/beneficiaries/:id/programs', authenticateToken, (req, res) => {
  const { id } = req.params;
  const sql = `SELECT p.id, p.name FROM programs p JOIN beneficiary_programs bp ON p.id = bp.program_id WHERE bp.beneficiary_id = ?`;
  db.all(sql, [id], (err, rows) => {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    res.json({ "message": "success", "data": rows });
  });
});

app.post('/api/beneficiaries/:id/programs', authenticateToken, (req, res) => {
  const { id: beneficiary_id } = req.params;
  const { program_id } = req.body;
  const sql = `INSERT INTO beneficiary_programs (beneficiary_id, program_id) VALUES (?, ?)`;
  db.run(sql, [beneficiary_id, program_id], function(err) {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    res.status(201).json({ "message": "success" });
  });
});

app.delete('/api/beneficiaries/:beneficiary_id/programs/:program_id', authenticateToken, (req, res) => {
  const { beneficiary_id, program_id } = req.params;
  const sql = 'DELETE FROM beneficiary_programs WHERE beneficiary_id = ? AND program_id = ?';
  db.run(sql, [beneficiary_id, program_id], function(err) {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    res.json({ "message": "deleted", "changes": this.changes });
  });
});


// --- ROTAS DE NOTÍCIAS ---
app.get('/api/news', (req, res) => {
  const sql = "SELECT * FROM news ORDER BY createdAt DESC";
  db.all(sql, [], (err, rows) => {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    res.json({ "message": "success", "data": rows });
  });
});

// --- ROTAS DE AGENDAMENTOS ---
app.get('/api/appointments', authenticateToken, (req, res) => {
  const { server_id, beneficiary_id } = req.query;
  let sql = `
    SELECT a.id, a.title, a.description, a.priority, a.status, a.createdAt, b.name as beneficiary_name, b.id as beneficiary_id
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
  
  sql += ' ORDER BY a.createdAt DESC';

  db.all(sql, params, (err, rows) => {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    res.json({ "message": "success", "data": rows });
  });
});

app.get('/api/beneficiaries/:id/appointments', authenticateToken, (req, res) => {
  const { id } = req.params;
  const sql = `SELECT a.id, a.title, a.description, a.priority, a.status, a.createdAt FROM appointments a WHERE a.beneficiary_id = ? ORDER BY a.createdAt DESC`;
  db.all(sql, [id], (err, rows) => {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    res.json({ "message": "success", "data": rows });
  });
});

app.post('/api/appointments', authenticateToken, (req, res) => {
  const { beneficiary_id, server_id, title, description, priority } = req.body;
  const sql = `INSERT INTO appointments (beneficiary_id, server_id, title, description, priority) VALUES (?, ?, ?, ?, ?)`;
  const params = [beneficiary_id, server_id, title, description, priority];
  db.run(sql, params, function(err) {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    const newAppointmentId = this.lastID;
    db.get("SELECT * FROM appointments WHERE id = ?", [newAppointmentId], (err, row) => {
        if (err) { res.status(400).json({ "error": err.message }); return; }
        res.status(201).json({ "message": "success", "data": row });
    });
  });
});

app.put('/api/appointments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, priority, status } = req.body;
  const fields = [], params = [];
  
  if (title !== undefined) { fields.push("title = ?"); params.push(title); }
  if (description !== undefined) { fields.push("description = ?"); params.push(description); }
  if (priority !== undefined) { fields.push("priority = ?"); params.push(priority); }
  if (status !== undefined) { fields.push("status = ?"); params.push(status); }

  if (fields.length === 0) { return res.status(400).json({ "error": "Nenhum campo para atualizar fornecido." }); }
  params.push(id);

  const sql = `UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`;
  db.run(sql, params, function(err) {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    db.get("SELECT * FROM appointments WHERE id = ?", [id], (err, row) => {
        if (err) { res.status(400).json({ "error": err.message }); return; }
        res.json({ "message": "success", "data": row, "changes": this.changes });
    });
  });
});

app.delete('/api/appointments/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM appointments WHERE id = ?';
    db.run(sql, id, function(err) {
        if (err) { res.status(400).json({ "error": err.message }); return; }
        res.json({ "message": "deleted", "changes": this.changes });
    });
});

// --- ROTAS DE RELATÓRIOS ---
app.get('/api/reports/stats', authenticateToken, (req, res) => {
  const queries = {
    totalBeneficiaries: "SELECT COUNT(*) as count FROM beneficiaries",
    totalAppointments: "SELECT COUNT(*) as count FROM appointments",
    appointmentsByStatus: "SELECT status, COUNT(*) as count FROM appointments GROUP BY status",
    beneficiariesByProgram: `SELECT p.name, COUNT(bp.beneficiary_id) as count FROM programs p LEFT JOIN beneficiary_programs bp ON p.id = bp.program_id GROUP BY p.name`
  };

  const results = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, sql]) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        if (!res.headersSent) { res.status(500).json({ "error": `Failed to fetch ${key}: ${err.message}` }); }
        return;
      }
      if (key === 'totalBeneficiaries' || key === 'totalAppointments') { results[key] = rows[0].count; } 
      else { results[key] = rows; }
      
      completedQueries++;
      if (completedQueries === totalQueries) { res.json({ "message": "success", "data": results }); }
    });
  });
});

// --- ROTAS DE CADÚNICO ---
app.get('/api/cadunico/search', authenticateToken, (req, res) => {
  const { cpf } = req.query;
  if (!cpf) { return res.status(400).json({ "error": "CPF é obrigatório" }); }
  const sql = "SELECT * FROM cadunico_data WHERE cpf = ?";
  db.get(sql, [cpf], (err, row) => {
    if (err) { res.status(400).json({ "error": err.message }); return; }
    if (row) { res.json({ "message": "success", "data": row }); } 
    else { res.status(404).json({ "message": "CPF não encontrado na base de dados local do CadÚnico." }); }
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
