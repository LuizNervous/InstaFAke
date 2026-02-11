const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'fotos/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const app = express();
app.use('/fotos', express.static('fotos'));



// Permite que o seu HTML converse com este servidor
app.use(cors());
app.use(express.json());


// 1. Conectando com o banco de dados que você criou no Workbench
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Padrão do MySQL
    password: '99321376Ll*', // Coloque sua senha do MySQL aqui!
    database: 'database_instafake' // O nome exato do seu banco
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err);
        return;
    }
    console.log('✅ Conectado ao MySQL com sucesso!');
});

// 2. Criando a "Rota" que o seu HTML vai chamar para pedir os posts
app.get('/api/posts', (req, res) => {
    // O comando SQL que pega os posts e o nome de quem postou
    const sql = `
        SELECT posts.*, usuarios.nome 
        FROM posts 
        JOIN usuarios ON posts.usuario_id = usuarios.id 
        ORDER BY data_postagem DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erro: 'Erro ao buscar posts' });
        }
        res.json(results); // Envia os dados para o seu HTML!
    });
});

// ROTA DE CADASTRO
app.post('/api/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;
    // Verifica se já existe
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0) {
            return res.status(400).json({ erro: "Email já cadastrado!" });
        }


        // Cria o usuário
        const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
        db.query(sql, [nome, email, senha], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ mensagem: "Usuário criado com sucesso!" });
        });
    });
});
// ROTA DE LOGIN (Estava faltando isso!)
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    // 1. Procura no banco se tem alguém com esse email e senha
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';

    db.query(sql, [email, senha], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erro: "Erro interno no servidor" });
        }

        // 2. Se achou alguém (results maior que 0)
        if (results.length > 0) {
            const usuario = results[0];
            // Devolve os dados para o site saber quem logou
            res.json({
                sucesso: true,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                }
            });
        } else {
            // 3. Se não achou, avisa que está errado
            res.status(401).json({ sucesso: false, erro: "Email ou senha incorretos" });
        }
    });
});

app.post("/api/postar", upload.single('imagem'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ erro: "Nenhuma imagem enviada!" });
    }
    const { legenda, usuario_id } = req.body;
    const caminhoImagem = `http://localhost:3000/fotos/${req.file.filename}`;
    const sql = 'INSERT INTO posts (usuario_id, imagem_url, legenda) VALUES(?,?,?)';

db.query(sql, [usuario_id,caminhoImagem , legenda], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({mensagem:"Post criado!"});
})
});

// --- ATUALIZAÇÃO DA ROTA DO FEED ---
// Agora ela aceita um ?id=... na URL para saber quem está olhando o feed
app.get('/api/posts', (req, res) => {
    const idUsuarioLogado = req.query.id; // Pega o ID de quem está logado

    // Esse SQL é avançado! Ele conta os likes E verifica se VOCÊ curtiu
    const sql = `
        SELECT 
            posts.*, 
            usuarios.nome,
            (SELECT COUNT(*) FROM curtidas WHERE post_id = posts.id) as num_curtidas,
            (SELECT COUNT(*) FROM curtidas WHERE post_id = posts.id AND usuario_id = ?) as curtiu
        FROM posts 
        JOIN usuarios ON posts.usuario_id = usuarios.id 
        ORDER BY data_postagem DESC
    `;
    
    db.query(sql, [idUsuarioLogado], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar posts' });
        res.json(results);
    });
});

// --- NOVA ROTA: DAR (OU TIRAR) LIKE ---
app.post('/api/curtir', (req, res) => {
    const { usuario_id, post_id } = req.body;

    // 1. Verifica se já curtiu
    const sqlCheck = 'SELECT * FROM curtidas WHERE usuario_id = ? AND post_id = ?';
    
    db.query(sqlCheck, [usuario_id, post_id], (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length > 0) {
            // JÁ CURTIU -> ENTÃO REMOVE (Descurtir)
            db.query('DELETE FROM curtidas WHERE usuario_id = ? AND post_id = ?', [usuario_id, post_id], (error) => {
                if (error) return res.status(500).json(error);
                res.json({ curtiu: false }); // Avisa o site que agora NÃO está curtido
            });
        } else {
            // NÃO CURTIU -> ENTÃO ADICIONA (Curtir)
            db.query('INSERT INTO curtidas (usuario_id, post_id) VALUES (?, ?)', [usuario_id, post_id], (error) => {
                if (error) return res.status(500).json(error);
                res.json({ curtiu: true }); // Avisa o site que agora ESTÁ curtido
            });
        }
    });
});

// 3. Ligando o servidor na porta 3000
app.listen(3000, () => {
    console.log('🚀 Servidor rodando! Acesse: http://localhost:3000/api/posts');
});