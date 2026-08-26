/* ============================================================================
   CONSOLE SQL — PostgreSQL de verdade rodando no navegador

   Usa o PGlite: o PostgreSQL compilado para WebAssembly. Não é simulação nem
   tabela pré-calculada — é o Postgres executando a consulta dentro da página,
   sobre a mesma carga do arquivo sql/etapa05_completo.sql.

   Dois detalhes que decidiram a implementação:

   1. São 17 MB. Carregar na abertura atrasaria o deck inteiro por causa de um
      slide, então o banco só acorda quando esse slide aparece.

   2. Módulos ES e WebAssembly não carregam por file:// — o navegador bloqueia.
      Abrir o index.html direto do disco faz o console avisar e seguir; o resto
      do deck continua funcionando normalmente. Na Vercel, ou servindo a pasta
      por HTTP, funciona.
   ============================================================================ */

const painel = document.getElementById("console-sql");
if (painel) {
  const campo    = document.getElementById("sql-campo");
  const saida    = document.getElementById("sql-saida");
  const estado   = document.getElementById("sql-estado");
  const legenda  = document.getElementById("sql-legenda");
  const btRodar  = document.getElementById("sql-rodar");

  let db = null;
  let ligando = null;

  /* ---------- estado visível ------------------------------------------- */
  function aviso(texto, tipo) {
    estado.textContent = texto;
    estado.className = "sql-estado" + (tipo ? " " + tipo : "");
  }

  /* ---------- liga o banco (uma vez só) --------------------------------- */
  async function ligar() {
    if (db) return db;
    if (ligando) return ligando;

    ligando = (async () => {
      aviso("Carregando o PostgreSQL… (17 MB, só na primeira vez)");
      btRodar.disabled = true;

      const { PGlite } = await import("../assets/pglite/index.js");
      const banco = new PGlite();

      /* Se um binario faltar, o erro estoura dentro do WebAssembly e nao chega
         a este await — a tela ficaria em "Carregando" para sempre. O relogio
         abaixo garante que o slide sempre diz o que aconteceu. */
      await Promise.race([
        banco.waitReady,
        new Promise((_, falha) => setTimeout(
          () => falha(new Error("o banco nao respondeu em 90 s")), 90000))
      ]);

      aviso("Criando as tabelas e carregando os dados…");
      const resposta = await fetch("sql/etapa05_completo.sql");
      if (!resposta.ok) throw new Error("não achei sql/etapa05_completo.sql");
      await banco.exec(await resposta.text());

      const { rows } = await banco.query("SELECT version()");
      db = banco;
      btRodar.disabled = false;
      aviso(String(rows[0].version).split(" on ")[0] + " · banco pronto", "ok");
      return db;
    })().catch((erro) => {
      ligando = null;
      btRodar.disabled = true;
      const porArquivo = location.protocol === "file:";
      aviso(porArquivo
        ? "O console precisa da página servida por HTTP — abrindo o arquivo direto do disco, o navegador bloqueia WebAssembly. Use o endereço publicado, ou rode «npx http-server» nesta pasta."
        : "Não consegui iniciar o banco: " + erro.message, "erro");
      throw erro;
    });

    return ligando;
  }

  /* ---------- renderiza o resultado ------------------------------------- */
  function mostrar(resultado, ms) {
    if (!resultado || !resultado.fields || !resultado.fields.length) {
      saida.innerHTML = "";
      legenda.textContent = "comando executado · " + ms + " ms";
      return;
    }
    const colunas = resultado.fields.map((f) => f.name);
    let h = "<thead><tr>";
    colunas.forEach((c) => { h += "<th>" + c + "</th>"; });
    h += "</tr></thead><tbody>";

    resultado.rows.forEach((linha, i) => {
      h += '<tr class="fresh" style="animation-delay:' + i * 30 + 'ms">';
      colunas.forEach((c) => {
        const v = linha[c];
        const vazio = v === null || v === undefined;
        const numero = typeof v === "number" || typeof v === "bigint";
        h += '<td class="' + (numero ? "num" : "") + '">' +
             (vazio ? '<span class="nul">NULL</span>' : escapar(texto(v))) + "</td>";
      });
      h += "</tr>";
    });
    saida.innerHTML = h + "</tbody>";
    legenda.textContent = resultado.rows.length +
      (resultado.rows.length === 1 ? " linha · " : " linhas · ") + ms + " ms";
  }

  function escapar(t) {
    return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* O PGlite devolve DATE como objeto Date do JavaScript, que impresso vira
     "Wed Oct 15 2025 00:00:00 GMT+0000". No psql sai 2025-10-15, e e assim
     que a coluna aparece nos outros slides — entao formatamos igual. */
  function texto(v) {
    if (v instanceof Date) {
      const iso = v.toISOString();
      return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : iso.replace("T", " ").slice(0, 19);
    }
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  }

  /* ---------- executa --------------------------------------------------- */
  async function rodar() {
    const sql = campo.value.trim();
    if (!sql) return;
    try {
      const banco = await ligar();
      aviso("Executando…");
      const inicio = performance.now();
      /* exec aceita varios comandos; ficamos com o ultimo que devolveu linhas */
      const partes = await banco.exec(sql);
      const ms = Math.round(performance.now() - inicio);
      const comLinhas = partes.filter((r) => r.fields && r.fields.length);
      mostrar(comLinhas.length ? comLinhas[comLinhas.length - 1] : partes[partes.length - 1], ms);
      aviso("Executado", "ok");
    } catch (erro) {
      /* A mensagem do Postgres e melhor que qualquer texto nosso:
         diz a coluna, a linha e o motivo. */
      saida.innerHTML = "";
      legenda.textContent = "";
      aviso(erro.message || String(erro), "erro");
    }
  }

  btRodar.addEventListener("click", rodar);
  campo.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); rodar(); }
  });

  /* ---------- consultas prontas ----------------------------------------- */
  document.querySelectorAll("#sql-atalhos .pick").forEach((b) => {
    b.addEventListener("click", () => {
      campo.value = CONSULTAS[b.dataset.q];
      document.querySelectorAll("#sql-atalhos .pick").forEach((o) =>
        o.setAttribute("aria-pressed", o === b ? "true" : "false"));
      rodar();
    });
  });

  /* ---------- so acorda quando o slide aparece --------------------------- */
  document.addEventListener("slide:mudou", (e) => {
    if (e.detail.id === "console") ligar().catch(() => {});
  });

  /* Modulos ES executam depois do deck.js, entao o primeiro aviso de slide
     ja passou. Se alguem abriu direto em #console, liga agora. */
  const inicial = document.querySelector(".slide.on");
  if (inicial && inicial.id === "console") ligar().catch(() => {});
}

