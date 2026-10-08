const db = require("../config/db");

// Lista as aulas de uma semana. "conclusao" é por jogador: true se existe uma
// linha em AulaConcluida para (jogador logado, aula).
async function listarAulasPorSemana(req, res) {
  const { semana } = req.query;
  const id_jogador = req.jogador.id_jogador;

  if (!semana) {
    return res.status(400).json({ mensagem: "Informe o número da semana." });
  }

  try {
    const [rows] = await db.query(
      `SELECT
        a.id_aula,
        a.semana,
        a.dia,
        a.numero_aula,
        a.titulo,
        a.explicacao,
        a.gif_url,
        (ac.id_aula IS NOT NULL) AS conclusao
       FROM Aulas a
       LEFT JOIN AulaConcluida ac
         ON ac.id_aula = a.id_aula AND ac.id_jogador = ?
       WHERE a.semana = ?
       ORDER BY a.dia, a.numero_aula`,
      [id_jogador, semana]
    );

    return res.status(200).json(
      rows.map((aula) => ({ ...aula, conclusao: Boolean(aula.conclusao) }))
    );
  } catch (error) {
    console.error("Erro ao listar aulas:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
}

// Marca UMA aula como concluída (não afeta as outras). Repetir a chamada é seguro.
async function concluirAula(req, res) {
  const id_jogador = req.jogador.id_jogador;
  const id_aula = Number(req.params.id);

  if (!Number.isInteger(id_aula) || id_aula < 1) {
    return res.status(400).json({ mensagem: "Aula inválida." });
  }

  try {
    const [aula] = await db.query("SELECT id_aula FROM Aulas WHERE id_aula = ?", [id_aula]);
    if (aula.length === 0) {
      return res.status(404).json({ mensagem: "Aula não encontrada." });
    }

    await db.query(
      "INSERT IGNORE INTO AulaConcluida (id_jogador, id_aula) VALUES (?, ?)",
      [id_jogador, id_aula]
    );

    return res.status(200).json({ mensagem: "Aula marcada como concluída!" });
  } catch (error) {
    console.error("Erro ao concluir aula:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
}

// Desmarca UMA aula (não afeta as outras). Repetir a chamada é seguro.
async function desmarcarAula(req, res) {
  const id_jogador = req.jogador.id_jogador;
  const id_aula = Number(req.params.id);

  if (!Number.isInteger(id_aula) || id_aula < 1) {
    return res.status(400).json({ mensagem: "Aula inválida." });
  }

  try {
    await db.query(
      "DELETE FROM AulaConcluida WHERE id_jogador = ? AND id_aula = ?",
      [id_jogador, id_aula]
    );

    return res.status(200).json({ mensagem: "Conclusão desmarcada." });
  } catch (error) {
    console.error("Erro ao desmarcar aula:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
}

module.exports = { listarAulasPorSemana, concluirAula, desmarcarAula };