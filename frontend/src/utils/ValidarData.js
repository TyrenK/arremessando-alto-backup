export function dataValida(texto) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto || '');
  if (!partes) return false;

  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = Number(partes[3]);
  if (ano < 1900) return false;

  const data = new Date(ano, mes - 1, dia);
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return false;
  }

  return data.getTime() <= Date.now();
}