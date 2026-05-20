const PDFDocument = require('pdfkit');
const JogoDAO = require('../daos/JogoDAO');
const EmprestimoDAO = require('../daos/EmprestimoDAO');

class RelatorioService {
  constructor(jogoDAO = new JogoDAO(), emprestimoDAO = new EmprestimoDAO()) {
    this.jogoDAO = jogoDAO;
    this.emprestimoDAO = emprestimoDAO;
  }

  async gerarJogosPdf(filtros, usuario) {
    const jogos = await this.jogoDAO.listar(filtros);
    return gerarPdfBuffer((doc) => {
      cabecalho(doc, 'Relatorio de Jogos', usuario);
      linha(doc, ['Titulo', 'Categoria', 'Tipo', 'Plataforma', 'Estoque', 'Valor'], true);
      jogos.forEach((jogo) => {
        linha(doc, [
          jogo.titulo,
          jogo.categoria_nome,
          jogo.tipo_jogo,
          jogo.plataforma || '-',
          String(jogo.estoque),
          `R$ ${Number(jogo.valor_aluguel).toFixed(2)}`
        ]);
      });
      rodape(doc, `Total de jogos: ${jogos.length}`);
    });
  }

  async gerarEmprestimosPdf(filtros, usuario) {
    const emprestimos = await this.emprestimoDAO.listar(filtros);
    const total = emprestimos.reduce((soma, item) => soma + Number(item.valor_total || 0), 0);

    return gerarPdfBuffer((doc) => {
      cabecalho(doc, 'Relatorio de Emprestimos', usuario);
      linha(doc, ['ID', 'Usuario', 'Prevista', 'Status', 'Itens', 'Valor'], true);
      emprestimos.forEach((emprestimo) => {
        linha(doc, [
          String(emprestimo.id),
          emprestimo.usuario_nome,
          String(emprestimo.data_prevista_devolucao).slice(0, 10),
          emprestimo.status,
          String(emprestimo.total_itens),
          `R$ ${Number(emprestimo.valor_total).toFixed(2)}`
        ]);
      });
      rodape(doc, `Total de emprestimos: ${emprestimos.length} | Total financeiro: R$ ${total.toFixed(2)}`);
    });
  }
}

function gerarPdfBuffer(preencher) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 36, size: 'A4' });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    preencher(doc);
    doc.end();
  });
}

function cabecalho(doc, titulo, usuario) {
  doc
    .fontSize(18)
    .text(titulo, { align: 'center' })
    .moveDown(0.5)
    .fontSize(10)
    .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`)
    .text(`Usuario: ${usuario?.nome || usuario?.email || 'sistema'}`)
    .moveDown();
}

function linha(doc, colunas, destaque = false) {
  const larguras = [130, 100, 80, 90, 55, 80];
  const y = doc.y;

  if (destaque) {
    doc.rect(36, y - 3, 523, 18).fill('#f1f5f9').fillColor('#111827');
  }

  colunas.forEach((valor, index) => {
    doc.text(String(valor ?? '-').slice(0, 28), 40 + larguras.slice(0, index).reduce((a, b) => a + b, 0), y, {
      width: larguras[index],
      continued: false
    });
  });

  doc.moveDown(0.7);
}

function rodape(doc, texto) {
  doc.moveDown().fontSize(11).text(texto, { align: 'right' });
}

module.exports = RelatorioService;
