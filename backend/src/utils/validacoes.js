const dns = require("dns").promises;

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIMEOUT_DNS_MS = 3000;

const ERROS_DOMINIO_INEXISTENTE = ["ENOTFOUND", "ENODATA"];

function emailFormatoValido(email) {
  return typeof email === "string" && email.length <= 254 && REGEX_EMAIL.test(email);
}

function comTimeout(promessa, ms) {
  let temporizador;
  const limite = new Promise((_, reject) => {
    temporizador = setTimeout(
      () => reject(Object.assign(new Error("Tempo esgotado"), { code: "ETIMEOUT" })),
      ms
    );
  });
  return Promise.race([promessa, limite]).finally(() => clearTimeout(temporizador));
}

async function dominioRecebeEmail(email) {
  const dominio = String(email).split("@").pop().trim().toLowerCase();

  try {
    const registros = await comTimeout(dns.resolveMx(dominio), TIMEOUT_DNS_MS);
    if (registros.length > 0) {
      return registros.some((r) => r.exchange && r.exchange !== ".");
    }
  } catch (erro) {
    if (!ERROS_DOMINIO_INEXISTENTE.includes(erro.code)) return true;
  }

  try {
    const enderecos = await comTimeout(dns.resolve4(dominio), TIMEOUT_DNS_MS);
    return enderecos.length > 0;
  } catch (erro) {
    return !ERROS_DOMINIO_INEXISTENTE.includes(erro.code);
  }
}

function dataNascimentoValida(valor) {
  if (typeof valor !== "string") return false;

  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!partes) return false;

  const ano = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  if (ano < 1900) return false;

  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    return false;
  }

  // Tolerância de 1 dia por causa de fuso horário
  const umDiaDepois = Date.now() + 24 * 60 * 60 * 1000;
  return data.getTime() <= umDiaDepois;
}

module.exports = { emailFormatoValido, dominioRecebeEmail, dataNascimentoValida };