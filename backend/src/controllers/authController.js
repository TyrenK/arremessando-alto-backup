const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function cadastrar(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: "Email e senha são obrigatórios." });
  }

  try {
    const [jogadorExistente] = await db.query(
      "SELECT id_jogador FROM Jogador WHERE email = ?",
      [email]
    );

    if (jogadorExistente.length > 0) {
      return res.status(409).json({ mensagem: "Email já cadastrado." });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await db.query("CALL AdicionarJogador(?, ?, ?, ?, ?)", [
      email,
      senhaCriptografada,
      "Novo Jogador",
      null,
      null,
    ]);

    return res.status(201).json({ mensagem: "Jogador cadastrado com sucesso!" });

  } catch (error) {
    console.error("Erro ao cadastrar jogador:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
}

async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: "Email e senha são obrigatórios." });
  }

  try {
    const [rows] = await db.query(
      "SELECT id_jogador, email, senha, nome FROM Jogador WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ mensagem: "Email ou senha incorretos." });
    }

    const jogador = rows[0];
    const senhaCorreta = await bcrypt.compare(senha, jogador.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: "Email ou senha incorretos." });
    }

    const token = jwt.sign(
      { id_jogador: jogador.id_jogador, email: jogador.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
      jogador: {
        id: jogador.id_jogador,
        nome: jogador.nome,
        email: jogador.email,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
}

module.exports = { cadastrar, login };