/* ============================================================================
   A JUNÇÃO ACONTECENDO

   No slide de dados originais de cada integrante, as tabelas de origem ficam
   em cima e o resultado embaixo, vazio. Ao avançar, cada linha do resultado
   nasce na frente do público: as linhas que a produziram se acendem nas
   tabelas de cima, e só então ela aparece.

   Depois de montado, o rastro continua vivo nos dois sentidos:
   clicar numa linha do resultado acende a origem dela; clicar numa linha de
   origem acende tudo que ela produziu. Linha que a junção descartou fica
   marcada — no INNER JOIN, é ela que explica o que sumiu.

   Nada aqui é decoração: é a única parte do trabalho que mostra a junção
   como processo, e não como resultado pronto.
   ============================================================================ */
(function () {
  "use strict";

  const PASSO_MS = 430;      /* tempo de cada linha nascendo */
  const montados = new Map(); /* quem -> estado do componente */

  function celula(v) {
    if (v === null || v === undefined) return '<span class="nul">NULL</span>';
    return String(v);
  }

  /* ---------- monta a estrutura (uma vez por integrante) ------------------ */
  function montar(caixa) {
    const quem = caixa.dataset.quem;
    const j = JUNCOES[quem];
    if (!j) return null;

    const linhas = j.montar();

    /* Tres tabelas empilhadas nao cabem em pe: as duas primeiras vao lado a
       lado e a terceira ocupa a fileira de baixo. */
    let h = '<div class="jx-fontes' + (j.fontes.length > 2 ? " tres" : "") + '">';
    j.fontes.forEach((f) => {
      h += '<div class="tbox jx-fonte" data-tab="' + f.nome + '">' +
           '<div class="cap"><span>' + f.nome + '</span><span>' +
             f.linhas.length + ' linhas</span></div>' +
           '<div class="tscroll"><table><thead><tr>';
      f.colunas.forEach((c) => { h += "<th>" + c[1] + "</th>"; });
      h += "</tr></thead><tbody>";
      f.linhas.forEach((l) => {
        h += '<tr data-rid="' + f.id(l) + '">';
        f.colunas.forEach((c) => {
          const v = l[c[0]];
          const num = typeof v === "number";
          h += '<td class="' + (num ? "num" : "") + '">' + celula(v) + "</td>";
        });
        h += "</tr>";
      });
      h += "</tbody></table></div></div>";
    });
    h += "</div>";

    h += '<div class="jx-acao">' +
           '<button class="jx-btn" type="button">Juntar</button>' +
           '<span class="jx-dica">' + j.tipo + ' · ' + linhas.length + ' linhas</span>' +
         "</div>";

    h += '<div class="tbox jx-res"><div class="cap"><span>Resultado da junção</span>' +
         '<span class="jx-cont">0 de ' + linhas.length + '</span></div>' +
         '<div class="tscroll"><table><thead><tr>';
    j.colunas.forEach((c) => { h += "<th>" + c + "</th>"; });
    h += '</tr></thead><tbody></tbody></table></div></div>';

    caixa.innerHTML = h;
    caixa.style.setProperty("--jc", "var(--" + j.cor + ")");
    caixa.style.setProperty("--jc-t", "var(--" + j.cor + "-t)");

    const est = {
      j, linhas, caixa,
      corpo: caixa.querySelector(".jx-res tbody"),
      cont: caixa.querySelector(".jx-cont"),
      btn: caixa.querySelector(".jx-btn"),
      tocando: false,
      pronto: false,
      geracao: 0
    };
    montados.set(quem, est);

    est.btn.addEventListener("click", () => (est.pronto ? reiniciar(est) : tocar(est)));

    /* rastro: do resultado para a origem */
    est.corpo.addEventListener("click", (e) => {
      const tr = e.target.closest("tr");
      if (!tr || !est.pronto) return;
      apagar(est);
      if (tr.classList.contains("sel")) return;
      tr.classList.add("sel");
      acender(est, est.linhas[+tr.dataset.i].origem);
    });

    /* rastro: da origem para o resultado */
    caixa.querySelectorAll(".jx-fonte tbody").forEach((tb) => {
      tb.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        if (!tr || !est.pronto) return;
        const tab = tr.closest(".jx-fonte").dataset.tab;
        const rid = tr.dataset.rid;
        const jaSel = tr.classList.contains("aceso");
        apagar(est);
        if (jaSel) return;
        tr.classList.add("aceso");
        est.linhas.forEach((l, i) => {
          if ((l.origem[tab] || []).some((x) => String(x) === rid)) {
            const alvo = est.corpo.querySelector('tr[data-i="' + i + '"]');
            if (alvo) alvo.classList.add("sel");
          }
        });
      });
    });

    return est;
  }

  /* ---------- destaque ---------------------------------------------------- */
  function acender(est, origem) {
    Object.entries(origem).forEach(([tab, ids]) => {
      const t = est.caixa.querySelector('.jx-fonte[data-tab="' + tab + '"]');
      if (!t) return;
      ids.forEach((id) => {
        const tr = t.querySelector('tr[data-rid="' + id + '"]');
        if (tr) tr.classList.add("aceso");
      });
    });
  }
  function apagar(est) {
    est.caixa.querySelectorAll(".aceso").forEach((e) => e.classList.remove("aceso"));
    est.caixa.querySelectorAll(".sel").forEach((e) => e.classList.remove("sel"));
  }

  /* ---------- a animação --------------------------------------------------- */
  async function tocar(est) {
    if (est.tocando || est.pronto) return;
    est.tocando = true;
    const g = ++est.geracao;
    est.btn.disabled = true;
    est.btn.textContent = "Juntando…";

    for (let i = 0; i < est.linhas.length; i++) {
      if (g !== est.geracao) return;                 /* saiu do slide no meio */
      const linha = est.linhas[i];

      apagar(est);
      acender(est, linha.origem);
      await espera(PASSO_MS * 0.45);
      if (g !== est.geracao) return;

      const tr = document.createElement("tr");
      tr.dataset.i = i;
      tr.className = "fresh";
      tr.innerHTML = linha.cel.map((v) => {
        const num = typeof v === "number";
        return '<td class="' + (num ? "num" : "") + '">' + celula(v) + "</td>";
      }).join("");
      est.corpo.appendChild(tr);
      est.cont.textContent = (i + 1) + " de " + est.linhas.length;
      await espera(PASSO_MS * 0.55);
    }
    if (g !== est.geracao) return;

    apagar(est);
    marcarDescartadas(est);
    est.pronto = true;
    est.tocando = false;
    est.btn.disabled = false;
    est.btn.textContent = "Repetir";
    est.caixa.classList.add("pronta");
  }

  /* Linha de origem que nao entrou em nenhuma linha do resultado.
     No INNER JOIN sao elas que respondem "cade o Igor e a Ana?". */
  function marcarDescartadas(est) {
    const usadas = new Set();
    est.linhas.forEach((l) =>
      Object.entries(l.origem).forEach(([t, ids]) =>
        ids.forEach((i) => usadas.add(t + "#" + i))));

    let n = 0;
    est.caixa.querySelectorAll(".jx-fonte").forEach((t) => {
      const tab = t.dataset.tab;
      t.querySelectorAll("tbody tr").forEach((tr) => {
        if (!usadas.has(tab + "#" + tr.dataset.rid)) { tr.classList.add("fora"); n++; }
      });
    });
    if (n) {
      est.caixa.querySelector(".jx-dica").innerHTML =
        est.j.tipo + " · <b>" + n + " linha" + (n === 1 ? "" : "s") +
        " descartada" + (n === 1 ? "" : "s") + "</b>";
    }
  }

  function reiniciar(est) {
    est.geracao++;
    est.tocando = false;
    est.pronto = false;
    est.corpo.innerHTML = "";
    est.cont.textContent = "0 de " + est.linhas.length;
    est.btn.textContent = "Juntar";
    est.btn.disabled = false;
    est.caixa.classList.remove("pronta");
    est.caixa.querySelectorAll(".fora").forEach((e) => e.classList.remove("fora"));
    est.caixa.querySelector(".jx-dica").textContent =
      est.j.tipo + " · " + est.linhas.length + " linhas";
    apagar(est);
  }

  const espera = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- ligação com o deck ------------------------------------------ */
  window.Juncao = {
    /* chamado quando o slide entra em cena */
    entrar(caixa) {
      const quem = caixa.dataset.quem;
      const est = montados.get(quem) || montar(caixa);
      if (est) reiniciar(est);
    },
    /* chamado quando o apresentador avança dentro do slide */
    avancar(caixa) {
      const est = montados.get(caixa.dataset.quem);
      if (est) tocar(est);
    }
  };
})();
