const formulario = document.getElementById('senha-form');
const lista = document.getElementById('lista-senhas');
const busca = document.getElementById('busca');
const tamanho = document.getElementById('tamanho');
const tamanhoValor = document.getElementById('tamanho-valor');

let registros = [];

function escaparHTML(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, caractere => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[caractere]);
}

function limparFormulario() {
  formulario.reset();
  document.getElementById('registro-id').value = '';
  document.getElementById('titulo-formulario').textContent = 'Adicionar registro';
  document.getElementById('salvar-btn').textContent = 'Salvar registro';
  document.getElementById('senha').type = 'password';
  document.getElementById('mostrar-senha').textContent = 'Ver';
  tamanho.value = 16;
  tamanhoValor.textContent = '16 caracteres';
}

function renderizarLista() {
  const termo = busca.value.trim().toLowerCase();
  const filtrados = registros.filter(registro =>
    registro.servico.toLowerCase().includes(termo) ||
    registro.usuario.toLowerCase().includes(termo)
  );

  document.getElementById('contador').textContent =
    `${registros.length} ${registros.length === 1 ? 'registro' : 'registros'}`;

  if (filtrados.length === 0) {
    lista.innerHTML = `<p class="vazio">${registros.length ? 'Nenhum resultado encontrado.' : 'Nenhuma senha cadastrada ainda.'}</p>`;
    return;
  }

  lista.innerHTML = filtrados.map(registro => `
    <article class="registro">
      <div class="registro-cabecalho">
        <div>
          <h3>${escaparHTML(registro.servico)}</h3>
          <p class="usuario">${escaparHTML(registro.usuario)}</p>
        </div>
        <div class="registro-acoes">
          <button type="button" data-acao="editar" data-id="${escaparHTML(registro.id)}">Editar</button>
          <button type="button" class="excluir" data-acao="excluir" data-id="${escaparHTML(registro.id)}">Excluir</button>
        </div>
      </div>
      <div class="senha-oculta">••••••••••••</div>
      ${registro.observacao ? `<p class="observacao">${escaparHTML(registro.observacao)}</p>` : ''}
    </article>
  `).join('');
}

async function carregarRegistros() {
  try {
    registros = await window.api.carregarSenhas();
    renderizarLista();
  } catch (erro) {
    lista.innerHTML = '<p class="vazio">Não foi possível carregar os registros.</p>';
    console.error(erro);
  }
}

formulario.addEventListener('submit', async evento => {
  evento.preventDefault();

  const registro = {
    id: document.getElementById('registro-id').value || undefined,
    servico: document.getElementById('servico').value.trim(),
    usuario: document.getElementById('usuario').value.trim(),
    senha: document.getElementById('senha').value,
    observacao: document.getElementById('observacao').value.trim()
  };

  if (!registro.servico || !registro.usuario || !registro.senha) return;

  try {
    const salvo = await window.api.salvarSenha(registro);
    const indice = registros.findIndex(item => item.id === salvo.id);

    if (indice >= 0) registros[indice] = salvo;
    else registros.push(salvo);

    limparFormulario();
    renderizarLista();
  } catch (erro) {
    alert(`Não foi possível salvar: ${erro.message}`);
  }
});

lista.addEventListener('click', async evento => {
  const botao = evento.target.closest('button[data-acao]');
  if (!botao) return;

  const registro = registros.find(item => item.id === botao.dataset.id);
  if (!registro) return;

  if (botao.dataset.acao === 'editar') {
    document.getElementById('registro-id').value = registro.id;
    document.getElementById('servico').value = registro.servico;
    document.getElementById('usuario').value = registro.usuario;
    document.getElementById('senha').value = registro.senha;
    document.getElementById('observacao').value = registro.observacao || '';
    document.getElementById('titulo-formulario').textContent = 'Editar registro';
    document.getElementById('salvar-btn').textContent = 'Atualizar registro';
    document.getElementById('servico').focus();
    return;
  }

  if (botao.dataset.acao === 'excluir') {
    try {
      const resultado = await window.api.excluirSenha(registro.id);
      if (resultado.excluido) {
        registros = registros.filter(item => item.id !== registro.id);
        renderizarLista();
      }
    } catch (erro) {
      alert(`Não foi possível excluir: ${erro.message}`);
    }
  }
});

function numeroAleatorio(limite) {
  const intervalo = 0x100000000;
  const teto = Math.floor(intervalo / limite) * limite;
  const valor = new Uint32Array(1);

  do {
    crypto.getRandomValues(valor);
  } while (valor[0] >= teto);

  return valor[0] % limite;
}

function gerarSenha() {
  const conjuntos = [];
  if (document.getElementById('maiusculas').checked) conjuntos.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  if (document.getElementById('minusculas').checked) conjuntos.push('abcdefghijklmnopqrstuvwxyz');
  if (document.getElementById('numeros').checked) conjuntos.push('0123456789');
  if (document.getElementById('simbolos').checked) conjuntos.push('!@#$%&*()-_=+[]{};:,.?');

  if (conjuntos.length === 0) {
    alert('Selecione pelo menos um tipo de caractere.');
    return;
  }

  const todos = conjuntos.join('');
  const quantidade = Number(tamanho.value);
  const senhaGerada = [];
  conjuntos.forEach(conjunto => {
    senhaGerada.push(conjunto[numeroAleatorio(conjunto.length)]);
  });

  while (senhaGerada.length < quantidade) {
    senhaGerada.push(todos[numeroAleatorio(todos.length)]);
  }

  for (let i = senhaGerada.length - 1; i > 0; i--) {
    const indice = numeroAleatorio(i + 1);
    [senhaGerada[i], senhaGerada[indice]] = [senhaGerada[indice], senhaGerada[i]];
  }

  document.getElementById('senha').value = senhaGerada.slice(0, quantidade).join('');
}

document.getElementById('gerar-btn').addEventListener('click', gerarSenha);
document.getElementById('novo-btn').addEventListener('click', () => {
  limparFormulario();
  document.getElementById('servico').focus();
});
document.getElementById('cancelar-btn').addEventListener('click', limparFormulario);
document.getElementById('mostrar-senha').addEventListener('click', () => {
  const campo = document.getElementById('senha');
  const visivel = campo.type === 'text';
  campo.type = visivel ? 'password' : 'text';
  document.getElementById('mostrar-senha').textContent = visivel ? 'Ver' : 'Ocultar';
});
tamanho.addEventListener('input', () => {
  tamanhoValor.textContent = `${tamanho.value} caracteres`;
});
busca.addEventListener('input', renderizarLista);

window.api.aoSolicitarNovo(() => {
  limparFormulario();
  document.getElementById('servico').focus();
});

carregarRegistros();