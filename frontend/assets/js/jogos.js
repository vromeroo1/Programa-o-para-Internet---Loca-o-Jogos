import { apiFetch, exigirAdmin, baixarBlob } from './api.js';
import { montarNavbar, toast, tratarErro, moeda, atualizarIcones, textoTipoJogo } from './ui.js';

const modal = new bootstrap.Modal(document.getElementById('modalJogo'));
const form = document.getElementById('formJogo');
let categorias = [];

exigirAdmin();
montarNavbar('jogos');
iniciar();

document.getElementById('btnNovoJogo').addEventListener('click', () => abrirModal());
document.getElementById('btnPdfJogos').addEventListener('click', baixarPdf);
document.querySelectorAll('[data-tipo-tab]').forEach((botao) => {
  botao.addEventListener('click', () => {
    document.querySelectorAll('[data-tipo-tab]').forEach((item) => item.classList.remove('active'));
    botao.classList.add('active');
    document.getElementById('tipoFiltro').value = botao.dataset.tipoTab;
    carregarJogos();
  });
});
document.getElementById('formFiltro').addEventListener('submit', (evento) => {
  evento.preventDefault();
  carregarJogos();
});

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const id = document.getElementById('jogoId').value;
  const formData = montarFormData();

  try {
    await apiFetch(`/jogos${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: formData
    });
    toast('Jogo salvo com sucesso.');
    modal.hide();
    carregarJogos();
  } catch (erro) {
    tratarErro(erro);
  }
});

async function iniciar() {
  await carregarCategorias();
  await carregarJogos();
}

async function carregarCategorias() {
  const resposta = await apiFetch('/categorias');
  categorias = resposta.dados;
  const options = '<option value="">Todas</option>' + categorias.map((categoria) => `<option value="${categoria.id}">${categoria.nome}</option>`).join('');
  document.getElementById('categoriaFiltro').innerHTML = options;
  document.getElementById('categoria_id').innerHTML = categorias.map((categoria) => `<option value="${categoria.id}">${categoria.nome}</option>`).join('');
}

async function carregarJogos() {
  try {
    const params = new URLSearchParams({
      busca: document.getElementById('busca').value,
      categoria_id: document.getElementById('categoriaFiltro').value,
      tipo_jogo: document.getElementById('tipoFiltro').value,
      disponiveis: document.getElementById('disponiveisFiltro').value
    });
    const resposta = await apiFetch(`/jogos?${params}`);
    const tbody = document.getElementById('tabelaJogos');
    tbody.innerHTML = resposta.dados.map((jogo) => `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            ${jogo.imagem ? `<img class="game-cover" src="${jogo.imagem}" alt="">` : '<div class="game-cover"></div>'}
            <div><div class="fw-semibold">${jogo.titulo}</div><small class="text-muted">${(jogo.descricao || '').slice(0, 70)}</small></div>
          </div>
        </td>
        <td>${jogo.categoria_nome}</td>
        <td>${textoTipoJogo(jogo.tipo_jogo)}</td>
        <td>${jogo.plataforma || '-'}</td>
        <td class="text-end">${moeda(jogo.valor_aluguel)}</td>
        <td class="text-end">${jogo.estoque}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-dark btn-icon" title="Editar" data-editar="${jogo.id}">
            <i data-lucide="pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-icon" title="Excluir" data-excluir="${jogo.id}">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="7" class="text-center text-muted">Nenhum jogo encontrado.</td></tr>';

    tbody.querySelectorAll('[data-editar]').forEach((botao) => botao.addEventListener('click', () => editar(botao.dataset.editar)));
    tbody.querySelectorAll('[data-excluir]').forEach((botao) => botao.addEventListener('click', () => excluir(botao.dataset.excluir)));
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

async function editar(id) {
  try {
    const resposta = await apiFetch(`/jogos/${id}`);
    abrirModal(resposta.dados);
  } catch (erro) {
    tratarErro(erro);
  }
}

async function excluir(id) {
  if (!confirm('Confirma a exclusao deste jogo?')) return;
  try {
    await apiFetch(`/jogos/${id}`, { method: 'DELETE' });
    toast('Jogo removido.');
    carregarJogos();
  } catch (erro) {
    tratarErro(erro);
  }
}

function abrirModal(jogo = null) {
  form.reset();
  form.classList.remove('was-validated');
  document.getElementById('jogoId').value = jogo?.id || '';
  document.getElementById('tituloModal').textContent = jogo ? 'Editar jogo' : 'Novo jogo';
  document.getElementById('titulo').value = jogo?.titulo || '';
  document.getElementById('categoria_id').value = jogo?.categoria_id || categorias[0]?.id || '';
  document.getElementById('tipo_jogo').value = jogo?.tipo_jogo || 'videogame';
  document.getElementById('plataforma').value = jogo?.plataforma || '';
  document.getElementById('valor_aluguel').value = jogo?.valor_aluguel || '';
  document.getElementById('estoque').value = jogo?.estoque ?? '';
  document.getElementById('descricao').value = jogo?.descricao || '';
  modal.show();
  atualizarIcones();
}

function montarFormData() {
  const formData = new FormData();
  ['titulo', 'categoria_id', 'tipo_jogo', 'plataforma', 'valor_aluguel', 'estoque', 'descricao'].forEach((campo) => {
    formData.append(campo, document.getElementById(campo).value);
  });
  const arquivo = document.getElementById('imagem').files[0];
  if (arquivo) formData.append('imagem', arquivo);
  return formData;
}

async function baixarPdf() {
  try {
    const pdf = await apiFetch('/relatorios/jogos/pdf');
    baixarBlob(pdf, 'relatorio-jogos.pdf');
  } catch (erro) {
    tratarErro(erro);
  }
}

