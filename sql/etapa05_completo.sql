-- =====================================================================
-- CONCESSIONARIA — ETAPA 05: CONSULTAS AVANCADAS
-- Script completo: estrutura, carga e as quatro consultas analiticas
--
-- IFES · Banco de Dados · Prof. Rafael Vargas
-- Augusto · Andre · Daniel · Guilherme
--
-- SGBD: PostgreSQL 16
-- Uso:  psql -d concessionaria -f etapa05_completo.sql
--
-- Roda do zero quantas vezes for preciso: o DDL derruba as tabelas
-- antes de recria-las.
--
-- Conteudo:
--   PARTE 1 — DDL
--   PARTE 2 — DML
--   PARTE 3 — As quatro consultas
-- =====================================================================


-- #####################################################################
-- PARTE 1 — DDL
-- #####################################################################

--   O Modelo Conceitual (ER) previa a relacao Veiculo (1,1) --- (0,n) Reserva,
--   mas essa chave estrangeira nao havia sido materializada no DDL da Etapa 04.
--   Sem ela era impossivel saber QUAL veiculo foi reservado.
--   A coluna Reserva.fk_Veiculo_placa corrige essa omissao.
-- =====================================================================

DROP TABLE IF EXISTS Avaliacao   CASCADE;
DROP TABLE IF EXISTS Multa       CASCADE;
DROP TABLE IF EXISTS Manutencao  CASCADE;
DROP TABLE IF EXISTS Residencia  CASCADE;
DROP TABLE IF EXISTS Reserva     CASCADE;
DROP TABLE IF EXISTS Veiculo     CASCADE;
DROP TABLE IF EXISTS Cliente     CASCADE;

-- ---------------------------------------------------------------------
-- ENTIDADES
-- ---------------------------------------------------------------------

CREATE TABLE Cliente (
    cpf      BIGINT PRIMARY KEY,          -- CPF nao cabe em INTEGER: BIGINT
    nome     VARCHAR(100),
    idade    INTEGER,
    genero   VARCHAR(20),
    contato  VARCHAR(20),                 -- telefone com DDD estoura INTEGER
    status   VARCHAR(20)
);

CREATE TABLE Veiculo (
    placa   VARCHAR(10) PRIMARY KEY,      -- a placa e a chave primaria (texto)
    marca   VARCHAR(50),
    modelo  VARCHAR(50),
    cor     VARCHAR(30)
);

CREATE TABLE Reserva (
    id                INTEGER PRIMARY KEY,
    inicio            DATE,
    fim               DATE,
    retirada          DATE,
    status            VARCHAR(20),
    fk_Cliente_cpf    BIGINT,
    fk_Veiculo_placa  VARCHAR(10)         -- <<< FK acrescentada na Etapa 05
);

CREATE TABLE Manutencao (
    id                INTEGER PRIMARY KEY,
    defeito           VARCHAR(150),
    peca              VARCHAR(100),
    descricao         VARCHAR(255),
    mecanico_chefe    VARCHAR(100),
    status            VARCHAR(20),
    valor             INTEGER,            -- em reais inteiros
    fk_Veiculo_placa  VARCHAR(10)
);

CREATE TABLE Multa (
    id              INTEGER PRIMARY KEY,
    valor           INTEGER,
    tipo            VARCHAR(50),
    motivo          VARCHAR(255),
    status          VARCHAR(20),
    fk_Reserva_id   INTEGER
);

CREATE TABLE Avaliacao (
    id              INTEGER PRIMARY KEY,
    comentario      VARCHAR(255),
    nota            INTEGER,
    plataforma      VARCHAR(50),
    sugestao        VARCHAR(255),
    fk_Reserva_id   INTEGER
);

CREATE TABLE Residencia (
    cep               INTEGER PRIMARY KEY,
    numero            INTEGER,
    complemento       VARCHAR(100),
    ponto_referencia  VARCHAR(150),
    fk_Cliente_cpf    BIGINT
);

-- ---------------------------------------------------------------------
-- CHAVES ESTRANGEIRAS
-- ---------------------------------------------------------------------

ALTER TABLE Reserva ADD CONSTRAINT FK_Reserva_Cliente
    FOREIGN KEY (fk_Cliente_cpf) REFERENCES Cliente (cpf);

-- Relacao Veiculo --- Reserva, prevista no ER e implementada nesta etapa
ALTER TABLE Reserva ADD CONSTRAINT FK_Reserva_Veiculo
    FOREIGN KEY (fk_Veiculo_placa) REFERENCES Veiculo (placa);

ALTER TABLE Manutencao ADD CONSTRAINT FK_Manutencao_Veiculo
    FOREIGN KEY (fk_Veiculo_placa) REFERENCES Veiculo (placa);

