-- =====================================================================
-- CONCESSIONARIA — ETAPA 05: CONSULTAS AVANCADAS
-- Arquivo 03 — As 4 consultas analiticas do grupo
-- SGBD: PostgreSQL 16
-- =====================================================================
--  INTEGRANTE   | EVENTO      | JUNCAO           | FUNCAO EM DESTAQUE
--  -------------|-------------|------------------|-------------------
--  Augusto      | Multa       | INNER JOIN       | COUNT
--  Andre        | Manutencao  | LEFT JOIN        | SUM
--  Daniel       | Avaliacao   | RIGHT JOIN       | AVG
--  Guilherme    | Reserva     | FULL OUTER JOIN  | MAX e MIN
-- =====================================================================


-- =====================================================================
-- 1) AUGUSTO — EVENTO: MULTA — INNER JOIN — COUNT
-- ---------------------------------------------------------------------
-- PERGUNTA DE NEGOCIO:
--   "Quais clientes sao reincidentes em multas (2 ou mais) e por isso
--    representam risco em novas reservas?"
--
-- POR QUE INNER JOIN:
--   O relatorio trata de quem TEM multa. O INNER JOIN devolve apenas a
--   intersecao Multa x Reserva x Cliente. Cliente sem multa nao deve
--   aparecer nem mesmo zerado: ele nao e assunto desta analise.
--   E o unico dos quatro joins que descarta os dois lados sem par.
-- =====================================================================

SELECT c.nome                    AS cliente,
       c.contato,
       COUNT(m.id)               AS total_multas,
       COUNT(DISTINCT r.id)      AS reservas
FROM Multa m
INNER JOIN Reserva r ON m.fk_Reserva_id  = r.id
INNER JOIN Cliente c ON r.fk_Cliente_cpf = c.cpf
GROUP BY c.cpf, c.nome, c.contato
HAVING COUNT(m.id) >= 2
ORDER BY total_multas DESC, cliente;


-- =====================================================================
-- 2) ANDRE — EVENTO: MANUTENCAO — LEFT JOIN — SUM
-- ---------------------------------------------------------------------
-- PERGUNTA DE NEGOCIO:
--   "Quais veiculos ja consumiram R$ 2.000 ou mais em manutencao
--    (candidatos a substituicao) e quais nunca precisaram de oficina?"
--
-- POR QUE LEFT JOIN:
--   Os veiculos SEM manutencao sao metade da resposta. O LEFT JOIN
--   preserva todo o patio (tabela da esquerda) e preenche com NULL o
--   lado da Manutencao quando nao ha registro. Com INNER JOIN esses
--   veiculos sumiriam e o relatorio mentiria sobre o tamanho da frota.
--   O COALESCE converte o NULL de SUM em 0 para leitura gerencial.
-- =====================================================================

SELECT v.placa,
       v.marca,
       v.modelo,
       COUNT(m.id)                 AS qtd_manutencoes,
       COALESCE(SUM(m.valor), 0)   AS custo_total
FROM Veiculo v
LEFT JOIN Manutencao m ON v.placa = m.fk_Veiculo_placa
GROUP BY v.placa, v.marca, v.modelo
HAVING COALESCE(SUM(m.valor), 0) >= 2000   -- veiculos caros de manter
    OR SUM(m.valor) IS NULL                -- veiculos que nunca foram a oficina
ORDER BY custo_total DESC, v.placa;


-- =====================================================================
-- 3) DANIEL — EVENTO: AVALIACAO — RIGHT JOIN — AVG
-- ---------------------------------------------------------------------
-- PERGUNTA DE NEGOCIO:
--   "Quais canais de avaliacao estao com nota media abaixo de 8,5 e
--    qual o volume de reservas que nao geraram avaliacao nenhuma?"
--
-- POR QUE RIGHT JOIN:
--   A tabela que precisa ser preservada e Reserva, e ela esta a DIREITA
--   do join. Toda reserva conta, mesmo sem avaliacao. O grupo
--   "(sem avaliacao)" e o insight principal: cliente insatisfeito que
--   nao reclama simplesmente nao volta, e esse silencio nao aparece em
--   nenhum ranking de nota.
--   RIGHT JOIN e o espelho exato do LEFT JOIN: bastaria inverter a
--   ordem das tabelas para obter o mesmo resultado com LEFT JOIN.
-- =====================================================================

SELECT COALESCE(a.plataforma, '(sem avaliacao)') AS canal,
       COUNT(r.id)                               AS reservas,
       ROUND(AVG(a.nota), 2)                     AS nota_media
FROM Avaliacao a
RIGHT JOIN Reserva r ON a.fk_Reserva_id = r.id
GROUP BY a.plataforma
HAVING AVG(a.nota) < 8.5        -- canais com reputacao em risco
    OR AVG(a.nota) IS NULL      -- reservas que nao geraram avaliacao
ORDER BY nota_media NULLS LAST;


-- =====================================================================
-- 4) GUILHERME — EVENTO: RESERVA — FULL OUTER JOIN — MAX e MIN
-- ---------------------------------------------------------------------
-- PERGUNTA DE NEGOCIO:
--   "Onde esta o descasamento entre patio e demanda? Quais veiculos
--    estao encalhados (nunca reservados ou parados desde 2025) e quais
--    reservas seguem sem veiculo alocado?"
--
-- POR QUE FULL OUTER JOIN:
--   E o unico join em que os DOIS lados orfaos importam ao mesmo tempo:
--     - a esquerda: veiculo no patio que ninguem reservou (capital parado);
--     - a direita:  reserva confirmada sem veiculo designado (risco de
--                   nao conseguir atender o cliente na data marcada).
--   Um LEFT JOIN mostraria so o primeiro problema; um RIGHT JOIN so o
--   segundo. O FULL OUTER JOIN entrega o raio-x completo em uma consulta.
--
-- ATENCAO (erro corrigido):
--   O grupo das reservas sem veiculo tem datas RECENTES, logo nao e NULL
--   nem anterior ao corte. Sem a condicao "v.placa IS NULL" no HAVING,
--   o FULL OUTER JOIN traria esse grupo e o HAVING o eliminaria em
--   seguida, desperdicando exatamente o que o join tem de especial.
-- =====================================================================

SELECT COALESCE(v.placa,  '(sem veiculo alocado)') AS veiculo,
       COALESCE(v.modelo, '---')                   AS modelo,
       COUNT(r.id)                                 AS reservas,
       MIN(r.inicio)                               AS primeira,
       MAX(r.fim)                                  AS ultima
FROM Veiculo v
FULL OUTER JOIN Reserva r ON v.placa = r.fk_Veiculo_placa
GROUP BY v.placa, v.modelo
HAVING MAX(r.fim) IS NULL                 -- veiculo nunca reservado
    OR v.placa IS NULL                    -- reserva sem veiculo alocado
    OR MAX(r.fim) < DATE '2026-01-01'     -- veiculo parado ha mais de 6 meses
ORDER BY ultima NULLS FIRST, veiculo;
