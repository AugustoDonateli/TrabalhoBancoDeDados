# Quatro Junções

Deck da **Etapa 05 — Consultas Avançadas** sobre o banco de dados de uma
concessionária.
IFES · Banco de Dados · Prof. Rafael Vargas

| Integrante | Evento | Junção | Função |
|---|---|---|---|
| Augusto | Multa | `INNER JOIN` | `COUNT` |
| André | Manutenção | `LEFT JOIN` | `SUM` |
| Daniel | Avaliação | `RIGHT JOIN` | `AVG` |
| Guilherme | Reserva | `FULL OUTER JOIN` | `MAX` · `MIN` |

## Como abrir

Abra o `index.html` no navegador. Não precisa de servidor nem de internet —
as fontes estão embutidas no projeto.

**Teclas:** `→` avança · `←` volta · `O` visão geral · `T` claro/escuro ·
`F` tela cheia · `Home`/`End` primeiro/último slide.
`PageUp`/`PageDown` também funcionam, então apresentador remoto funciona.

## O banco

```bash
psql -d concessionaria -f sql/01_ddl.sql
psql -d concessionaria -f sql/02_dml.sql
psql -d concessionaria -f sql/03_consultas_avancadas.sql
```

Testado no PostgreSQL 16. O `01_ddl.sql` recria as tabelas do zero, então
pode rodar quantas vezes quiser.

> Na Etapa 05 acrescentamos `Reserva.fk_Veiculo_placa`. A relação
> Veículo–Reserva já existia no modelo conceitual, mas não tinha sido
> implementada no DDL da Etapa 04.

## Arquivos

```
index.html          o deck
styles/deck.css     cores, tipografia e escala
scripts/dados.js    esquema e amostras das tabelas
scripts/deck.js     navegação, diagrama e demonstrações
assets/fontes.css   fontes embutidas (gerado, não editar)
sql/                DDL, DML e as quatro consultas
build.mjs           gera preview.html num arquivo só
```

Para mexer no texto de um slide, edite direto o `index.html` — cada slide é
uma `<section>` comentada.

## Publicar

O repositório é estático. Na Vercel: **Add New → Project → importar este
repositório → Deploy**. Sem configuração, sem etapa de build.