ALTER TABLE Multa ADD CONSTRAINT FK_Multa_Reserva
    FOREIGN KEY (fk_Reserva_id) REFERENCES Reserva (id) ON DELETE CASCADE;

ALTER TABLE Avaliacao ADD CONSTRAINT FK_Avaliacao_Reserva
    FOREIGN KEY (fk_Reserva_id) REFERENCES Reserva (id) ON DELETE CASCADE;

ALTER TABLE Residencia ADD CONSTRAINT FK_Residencia_Cliente
    FOREIGN KEY (fk_Cliente_cpf) REFERENCES Cliente (cpf) ON DELETE RESTRICT;


-- #####################################################################
-- PARTE 2 — DML
-- #####################################################################


-- ---------------------------------------------------------------------
-- CLIENTE (12)
-- ---------------------------------------------------------------------
INSERT INTO Cliente (cpf, nome, idade, genero, contato, status) VALUES
(11122233344, 'Ana Beatriz Moraes',      34, 'Feminino',  '(11) 98765-4321', 'Ativo'),
(22233344455, 'Carlos Eduardo Lima',     45, 'Masculino', '(11) 97654-3210', 'Ativo'),
(33344455566, 'Daniela Prado',           28, 'Feminino',  '(11) 96543-2109', 'Ativo'),
(44455566677, 'Eduardo Nakamura',        52, 'Masculino', '(11) 95432-1098', 'Ativo'),
(55566677788, 'Fernanda Rocha',          39, 'Feminino',  '(11) 94321-0987', 'Ativo'),
(66677788899, 'Gabriel Fonseca',         23, 'Masculino', '(11) 93210-9876', 'Ativo'),
(77788899900, 'Helena Vasconcelos',      47, 'Feminino',  '(11) 92109-8765', 'Inativo'),
(88899900011, 'Igor Salgado',            31, 'Masculino', '(11) 91098-7654', 'Ativo'),
(99900011122, 'Juliana Amaral',          26, 'Feminino',  '(11) 90987-6543', 'Ativo'),
(10011122233, 'Leonardo Castro',         58, 'Masculino', '(11) 99876-5432', 'Ativo'),
(12233344455, 'Mariana Duarte',          41, 'Feminino',  '(11) 98765-1234', 'Ativo'),
(13344455566, 'Nelson Ribeiro',          36, 'Masculino', '(11) 97654-2345', 'Inativo');

-- ---------------------------------------------------------------------
-- VEICULO (12) — o patio da concessionaria
-- ---------------------------------------------------------------------
INSERT INTO Veiculo (placa, marca, modelo, cor) VALUES
('ABC1D23', 'Volkswagen', 'Nivus',    'Prata'),
('BRA2E19', 'Chevrolet',  'Onix',     'Branco'),
('CDE3F45', 'Fiat',       'Pulse',    'Vermelho'),
('DEF4G56', 'Toyota',     'Corolla',  'Preto'),
('EFG5H67', 'Honda',      'Civic',    'Cinza'),
('FGH6I78', 'Hyundai',    'HB20',     'Azul'),
('GHI7J89', 'Jeep',       'Renegade', 'Verde'),
('HIJ8K90', 'Renault',    'Kwid',     'Branco'),
('IJK9L01', 'Nissan',     'Kicks',    'Prata'),
('JKL0M12', 'Ford',       'Ranger',   'Preto'),
('KLM1N23', 'Peugeot',    '208',      'Amarelo'),
('LMN2O34', 'Citroen',    'C3',       'Branco');

-- ---------------------------------------------------------------------
-- RESIDENCIA (12) — uma por cliente
-- ---------------------------------------------------------------------
INSERT INTO Residencia (cep, numero, complemento, ponto_referencia, fk_Cliente_cpf) VALUES
(13045110, 320, 'Apto 51',    'Em frente ao Parque Portugal',  11122233344),
(13024200, 145, 'Casa',       'Ao lado da padaria Sao Jose',   22233344455),
(13070301, 890, 'Bloco B',    'Proximo ao Shopping Iguatemi',  33344455566),
(13087402, 77,  'Casa 2',     'Rua sem saida, esquina',        44455566677),
(13092503,1210, 'Apto 1204',  'Condominio Vista Verde',        55566677788),
(13100604, 45,  'Fundos',     'Atras do posto Ipiranga',       66677788899),
(13015705, 630, 'Apto 33',    'Perto da estacao rodoviaria',   77788899900),
(13033806, 214, 'Casa',       'Praca central, lado impar',     88899900011),
(13060907, 958, 'Apto 82',    'Ao lado da UNICAMP',            99900011122),
(13081008, 112, 'Sobrado',    'Rua do mercado municipal',      10011122233),
(13098109, 405, 'Apto 210',   'Em frente a escola estadual',   12233344455),
(13011210, 767, 'Casa',       'Proximo ao terminal Barao',     13344455566);

