const fs = require('node:fs/promises');
const path = require('node:path');

let arquivoDados;

function definirCaminho(pastaDados) {
  arquivoDados = path.join(pastaDados, 'senhas.json');
}

async function lerArquivo() {
  try {
    const conteudo = await fs.readFile(arquivoDados, 'utf8');
    const registros = JSON.parse(conteudo);
    return Array.isArray(registros) ? registros : [];
  } catch (erro) {
    if (erro.code === 'ENOENT') return [];
    throw erro;
  }
}

async function gravarArquivo(registros) {
  await fs.mkdir(path.dirname(arquivoDados), { recursive: true });
  await fs.writeFile(arquivoDados, JSON.stringify(registros, null, 2), 'utf8');
}

async function listar() {
  return lerArquivo();
}

async function salvar(registro) {
  const registros = await lerArquivo();

  if (registro.id) {
    const indice = registros.findIndex(item => item.id === registro.id);
    if (indice === -1) throw new Error('Registro não encontrado.');
    registros[indice] = { ...registros[indice], ...registro };
  } else {
    const novoRegistro = {
      ...registro,
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      dataCriacao: new Date().toISOString()
    };
    registros.push(novoRegistro);
    await gravarArquivo(registros);
    return novoRegistro;
  }

  await gravarArquivo(registros);
  return registros.find(item => item.id === registro.id);
}

async function excluir(id) {
  const registros = await lerArquivo();
  const atualizados = registros.filter(item => item.id !== id);

  if (atualizados.length === registros.length) {
    throw new Error('Registro não encontrado.');
  }

  await gravarArquivo(atualizados);
}

module.exports = { definirCaminho, listar, salvar, excluir };