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

document.getElementById('dataPrevista').addEventListener('change', atualizarResumoReserva);

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
      botao.addEventListener('click', () => abrirReserva(botao.dataset.reservar, botao.dataset.titulo, botao.dataset.diaria));
    });
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

function cardJogo(jogo) {
  return `
    <article class="app-card catalog-card">
      <div class="catalog-body">
        <div class="d-flex justify-content-between gap-2">
          <span class="badge text-bg-light">${textoTipoJogo(jogo.tipo_jogo)}</span>
          <span class="badge text-bg-warning">${jogo.estoque} disp.</span>
        </div>
        <h2 class="catalog-title h6">${jogo.titulo}</h2>
        <p class="text-muted small mb-0">${jogo.descricao || ''}</p>
        <div class="catalog-meta small">
          <div><strong>Plataforma:</strong> ${jogo.plataforma || '-'}</div>
          <div><strong>Genero:</strong> ${jogo.categoria_nome}</div>
          <div><strong>Diaria:</strong> ${moeda(jogo.valor_aluguel)}/dia</div>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-auto">
          <strong>${jogo.tipo_jogo === 'boardgame' ? 'Mesa' : 'Console'}</strong>
          <button class="btn btn-primary btn-sm" data-reservar="${jogo.id}" data-titulo="${jogo.titulo}" data-diaria="${jogo.valor_aluguel}">
            <i data-lucide="calendar-plus"></i>Reservar
          </button>
        </div>
      </div>
    </article>
  `;
}

function abrirReserva(id, titulo, diaria) {
  formReserva.reset();
  formReserva.classList.remove('was-validated');
  document.getElementById('jogoReservaId').value = id;
  document.getElementById('valorDiariaReserva').value = diaria;
  document.getElementById('jogoReservaTitulo').textContent = titulo;
  const data = new Date();
  data.setDate(data.getDate() + 3);
  document.getElementById('dataPrevista').value = formatarDataInput(data);
  atualizarResumoReserva();
  modalReserva.show();
}

function atualizarResumoReserva() {
  const diaria = Number(document.getElementById('valorDiariaReserva').value || 0);
  const dataPrevista = document.getElementById('dataPrevista').value;
  const dias = calcularDias(dataPrevista);
  const subtotal = diaria * dias;
  const desconto = dias >= 3 ? Math.min(15, subtotal) : 0;
  const total = subtotal - desconto;

  document.getElementById('resumoReserva').innerHTML = `
    <div class="d-flex justify-content-between small mb-1">
      <span>Periodo</span><strong>${dias} diaria${dias > 1 ? 's' : ''}</strong>
    </div>
    <div class="d-flex justify-content-between small mb-1">
      <span>Valor da diaria</span><strong>${moeda(diaria)}</strong>
    </div>
    <div class="d-flex justify-content-between small mb-1">
      <span>Desconto</span><strong>${moeda(desconto)}</strong>
    </div>
    <div class="d-flex justify-content-between border-top pt-2 mt-2">
      <span>Total previsto</span><strong>${moeda(total)}</strong>
    </div>
  `;
}

function calcularDias(dataPrevista) {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fim = new Date(`${dataPrevista}T00:00:00`);

  if (Number.isNaN(fim.getTime()) || fim <= inicio) {
    return 1;
  }

  return Math.max(1, Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24)));
}

function formatarDataInput(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

