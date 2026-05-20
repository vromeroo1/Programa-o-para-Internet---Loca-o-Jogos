import { apiFetch, exigirLogin, baixarBlob } from './api.js';
import { montarNavbar, toast, tratarErro, moeda, badgeStatus, atualizarIcones } from './ui.js';

const modalEmprestimo = new bootstrap.Modal(document.getElementById('modalEmprestimo'));
const modalEdicao = new bootstrap.Modal(document.getElementById('modalEdicao'));
const formEmprestimo = document.getElementById('formEmprestimo');
const formEdicao = document.getElementById('formEdicao');
let usuarios = [];
let jogos = [];

exigirLogin();
montarNavbar('emprestimos');
iniciar();

document.getElementById('btnNovoEmprestimo').addEventListener('click', abrirModalNovo);
document.getElementById('btnAdicionarItem').addEventListener('click', () => adicionarItem());
document.getElementById('btnPdfEmprestimos').addEventListener('click', baixarPdf);
document.getElementById('formFiltro').addEventListener('submit', (evento) => {
  evento.preventDefault();
  carregarEmprestimos();
});

formEmprestimo.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!formEmprestimo.checkValidity()) {
    formEmprestimo.classList.add('was-validated');
    return;
  }

  const itens = [...document.querySelectorAll('.item-row')].map((row) => ({
    jogo_id: Number(row.querySelector('[data-jogo]').value),
    quantidade: Number(row.querySelector('[data-quantidade]').value)
  }));

  try {
    await apiFetch('/emprestimos', {
      method: 'POST',
      body: {
        usuario_id: Number(document.getElementById('usuario_id').value),
        data_prevista_devolucao: document.getElementById('data_prevista_devolucao').value,
        observacoes: document.getElementById('observacoes').value,
        itens
      }
    });
    toast('Emprestimo criado com sucesso.');
    modalEmprestimo.hide();
    await carregarEmprestimos();
  } catch (erro) {
    tratarErro(erro);
  }
});

formEdicao.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = document.getElementById('emprestimoIdEdicao').value;
  try {
    await apiFetch(`/emprestimos/${id}`, {
      method: 'PUT',
      body: {
        data_prevista_devolucao: document.getElementById('dataPrevistaEdicao').value,
        status: document.getElementById('statusEdicao').value,
        observacoes: document.getElementById('observacoesEdicao').value
      }
    });
    toast('Emprestimo atualizado.');
    modalEdicao.hide();
    carregarEmprestimos();
  } catch (erro) {
    tratarErro(erro);
  }
});

async function iniciar() {
  const [usuariosResposta, jogosResposta] = await Promise.all([
    apiFetch('/usuarios'),
    apiFetch('/jogos?disponiveis=1')
  ]);
  usuarios = usuariosResposta.dados;
  jogos = jogosResposta.dados;
  preencherCombos();
  await carregarEmprestimos();
}

function preencherCombos() {
  const usuariosOptions = '<option value="">Todos</option>' + usuarios.map((usuario) => `<option value="${usuario.id}">${usuario.nome}</option>`).join('');
  document.getElementById('usuarioFiltro').innerHTML = usuariosOptions;
  document.getElementById('usuario_id').innerHTML = usuarios.map((usuario) => `<option value="${usuario.id}">${usuario.nome}</option>`).join('');
}

async function carregarEmprestimos() {
  try {
    const params = new URLSearchParams({
      usuario_id: document.getElementById('usuarioFiltro').value,
      status: document.getElementById('statusFiltro').value
    });
    const resposta = await apiFetch(`/emprestimos?${params}`);
    const tbody = document.getElementById('tabelaEmprestimos');
    tbody.innerHTML = resposta.dados.map((emprestimo) => `
      <tr>
        <td>#${emprestimo.id}</td>
        <td class="fw-semibold">${emprestimo.usuario_nome}</td>
        <td>${String(emprestimo.data_emprestimo).slice(0, 10)}</td>
        <td>${String(emprestimo.data_prevista_devolucao).slice(0, 10)}</td>
        <td>${badgeStatus(emprestimo.status)}</td>
        <td class="text-end">${emprestimo.total_itens}</td>
        <td class="text-end">${moeda(emprestimo.valor_total)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-dark btn-icon" title="Editar" data-editar="${emprestimo.id}">
            <i data-lucide="pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-success btn-icon" title="Devolver" data-devolver="${emprestimo.id}" ${emprestimo.status === 'devolvido' ? 'disabled' : ''}>
            <i data-lucide="check"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-icon" title="Excluir" data-excluir="${emprestimo.id}">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="8" class="text-center text-muted">Nenhum emprestimo encontrado.</td></tr>';

    tbody.querySelectorAll('[data-editar]').forEach((botao) => botao.addEventListener('click', () => editar(botao.dataset.editar)));
    tbody.querySelectorAll('[data-devolver]').forEach((botao) => botao.addEventListener('click', () => devolver(botao.dataset.devolver)));
    tbody.querySelectorAll('[data-excluir]').forEach((botao) => botao.addEventListener('click', () => excluir(botao.dataset.excluir)));
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

function abrirModalNovo() {
  formEmprestimo.reset();
  formEmprestimo.classList.remove('was-validated');
  document.getElementById('listaItens').innerHTML = '';
  adicionarItem();
  modalEmprestimo.show();
  atualizarIcones();
}

function adicionarItem() {
  const lista = document.getElementById('listaItens');
  const div = document.createElement('div');
  div.className = 'item-row';
  div.innerHTML = `
    <select class="form-select" data-jogo required>
      ${jogos.map((jogo) => `<option value="${jogo.id}">${jogo.titulo} - estoque ${jogo.estoque}</option>`).join('')}
    </select>
    <input type="number" class="form-control" data-quantidade min="1" value="1" required>
    <button type="button" class="btn btn-outline-danger btn-icon" title="Remover item"><i data-lucide="x"></i></button>
  `;
  div.querySelector('button').addEventListener('click', () => div.remove());
  lista.appendChild(div);
  atualizarIcones();
}

async function editar(id) {
  try {
    const resposta = await apiFetch(`/emprestimos/${id}`);
    const emprestimo = resposta.dados;
    document.getElementById('emprestimoIdEdicao').value = emprestimo.id;
    document.getElementById('dataPrevistaEdicao').value = String(emprestimo.data_prevista_devolucao).slice(0, 10);
    document.getElementById('statusEdicao').value = emprestimo.status;
    document.getElementById('observacoesEdicao').value = emprestimo.observacoes || '';
    modalEdicao.show();
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

async function devolver(id) {
  if (!confirm('Confirmar devolucao deste emprestimo?')) return;
  try {
    await apiFetch(`/emprestimos/${id}/devolver`, { method: 'POST' });
    toast('Devolucao registrada.');
    carregarEmprestimos();
  } catch (erro) {
    tratarErro(erro);
  }
}

async function excluir(id) {
  if (!confirm('Confirma a exclusao deste emprestimo?')) return;
  try {
    await apiFetch(`/emprestimos/${id}`, { method: 'DELETE' });
    toast('Emprestimo removido.');
    carregarEmprestimos();
  } catch (erro) {
    tratarErro(erro);
  }
}

async function baixarPdf() {
  try {
    const pdf = await apiFetch('/relatorios/emprestimos/pdf');
    baixarBlob(pdf, 'relatorio-emprestimos.pdf');
  } catch (erro) {
    tratarErro(erro);
  }
}