-- ---------------------------------------------------------------------
-- RESERVA (20)
--   ids 18, 19 e 20 estao com fk_Veiculo_placa NULL:
--   reservas confirmadas com o cliente mas ainda SEM VEICULO ALOCADO.
--   Sao elas que aparecem no lado direito do FULL OUTER JOIN.
-- ---------------------------------------------------------------------
INSERT INTO Reserva (id, inicio, fim, retirada, status, fk_Cliente_cpf, fk_Veiculo_placa) VALUES
( 1, '2025-09-05', '2025-09-12', '2025-09-05', 'Concluida', 11122233344, 'ABC1D23'),
( 2, '2025-10-01', '2025-10-08', '2025-10-01', 'Concluida', 22233344455, 'DEF4G56'),
( 3, '2025-10-15', '2025-10-22', '2025-10-15', 'Concluida', 33344455566, 'BRA2E19'),
( 4, '2025-11-03', '2025-11-10', '2025-11-03', 'Concluida', 22233344455, 'GHI7J89'),
( 5, '2025-11-13', '2025-11-20', '2025-11-13', 'Concluida', 44455566677, 'HIJ8K90'),
( 6, '2025-12-02', '2025-12-09', '2025-12-02', 'Concluida', 55566677788, 'EFG5H67'),
( 7, '2026-01-08', '2026-01-15', '2026-01-08', 'Concluida', 66677788899, 'CDE3F45'),
( 8, '2026-01-20', '2026-01-27', '2026-01-20', 'Concluida', 88899900011, 'FGH6I78'),
( 9, '2026-02-05', '2026-02-12', '2026-02-05', 'Concluida', 11122233344, 'IJK9L01'),
(10, '2026-02-18', '2026-02-25', '2026-02-18', 'Concluida', 99900011122, 'DEF4G56'),
(11, '2026-03-04', '2026-03-11', '2026-03-04', 'Concluida', 10011122233, 'JKL0M12'),
(12, '2026-03-16', '2026-03-23', '2026-03-16', 'Concluida', 22233344455, 'ABC1D23'),
(13, '2026-04-02', '2026-04-09', '2026-04-02', 'Concluida', 66677788899, 'GHI7J89'),
(14, '2026-04-14', '2026-04-21', '2026-04-14', 'Concluida', 12233344455, 'EFG5H67'),
(15, '2026-05-06', '2026-05-13', '2026-05-06', 'Concluida', 88899900011, 'FGH6I78'),
(16, '2026-06-01', '2026-06-08', '2026-06-01', 'Concluida', 13344455566, 'IJK9L01'),
(17, '2026-06-17', '2026-06-24', '2026-06-17', 'Concluida', 55566677788, 'JKL0M12'),
(18, '2026-07-06', '2026-07-13',  NULL,        'Pendente',  77788899900,  NULL   ),
(19, '2026-07-20', '2026-07-27',  NULL,        'Pendente',  33344455566,  NULL   ),
(20, '2026-08-10', '2026-08-17',  NULL,        'Pendente',  10011122233,  NULL   );

-- ---------------------------------------------------------------------
-- MANUTENCAO (13)
--   Sem nenhum registro: CDE3F45, EFG5H67, HIJ8K90, LMN2O34
--   Sao esses veiculos que so aparecem gracas ao LEFT JOIN.
-- ---------------------------------------------------------------------
INSERT INTO Manutencao (id, defeito, peca, descricao, mecanico_chefe, status, valor, fk_Veiculo_placa) VALUES
( 1, 'Ruido na suspensao dianteira', 'Amortecedor',      'Troca do par de amortecedores dianteiros', 'Roberto Alencar', 'Concluida',  1800, 'ABC1D23'),
( 2, 'Pastilha de freio gasta',      'Pastilha de freio','Substituicao das pastilhas dianteiras',    'Roberto Alencar', 'Concluida',   950, 'ABC1D23'),
( 3, 'Superaquecimento do motor',    'Bomba d agua',     'Troca da bomba e do liquido de arrefec.',  'Sandra Bittencourt','Concluida', 1200, 'DEF4G56'),
( 4, 'Cambio automatico patinando',  'Kit de embreagem','Revisao completa do cambio automatico',    'Sandra Bittencourt','Concluida', 2400, 'DEF4G56'),
( 5, 'Ar-condicionado sem gelar',    'Compressor',       'Troca do compressor e recarga de gas',     'Marcos Tavares',  'Concluida',  1500, 'DEF4G56'),
( 6, 'Bateria descarregando',        'Bateria 60Ah',     'Substituicao da bateria',                  'Marcos Tavares',  'Concluida',   680, 'FGH6I78'),
( 7, 'Vazamento de oleo no motor',   'Junta do cabecote','Retifica parcial e troca da junta',        'Roberto Alencar', 'Concluida',  3200, 'GHI7J89'),
( 8, 'Farol dianteiro queimado',     'Farol LED',        'Troca do conjunto optico direito',         'Marcos Tavares',  'Concluida',   890, 'GHI7J89'),
( 9, 'Embreagem pesada',             'Kit de embreagem','Troca completa do kit de embreagem',       'Sandra Bittencourt','Concluida', 2100, 'JKL0M12'),
(10, 'Pneus com desgaste irregular', 'Pneu 265/65 R17',  'Rodizio, alinhamento e balanceamento',     'Marcos Tavares',  'Concluida',  1450, 'JKL0M12'),
(11, 'Retrovisor eletrico travado',  'Retrovisor',       'Troca do motor do retrovisor esquerdo',    'Marcos Tavares',  'Concluida',   450, 'BRA2E19'),
(12, 'Direcao eletrica com folga',   'Caixa de direcao', 'Reparo da caixa de direcao eletrica',      'Roberto Alencar', 'Concluida',  1750, 'IJK9L01'),
(13, 'Revisao de 10.000 km',         'Filtros e oleo',   'Revisao preventiva de rotina',             'Sandra Bittencourt','Concluida',  520, 'KLM1N23');

