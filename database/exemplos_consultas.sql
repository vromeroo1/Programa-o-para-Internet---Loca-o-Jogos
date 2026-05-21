USE locacao_jogos;

-- SELECT com relacionamento e WHERE: jogos disponiveis por categoria.
SELECT j.id, j.titulo, c.nome AS categoria, j.tipo_jogo, j.plataforma, j.estoque
FROM jogos j
INNER JOIN categorias c ON c.id = j.categoria_id
WHERE j.estoque > 0
  AND c.nome = 'Acao'
ORDER BY j.titulo;

-- SELECT com operadores logicos: busca por titulo ou plataforma.
SELECT id, titulo, plataforma, valor_aluguel, estoque
FROM jogos
WHERE (titulo LIKE '%Zelda%' OR plataforma LIKE '%Switch%')
  AND estoque > 0;

-- SELECT com data e relacionamento: emprestimos atrasados.
SELECT e.id, u.nome AS usuario, e.data_prevista_devolucao, e.status, e.valor_total
FROM emprestimos e
INNER JOIN usuarios u ON u.id = e.usuario_id
WHERE e.status IN ('pendente', 'aprovado', 'retirado')
  AND e.data_prevista_devolucao < CURDATE();

-- SELECT agregada: jogos mais alugados.
SELECT j.titulo, SUM(i.quantidade) AS total_alugado
FROM itens_emprestimo i
INNER JOIN jogos j ON j.id = i.jogo_id
GROUP BY j.id, j.titulo
ORDER BY total_alugado DESC;

-- UPDATE com WHERE: registrar devolucao com multa.
UPDATE emprestimos
SET status = 'devolvido',
    data_devolucao_real = NOW(),
    multa = 4.00,
    valor_total = valor_total + 4.00
WHERE id = 1
  AND status IN ('aprovado', 'retirado', 'atrasado');

-- DELETE com WHERE: remover uma categoria sem jogos vinculados.
DELETE FROM categorias
WHERE id = 99;
