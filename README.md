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

Tudo de uma vez:

```bash
createdb concessionaria
psql -d concessionaria -f sql/etapa05_completo.sql
```

Ou por partes:

```bash
psql -d concessionaria -f sql/01_ddl.sql
psql -d concessionaria -f sql/02_dml.sql
psql -d concessionaria -f sql/03_consultas_avancadas.sql
```

Testado no PostgreSQL 16. O DDL derruba as tabelas antes de recriá-las,
então o script roda quantas vezes for preciso.

Os apelidos de coluna do `.sql` são os mesmos cabeçalhos que aparecem nos
slides — o print do SGBD sai igual ao site.

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
sql/                DDL, DML, as quatro consultas e o script completo
build.mjs           gera preview.html num arquivo só
```

Para mexer no texto de um slide, edite direto o `index.html` — cada slide é
uma `<section>` comentada.

## Os 32 slides

| | |
|---|---|
| 1 – 9 | Capa, contextualização, modelo lógico e fundamentação |
| 10 – 14 | Augusto · Multa · `INNER JOIN` |
| 15 – 19 | André · Manutenção · `LEFT JOIN` |
| 20 – 24 | Daniel · Avaliação · `RIGHT JOIN` |
| 25 – 29 | Guilherme · Reserva · `FULL OUTER JOIN` |
| 30 – 32 | Cobertura, aprendizados e encerramento |

Cada bloco segue a ordem do enunciado: pergunta de negócio, dados originais,
o script comentado, o resultado da execução e a leitura de negócio.

## Publicar

O repositório é estático. Na Vercel: **Add New → Project → importar este
repositório → Deploy**. Sem configuração, sem etapa de build.
