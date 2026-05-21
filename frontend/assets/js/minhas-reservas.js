import { apiFetch, exigirUsuarioAutenticado } from './api.js';
import { montarNavbar, tratarErro, toast, moeda, badgeStatus, atualizarIcones } from './ui.js';

exigirUsuarioAutenticado();
montarNavbar('minhas-reservas');
carregarReservas();

async function carregarReservas() {
  try {
    const resposta = await apiFetch('/minhas-reservas');
    renderizarTabela(resposta.dados);
  } catch (erro) {
    tratarErro(erro);
  }
}

function renderizarTabela(reservas) {
  const tbody = document.getElementById('tabelaReservas');
  tbody.innerHTML = reservas.map((reserva) => `
    <tr>
      <td>#${reserva.id}</td>
      <td>${String(reserva.data_emprestimo).slice(0, 10)}</td>
      <td>${String(reserva.data_prevista_devolucao).slice(0, 10)}</td>
      <td>${badgeStatus(reserva.status)}</td>
      <td class="text-end">${reserva.total_itens}</td>
      <td class="text-end">${moeda(reserva.valor_total)}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger" data-cancelar="${reserva.id}" ${reserva.status !== 'pendente' ? 'disabled' : ''}>
          <i data-lucide="x"></i>Cancelar
        </button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="text-center text-muted">Nenhuma reserva encontrada.</td></tr>';

  tbody.querySelectorAll('[data-cancelar]').forEach((botao) => {
    botao.addEventListener('click', () => cancelar(botao.dataset.cancelar));
  });
  atualizarIcones();
}

async function cancelar(id) {
  if (!confirm('Cancelar esta reserva pendente?')) return;

  try {
    await apiFetch(`/minhas-reservas/${id}`, { method: 'DELETE' });
    toast('Reserva cancelada.');
    carregarReservas();
  } catch (erro) {
    tratarErro(erro);
  }
}