-- ---------------------------------------------------------------------
-- MULTA (10) — infracoes cometidas durante o periodo de posse do veiculo
-- ---------------------------------------------------------------------
INSERT INTO Multa (id, valor, tipo, motivo, status, fk_Reserva_id) VALUES
( 1, 293, 'Media',      'Estacionar em local proibido',              'Paga',     2),
( 2, 195, 'Leve',       'Excesso de velocidade em ate 20%',          'Pendente', 4),
( 3, 880, 'Gravissima', 'Conduzir sob influencia de alcool',         'Pendente',12),
( 4, 130, 'Leve',       'Avanco de sinal amarelo',                   'Paga',     7),
( 5, 293, 'Media',      'Uso de celular ao volante',                 'Pendente',13),
( 6, 195, 'Leve',       'Excesso de velocidade em ate 20%',          'Paga',     8),
( 7, 586, 'Grave',      'Ultrapassagem em faixa continua',           'Pendente',15),
( 8, 293, 'Media',      'Estacionar em vaga reservada a idoso',      'Paga',     1),
( 9, 195, 'Leve',       'Excesso de velocidade em ate 20%',          'Paga',    11),
(10, 130, 'Leve',       'Estacionar sobre a faixa de pedestres',     'Paga',     3);

-- ---------------------------------------------------------------------
-- AVALIACAO (12)
--   8 das 20 reservas nao geraram nenhuma avaliacao.
--   Esse silencio so fica visivel gracas ao RIGHT JOIN.
-- ---------------------------------------------------------------------
INSERT INTO Avaliacao (id, comentario, nota, plataforma, sugestao, fk_Reserva_id) VALUES
( 1, 'Atendimento impecavel, carro entregue limpo',      9, 'Google Maps',  'Nada a sugerir',                          1),
( 2, 'Melhor experiencia que ja tive em uma loja',      10, 'Google Maps',  'Mantenham o padrao',                      2),
( 3, 'Demorou para liberar o veiculo',                   7, 'Instagram',    'Agilizar a documentacao',                 3),
( 4, 'Bom atendimento, mas o carro estava sem gasolina', 8, 'Site Proprio', 'Entregar com tanque cheio',               4),
( 5, 'Veiculo com cheiro forte e sujo por dentro',       5, 'WhatsApp',     'Revisar a limpeza antes da entrega',      5),
( 6, 'Equipe muito atenciosa',                           8, 'Google Maps',  'Ampliar horario de retirada',             6),
( 7, 'Fila grande no balcao de retirada',                6, 'Instagram',    'Aumentar equipe no fim de semana',        7),
( 8, 'Processo rapido e sem burocracia',                 9, 'Site Proprio', 'Nada a sugerir',                          8),
( 9, 'Cobranca inesperada na devolucao',                 6, 'WhatsApp',     'Explicar melhor as taxas no contrato',    9),
(10, 'Carro novo, muito confortavel',                    9, 'Google Maps',  'Divulgar mais os modelos hibridos',      10),
(11, 'Retirada tranquila, devolucao confusa',            8, 'Instagram',    'Sinalizar melhor o setor de devolucao',  11),
(12, 'Preco justo, mas o carro tinha um risco na porta', 7, 'Site Proprio', 'Vistoria com o cliente presente',        12);


-- #####################################################################
-- PARTE 3 — AS QUATRO CONSULTAS
-- #####################################################################

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
