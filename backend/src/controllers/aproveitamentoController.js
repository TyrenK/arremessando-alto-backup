const db = require("../config/db");

async function registrarAproveitamento(req, res) {
  const id_jogador = req.jogador.id_jogador;
  const { tentativas, acertos, tempo, id_aula, titulo } = req.body;

  if (tentativas === undefined || acertos === undefined) {
    return res.status(400).json({ mensagem: "Tentativas e acertos são obrigatórios." });
  }

  const aproveitamento = tentativas > 0
    ? ((acertos / tentativas) * 100).toFixed(2)
    : 0;

  const tituloFinal = (titulo || "Treino Livre").trim() || "Treino Livre";

  try {
    await db.query(
      `INSERT INTO RegistroAproveitamento
        (tentativas, acertos, aproveitamento, tempo, id_jogador, id_aula, titulo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tentativas,
        acertos,
        aproveitamento,
        tempo || null,
        id_jogador,
        id_aula || null,
        tituloFinal,
      ]
    );

    return res.status(201).json({
      mensagem: "Aproveitamento registrado!",
      aproveitamento: `${aproveitamento}%`,
    });
  } catch (error) {
    console.error("Erro ao registrar aproveitamento:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
}

async function listarHistorico(req, res) {
  const id_jogador = req.jogador.id_jogador;

  try {
    const [rows] = await db.query(
      `SELECT
        ra.id_reg_aprov,
        ra.tentativas,
        ra.acertos,
        ra.aproveitamento,
        ra.tempo,
        ra.titulo,
        ra.data_registro,
        a.numero_aula,
        a.semana,
        a.dia
       FROM RegistroAproveitamento ra
       LEFT JOIN Aulas a ON ra.id_aula = a.id_aula
       WHERE ra.id_jogador = ?
       ORDER BY ra.data_registro DESC`,
      [id_jogador]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao listar histórico:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
}

module.exports = { registrarAproveitamento, listarHistorico };
