import { apiFetch, exigirUsuarioAutenticado } from './api.js';
import { montarNavbar, toast, tratarErro, moeda, atualizarIcones, textoTipoJogo } from './ui.js';

const modalReserva = new bootstrap.Modal(document.getElementById('modalReserva'));
const formReserva = document.getElementById('formReserva');
let tipoAtual = '';

exigirUsuarioAutenticado();
montarNavbar('catalogo');
iniciar();

document.getElementById('formFiltroCatalogo').addEventListener('submit', (evento) => {
  evento.preventDefault();
  carregarCatalogo();
});

document.querySelectorAll('[data-tipo-tab]').forEach((botao) => {
  botao.addEventListener('click', () => {
    document.querySelectorAll('[data-tipo-tab]').forEach((item) => item.classList.remove('active'));
    botao.classList.add('active');
    tipoAtual = botao.dataset.tipoTab;
    carregarCatalogo();
  });
});

formReserva.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  if (!formReserva.checkValidity()) {
    formReserva.classList.add('was-validated');
    return;
  }

  try {
    await apiFetch('/reservas', {
      method: 'POST',
      body: {
        data_prevista_devolucao: document.getElementById('dataPrevista').value,
        itens: [{ jogo_id: Number(document.getElementById('jogoReservaId').value), quantidade: 1 }]
      }
    });
    toast('Reserva solicitada. Aguarde a aprovacao do administrador.');
    modalReserva.hide();
    carregarCatalogo();
  } catch (erro) {
    tratarErro(erro);
  }
});

async function iniciar() {
  await carregarCategorias();
  await carregarCatalogo();
}

async function carregarCategorias() {
  const resposta = await apiFetch('/categorias');
  document.getElementById('categoriaFiltro').innerHTML = '<option value="">Todos</option>'
    + resposta.dados.map((categoria) => `<option value="${categoria.id}">${categoria.nome}</option>`).join('');
}

async function carregarCatalogo() {
  try {
    const params = new URLSearchParams({
      busca: document.getElementById('busca').value,
      categoria_id: document.getElementById('categoriaFiltro').value,
      tipo_jogo: tipoAtual,
      disponiveis: '1'
    });

    const plataforma = document.getElementById('plataformaFiltro').value;
    if (plataforma) params.set('plataforma', plataforma);

    const resposta = await apiFetch(`/jogos?${params}`);
    const grid = document.getElementById('catalogoGrid');
    grid.innerHTML = resposta.dados.map(cardJogo).join('')
      || '<div class="app-card p-4 text-center text-muted">Nenhum jogo disponivel com esses filtros.</div>';

    grid.querySelectorAll('[data-reservar]').forEach((botao) => {
      botao.addEventListener('click', () => abrirReserva(botao.dataset.reservar, botao.dataset.titulo));
    });
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

function cardJogo(jogo) {
  return `
    <article class="app-card catalog-card">
      <div class="catalog-cover">${jogo.imagem ? `<img class="game-cover" src="${jogo.imagem}" alt="">` : jogo.plataforma || textoTipoJogo(jogo.tipo_jogo)}</div>
      <div class="catalog-body">
        <div class="d-flex justify-content-between gap-2">
          <span class="badge text-bg-light">${textoTipoJogo(jogo.tipo_jogo)}</span>
          <span class="badge text-bg-warning">${jogo.estoque} disp.</span>
        </div>
        <h2 class="catalog-title h6">${jogo.titulo}</h2>
        <p class="text-muted small mb-0">${jogo.descricao || ''}</p>
        <div class="small"><strong>Plataforma:</strong> ${jogo.plataforma || '-'}</div>
        <div class="small"><strong>Genero:</strong> ${jogo.categoria_nome}</div>
        <div class="d-flex justify-content-between align-items-center mt-auto">
          <strong>${moeda(jogo.valor_aluguel)}</strong>
          <button class="btn btn-primary btn-sm" data-reservar="${jogo.id}" data-titulo="${jogo.titulo}">
            <i data-lucide="calendar-plus"></i>Reservar
          </button>
        </div>
      </div>
    </article>
  `;
}

function abrirReserva(id, titulo) {
  formReserva.reset();
  formReserva.classList.remove('was-validated');
  document.getElementById('jogoReservaId').value = id;
  document.getElementById('jogoReservaTitulo').textContent = titulo;
  const data = new Date();
  data.setDate(data.getDate() + 7);
  document.getElementById('dataPrevista').value = data.toISOString().slice(0, 10);
  modalReserva.show();
}

