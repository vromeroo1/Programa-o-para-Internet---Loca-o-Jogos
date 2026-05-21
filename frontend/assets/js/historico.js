import { apiFetch, exigirUsuarioAutenticado } from './api.js';
import { montarNavbar, tratarErro, moeda, badgeStatus, atualizarIcones } from './ui.js';

exigirUsuarioAutenticado();
montarNavbar('historico');
carregarHistorico();

async function carregarHistorico() {
  try {
    const resposta = await apiFetch('/minhas-reservas');
    const tbody = document.getElementById('tabelaReservas');
    tbody.innerHTML = resposta.dados.map((item) => `
      <tr>
        <td>#${item.id}</td>
        <td>${String(item.data_emprestimo).slice(0, 10)}</td>
        <td>${String(item.data_prevista_devolucao).slice(0, 10)}</td>
        <td>${badgeStatus(item.status)}</td>
        <td class="text-end">${item.total_itens}</td>
        <td class="text-end">${moeda(item.valor_total)}</td>
        <td class="text-end text-muted">Consulta</td>
      </tr>
    `).join('') || '<tr><td colspan="7" class="text-center text-muted">Historico vazio.</td></tr>';
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

