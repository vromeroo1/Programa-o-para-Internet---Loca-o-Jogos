USE locacao_jogos;

SET @existe_dias := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'emprestimos'
    AND COLUMN_NAME = 'dias_aluguel'
);
SET @sql_dias := IF(
  @existe_dias = 0,
  'ALTER TABLE emprestimos ADD COLUMN dias_aluguel INT NOT NULL DEFAULT 1 AFTER status',
  'SELECT 1'
);
PREPARE stmt_dias FROM @sql_dias;
EXECUTE stmt_dias;
DEALLOCATE PREPARE stmt_dias;

SET @existe_desconto := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'emprestimos'
    AND COLUMN_NAME = 'desconto'
);
SET @sql_desconto := IF(
  @existe_desconto = 0,
  'ALTER TABLE emprestimos ADD COLUMN desconto DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER dias_aluguel',
  'SELECT 1'
);
PREPARE stmt_desconto FROM @sql_desconto;
EXECUTE stmt_desconto;
DEALLOCATE PREPARE stmt_desconto;

UPDATE emprestimos
SET dias_aluguel = GREATEST(1, DATEDIFF(data_prevista_devolucao, DATE(data_emprestimo)))
WHERE dias_aluguel IS NULL OR dias_aluguel < 1;

UPDATE emprestimos
SET desconto = CASE WHEN dias_aluguel >= 3 THEN 15.00 ELSE 0.00 END
WHERE desconto IS NULL;

UPDATE emprestimos e
INNER JOIN (
  SELECT emprestimo_id, COALESCE(SUM(quantidade * valor_unitario), 0) AS total_diaria
  FROM itens_emprestimo
  GROUP BY emprestimo_id
) itens ON itens.emprestimo_id = e.id
SET e.valor_total = GREATEST(0, (itens.total_diaria * e.dias_aluguel) - e.desconto + e.multa)
WHERE e.status <> 'cancelado';