/* ---------------------------------------------------------------------------
   As quatro consultas do grupo, prontas para rodar de novo ao vivo.
   --------------------------------------------------------------------------- */
const CONSULTAS = {
  augusto: `-- AUGUSTO · Multa · INNER JOIN · COUNT
SELECT c.nome AS cliente, c.contato,
       COUNT(m.id)          AS total_multas,
       COUNT(DISTINCT r.id) AS reservas
FROM Multa m
INNER JOIN Reserva r ON m.fk_Reserva_id  = r.id
INNER JOIN Cliente c ON r.fk_Cliente_cpf = c.cpf
GROUP BY c.cpf, c.nome, c.contato
HAVING COUNT(m.id) >= 2
ORDER BY total_multas DESC;`,

  andre: `-- ANDRÉ · Manutenção · LEFT JOIN · SUM
SELECT v.placa, v.marca, v.modelo,
       COUNT(m.id)               AS qtd_manutencoes,
       COALESCE(SUM(m.valor), 0) AS custo_total
FROM Veiculo v
LEFT JOIN Manutencao m ON v.placa = m.fk_Veiculo_placa
GROUP BY v.placa, v.marca, v.modelo
HAVING COALESCE(SUM(m.valor), 0) >= 2000
    OR SUM(m.valor) IS NULL
ORDER BY custo_total DESC;`,

  daniel: `-- DANIEL · Avaliação · RIGHT JOIN · AVG
SELECT COALESCE(a.plataforma, '(sem avaliacao)') AS canal,
       COUNT(r.id)           AS reservas,
       ROUND(AVG(a.nota), 2) AS nota_media
FROM Avaliacao a
RIGHT JOIN Reserva r ON a.fk_Reserva_id = r.id
GROUP BY a.plataforma
HAVING AVG(a.nota) < 8.5
    OR AVG(a.nota) IS NULL
ORDER BY nota_media NULLS LAST;`,

  guilherme: `-- GUILHERME · Reserva · FULL OUTER JOIN · MAX e MIN
SELECT COALESCE(v.placa, '(sem veiculo alocado)') AS veiculo,
       COUNT(r.id)   AS reservas,
       MIN(r.inicio) AS primeira,
       MAX(r.fim)    AS ultima
FROM Veiculo v
FULL OUTER JOIN Reserva r ON v.placa = r.fk_Veiculo_placa
GROUP BY v.placa, v.modelo
HAVING MAX(r.fim) IS NULL
    OR v.placa IS NULL
    OR MAX(r.fim) < DATE '2026-01-01'
ORDER BY ultima NULLS FIRST;`,

  plano: `-- O plano de execução que o PostgreSQL escolheu para a consulta do André
EXPLAIN ANALYZE
SELECT v.placa, COALESCE(SUM(m.valor), 0) AS custo_total
FROM Veiculo v
LEFT JOIN Manutencao m ON v.placa = m.fk_Veiculo_placa
GROUP BY v.placa
HAVING COALESCE(SUM(m.valor), 0) >= 2000 OR SUM(m.valor) IS NULL;`,

  livre: `-- Escreva o que quiser. O banco é o mesmo da apresentação.
-- Tabelas: Cliente, Veiculo, Reserva, Manutencao, Multa, Avaliacao, Residencia
-- Ctrl+Enter executa.

SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;`
};
