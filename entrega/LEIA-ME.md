# Entrega — Etapa 05 · Consultas Avançadas

IFES · Banco de Dados · Prof. Rafael Vargas
Augusto · André · Daniel · Guilherme

## O que tem aqui

| arquivo | o que é |
|---|---|
| `Consultas-Avancadas-IFES.pdf` | os 29 slides, uma página cada, em 16:9 |
| `etapa05_completo.sql` | DDL, DML e as quatro consultas num arquivo só |

## Slides ao vivo

O deck é um site: `INSERIR-URL-DA-VERCEL-AQUI`

No site, três coisas não cabem no papel:

- **Slide 4** — clicar em cada tabela do modelo lógico abre os campos dela.
- **Slides 9, 14, 19 e 24** — o corte do `HAVING` de cada consulta é um
  controle deslizante; o resultado se refaz na hora.
- **Slide 26** — um PostgreSQL de verdade roda dentro da página. Dá para
  escrever qualquer consulta e executar contra os dados do trabalho.

## Rodar o banco

```bash
createdb concessionaria
psql -d concessionaria -f etapa05_completo.sql
```

Testado no PostgreSQL 16. O script derruba as tabelas antes de recriá-las,
então roda quantas vezes for preciso.

Os apelidos de coluna do script são os mesmos cabeçalhos que aparecem nos
slides — o print do SGBD sai igual ao do site.
