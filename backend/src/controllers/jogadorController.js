const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const { emailFormatoValido, dominioRecebeEmail, dataNascimentoValida } = require("../utils/validacoes");

async function buscarPerfil(req, res) {
  const id_jogador = req.jogador.id_jogador;

  try {
    const [rows] = await db.query(
      `SELECT
        j.id_jogador,
        j.nome,
        j.email,
        j.data_nascimento,
        j.foto_url,
        e.exp_basq
       FROM Jogador j
       LEFT JOIN ExperienciaBasquete e ON j.id_exp_basq = e.id_exp_basq
       WHERE j.id_jogador = ?`,
      [id_jogador]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: "Jogador não encontrado." });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
}

async function atualizarPerfil(req, res) {
  const id_jogador = req.jogador.id_jogador;
  const { nome, email, data_nascimento } = req.body;

  if (email) {
    if (!emailFormatoValido(email)) {
      return res.status(400).json({ mensagem: "Digite um email válido." });
    }

    if (!(await dominioRecebeEmail(email))) {
      return res.status(400).json({
        mensagem: "O domínio desse email não existe ou não recebe mensagens. Verifique se digitou corretamente.",
      });
    }
  }

  if (data_nascimento && !dataNascimentoValida(data_nascimento)) {
    return res.status(400).json({ mensagem: "Data de nascimento inválida." });
  }

  try {
    await db.query("CALL AtualizarDadosJogador(?, ?, ?, ?)", [
      id_jogador,
      nome,
      email,
      data_nascimento || null,
    ]);

    return res.status(200).json({ mensagem: "Perfil atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
}

async function atualizarFoto(req, res) {
  const id_jogador = req.jogador.id_jogador;

  if (!req.file) {
    return res.status(400).json({ mensagem: "Envie uma foto." });
  }

  try {
    const resultado = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "arremessando-alto/perfis",
          resource_type: "image",
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );

      stream.end(req.file.buffer);
    });

    await db.query(
      "UPDATE Jogador SET foto_url = ? WHERE id_jogador = ?",
      [resultado.secure_url, id_jogador]
    );

    return res.status(200).json({
      mensagem: "Foto atualizada com sucesso!",
      foto_url: resultado.secure_url,
    });
  } catch (error) {
    console.error("Erro ao enviar foto para o Cloudinary:", error);
    return res.status(500).json({ mensagem: "Não foi possível salvar a foto." });
  }
}

async function atualizarExperiencia(req, res) {
  const id_jogador = req.jogador.id_jogador;
  const { exp_basq } = req.body;

  const valoresValidos = ["iniciante", "intermediario", "experiente", "profissional"];

  if (!valoresValidos.includes(exp_basq)) {
    return res.status(400).json({ mensagem: "Experiência inválida." });
  }

  try {
    await db.query("CALL AtualizarExperienciaJogador(?, ?)", [id_jogador, exp_basq]);

    return res.status(200).json({ mensagem: "Experiência atualizada com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar experiência:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
}

module.exports = {
  buscarPerfil,
  atualizarPerfil,
  atualizarFoto,
  atualizarExperiencia,
};