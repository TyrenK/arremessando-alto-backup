const db = require("../config/db");

async function listarAulasPorSemana(req, res) {
  const { semana } = req.query;

  if (!semana) {
    return res.status(400).json({ mensagem: "Informe o número da semana." });
  }

  try {
    const [rows] = await db.query(
      `SELECT
        id_aula,
        semana,
        dia,
        numero_aula,
        titulo,
        explicacao,
        conclusao,
        gif_url
       FROM Aulas
       WHERE semana = ?
       ORDER BY dia, numero_aula`,
      [semana]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao listar aulas:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
}

async function buscarProgresso(req, res) {
  const id_jogador = req.jogador.id_jogador;

  try {
    const [rows] = await db.query("CALL BuscarProgressoJogador(?)", [id_jogador]);
    return res.status(200).json(rows[0][0] || {});
  } catch (error) {
    console.error("Erro ao buscar progresso:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
}

async function atualizarProgresso(req, res) {
  const id_jogador = req.jogador.id_jogador;
  const { semana_ult_aula, dia_ult_aula, ult_aula_realizada } = req.body;

  try {
    const [jogador] = await db.query(
      "SELECT id_prog_aula FROM Jogador WHERE id_jogador = ?",
      [id_jogador]
    );

    if (jogador.length === 0) {
      return res.status(404).json({ mensagem: "Jogador não encontrado." });
    }

    await db.query(
      `UPDATE ProgressoAula
       SET semana_ult_aula = ?, dia_ult_aula = ?, ult_aula_realizada = ?
       WHERE id_prog_aula = ?`,
      [semana_ult_aula, dia_ult_aula, ult_aula_realizada, jogador[0].id_prog_aula]
    );

    return res.status(200).json({ mensagem: "Progresso atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar progresso:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
}

module.exports = { listarAulasPorSemana, buscarProgresso, atualizarProgresso };
