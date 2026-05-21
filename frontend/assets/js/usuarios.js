import { apiFetch, exigirAdmin } from './api.js';
import { montarNavbar, toast, tratarErro, atualizarIcones } from './ui.js';

const modal = new bootstrap.Modal(document.getElementById('modalUsuario'));
const form = document.getElementById('formUsuario');

exigirAdmin();
montarNavbar('usuarios');
carregarUsuarios();

document.getElementById('btnNovoUsuario').addEventListener('click', () => abrirModal());
document.getElementById('formFiltro').addEventListener('submit', (evento) => {
  evento.preventDefault();
  carregarUsuarios();
});

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = document.getElementById('usuarioId').value;
  document.getElementById('senha').required = !id;

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const dados = Object.fromEntries(new FormData(form));
  if (id && !dados.senha) delete dados.senha;

  try {
    await apiFetch(`/usuarios${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: dados
    });
    toast('Usuario salvo com sucesso.');
    modal.hide();
    carregarUsuarios();
  } catch (erro) {
    tratarErro(erro);
  }
});

async function carregarUsuarios() {
  try {
    const busca = document.getElementById('busca').value;
    const tipo = document.getElementById('tipoUsuarioFiltro').value;
    const resposta = await apiFetch(`/usuarios?busca=${encodeURIComponent(busca)}&tipo_usuario=${encodeURIComponent(tipo)}`);
    const tbody = document.getElementById('tabelaUsuarios');
    tbody.innerHTML = resposta.dados.map((usuario) => `
      <tr>
        <td class="fw-semibold">${usuario.nome}</td>
        <td>${usuario.email}</td>
        <td>${usuario.telefone || '-'}</td>
        <td><span class="badge text-bg-${usuario.tipo_usuario === 'admin' ? 'dark' : 'info'}">${usuario.tipo_usuario}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-dark btn-icon" title="Editar" data-editar="${usuario.id}">
            <i data-lucide="pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-icon" title="Excluir" data-excluir="${usuario.id}">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="text-center text-muted">Nenhum usuario encontrado.</td></tr>';

    tbody.querySelectorAll('[data-editar]').forEach((botao) => botao.addEventListener('click', () => editar(botao.dataset.editar)));
    tbody.querySelectorAll('[data-excluir]').forEach((botao) => botao.addEventListener('click', () => excluir(botao.dataset.excluir)));
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

async function editar(id) {
  try {
    const resposta = await apiFetch(`/usuarios/${id}`);
    abrirModal(resposta.dados);
  } catch (erro) {
    tratarErro(erro);
  }
}

async function excluir(id) {
  if (!confirm('Confirma a exclusao deste usuario?')) return;
  try {
    await apiFetch(`/usuarios/${id}`, { method: 'DELETE' });
    toast('Usuario removido.');
    carregarUsuarios();
  } catch (erro) {
    tratarErro(erro);
  }
}

function abrirModal(usuario = null) {
  form.reset();
  form.classList.remove('was-validated');
  document.getElementById('usuarioId').value = usuario?.id || '';
  document.getElementById('tituloModal').textContent = usuario ? 'Editar usuario' : 'Novo usuario';
  document.getElementById('nome').value = usuario?.nome || '';
  document.getElementById('email').value = usuario?.email || '';
  document.getElementById('telefone').value = usuario?.telefone || '';
  document.getElementById('tipo_usuario').value = usuario?.tipo_usuario || 'usuario';
  document.getElementById('senha').value = '';
  document.getElementById('senha').required = !usuario;
  modal.show();
  atualizarIcones();
}

