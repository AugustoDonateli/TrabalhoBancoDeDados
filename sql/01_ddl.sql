-- =====================================================================
-- CONCESSIONARIA — ETAPA 05: CONSULTAS AVANCADAS
-- Arquivo 01 — DDL (Data Definition Language)
-- SGBD: PostgreSQL 16
-- =====================================================================
-- Correcao aplicada nesta etapa:
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
