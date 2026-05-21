import { apiFetch, limparSessao, usuarioLogado, caminhoIndex } from './api.js';

export function montarNavbar(ativo) {
  const usuario = usuarioLogado();
  const alvo = document.getElementById('navbar');
  if (!alvo) return;

  const admin = usuario?.tipo_usuario === 'admin';
  const itens = admin ? [
    ['dashboard', 'Dashboard', 'layout-dashboard', 'dashboard.html'],
    ['jogos', 'Jogos', 'gamepad-2', 'jogos.html'],
    ['categorias', 'Categorias', 'tags', 'categorias.html'],
    ['usuarios', 'Usuarios', 'users', 'usuarios.html'],
    ['emprestimos', 'Emprestimos/Reservas', 'clipboard-list', 'emprestimos.html'],
    ['relatorios', 'Relatorios', 'file-text', 'relatorios.html'],
    ['importacao', 'Importacao/Exportacao', 'database', 'importacao.html'],
    ['logs', 'Logs', 'scroll-text', 'logs.html']
  ] : [
    ['catalogo', 'Catalogo', 'gamepad-2', 'catalogo.html'],
    ['minhas-reservas', 'Minhas Reservas', 'calendar-check', 'minhas-reservas.html'],
    ['historico', 'Historico', 'history', 'historico.html'],
    ['perfil', 'Meu Perfil', 'user-circle', 'perfil.html']
  ];

  alvo.innerHTML = `
    <nav class="navbar navbar-expand-xl app-navbar">
      <div class="container-fluid">
        <a class="navbar-brand brand-mark" href="${admin ? 'dashboard.html' : 'catalogo.html'}">
          <span class="brand-symbol">LG</span>
          <span>LocaGames Univap</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="menuPrincipal">
          <ul class="navbar-nav me-auto mb-2 mb-xl-0">
            ${itens.map(([id, label, icon, href]) => `
              <li class="nav-item">
                <a class="nav-link ${ativo === id ? 'active' : ''}" href="${href}">
                  <i data-lucide="${icon}"></i>${label}
                </a>
              </li>
            `).join('')}
          </ul>
          <div class="user-chip">
            <span>${usuario?.nome || usuario?.email || ''}</span>
            <small>${admin ? 'Administrador' : 'Usuario'}</small>
          </div>
          <button class="btn btn-ghost btn-sm" id="btnLogout">
            <i data-lucide="log-out"></i>Sair
          </button>
        </div>
      </div>
    </nav>
  `;

  document.getElementById('btnLogout').addEventListener('click', async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (erro) {
      console.warn(erro);
    }
    limparSessao();
    window.location.href = caminhoIndex();
  });

  atualizarIcones();
}

export function toast(mensagem, tipo = 'success') {
  const container = obterToastContainer();
  const id = `toast-${Date.now()}`;
  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center text-bg-${tipo} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">${mensagem}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `);
  const elemento = document.getElementById(id);
  const instancia = new bootstrap.Toast(elemento, { delay: 3600 });
  instancia.show();
  elemento.addEventListener('hidden.bs.toast', () => elemento.remove());
}

export function tratarErro(erro) {
  const detalhes = Array.isArray(erro?.detalhes) ? ` ${erro.detalhes.join(', ')}` : '';
  toast(`${erro?.mensagem || 'Erro ao processar solicitacao.'}${detalhes}`, 'danger');
}

export function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function badgeStatus(status) {
  const mapa = {
    pendente: 'warning',
    aprovado: 'info',
    retirado: 'primary',
    atrasado: 'danger',
    devolvido: 'success',
    cancelado: 'secondary'
  };
  return `<span class="badge text-bg-${mapa[status] || 'secondary'} status-badge">${status}</span>`;
}

export function textoTipoJogo(tipo) {
  return tipo === 'boardgame' ? 'Board game' : 'Videogame';
}

export function atualizarIcones() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function obterToastContainer() {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
  }
  return container;
}

