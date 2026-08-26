/* ============================================================================
   MOTOR DO DECK
   Navegação, diagrama do modelo lógico e demonstrações interativas.
   Sem dependências externas — abre direto do arquivo, com ou sem internet.
   ============================================================================ */
(function () {
  "use strict";

  /* =========================================================================
     TABELAS
     ========================================================================= */
  function celulaVazia() {
    return '<span class="nul">NULL</span>';
  }

  function montarTabela(alvo, colunas, linhas, animar) {
    var h = "<thead><tr>";
    colunas.forEach(function (c) { h += "<th>" + c.h + "</th>"; });
    h += "</tr></thead><tbody>";
    linhas.forEach(function (linha, i) {
      h += '<tr class="' + (animar ? "fresh" : "") + '"' +
           (animar ? ' style="animation-delay:' + i * 34 + 'ms"' : "") + ">";
      colunas.forEach(function (c) {
        var v = c.f(linha);
        h += '<td class="' + (c.num ? "num" : "") + '">' +
             (v === null || v === undefined ? celulaVazia() : v) + "</td>";
      });
      h += "</tr>";
    });
    alvo.innerHTML = h + "</tbody>";
  }

  /* =========================================================================
     DIAGRAMA DO MODELO LÓGICO
     Caixas em HTML posicionadas por porcentagem, ligações em SVG.
     modo "estrutura" — clicar numa tabela abre os campos dela
     modo "donos"     — as quatro tabelas dos integrantes ganham cor
     ========================================================================= */
  function montarDiagrama(caixa, modo, painel) {
    /* As linhas ficam em SVG esticado (preserveAspectRatio="none"), entao os
       rotulos precisam esticar junto. Em SVG o texto deformaria; por isso eles
       sao HTML posicionado em porcentagem, que acompanha a caixa em qualquer
       proporcao e mantem a letra redonda. */
    var html = '<svg viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">';
    LIGACOES.forEach(function (l) {
      html += '<path class="wire" d="' + l.d + '"/>';
    });
    html += "</svg>";

    LIGACOES.forEach(function (l) {
      l.rot.forEach(function (r) {
        var fim = r[3] === "end";
        html += '<span class="card" aria-hidden="true" style="left:' + (r[0] / 10) +
                "%; top:" + (r[1] / 5.6) + "%; transform:translate(" +
                (fim ? "-100%" : "0") + ',-100%);">' + r[2] + "</span>";
      });
    });
    Object.keys(ESQUEMA).forEach(function (nome) {
      var e = ESQUEMA[nome];
      var classe = "ent";
      var estilo = "left:" + (e.x / 10) + "%; top:" + (e.y / 5.6) + "%; " +
                   "width:" + (e.w / 10) + "%; height:" + (e.h / 5.6) + "%;";
      if (modo === "donos") {
        if (e.dono) { classe += " owned"; estilo += "--oc:var(--" + e.dono + ");"; }
        else { classe += " dim"; }
      }
      html += '<button class="' + classe + '" style="' + estilo + '" data-ent="' + nome + '"' +
              ' aria-pressed="false">' +
              '<span class="en">' + nome + "</span>" +
              '<span class="ea">' + e.campos.length + " campos</span>" +
              "</button>";
    });
    caixa.innerHTML = html;

    if (modo !== "estrutura" || !painel) return;

    function abrir(nome) {
      var e = ESQUEMA[nome];
      var h = "<h3>" + nome + "</h3><ul>";
      e.campos.forEach(function (c) {
        var cls = c.k === "PK" ? "pk" : c.k === "FK" ? "fk" : "";
        h += '<li class="' + cls + '"><span class="kk">' + (c.k || "") + "</span>" +
             "<span>" + c.n + "</span>" +
             (c.novo ? '<span class="novo">novo</span>' : "") + "</li>";
      });
      painel.innerHTML = h + "</ul>";
      [].forEach.call(caixa.querySelectorAll(".ent"), function (b) {
        b.setAttribute("aria-pressed", b.dataset.ent === nome ? "true" : "false");
      });
    }

    [].forEach.call(caixa.querySelectorAll(".ent"), function (b) {
      b.addEventListener("click", function () { abrir(b.dataset.ent); });
    });
    painel.innerHTML = '<h3>Sete tabelas</h3>' +
      '<p class="hint">Clique numa tabela para ver os campos dela.</p>';
  }

  /* =========================================================================
     OS QUATRO BLOCOS
     Cada integrante tem um controle ligado à própria consulta.
     ========================================================================= */

  /* --- AUGUSTO: o mínimo de multas do HAVING ------------------------------ */
  function desenharAugusto() {
    var corte = +document.getElementById("aug-rng").value;
    var linhas = AUG_RESULTADO.filter(function (r) { return r.multas >= corte; });
    montarTabela(document.getElementById("t-aug-res"), [
      { h: "cliente",  f: function (r) { return r.cliente; } },
      { h: "contato",  f: function (r) { return r.contato; } },
      { h: "total_multas", f: function (r) { return r.multas; },   num: true },
      { h: "reservas",     f: function (r) { return r.reservas; }, num: true }
    ], linhas, true);
    document.getElementById("aug-cap").textContent =
      linhas.length + " linha" + (linhas.length === 1 ? "" : "s");
    document.getElementById("aug-val").textContent =
      corte + " multa" + (corte === 1 ? "" : "s");
    document.getElementById("aug-num").textContent = corte;
  }

  /* --- ANDRÉ: o corte em reais e a troca por INNER JOIN ------------------- */
  var andInner = false;
  function desenharAndre() {
    var corte = +document.getElementById("and-rng").value;
    var linhas = AND_RESULTADO.filter(function (r) {
      return r.custo === null ? !andInner : r.custo >= corte;
    });
    montarTabela(document.getElementById("t-and-res"), [
      { h: "placa",           f: function (r) { return r.placa; } },
      { h: "marca",           f: function (r) { return r.marca; } },
      { h: "modelo",          f: function (r) { return r.modelo; } },
      { h: "qtd_manutencoes", f: function (r) { return r.qtd; }, num: true },
      { h: "custo_total",     f: function (r) { return r.custo === null ? 0 : r.custo; }, num: true }
    ], linhas, true);
    document.getElementById("and-cap").textContent =
      linhas.length + " linha" + (linhas.length === 1 ? "" : "s");
    document.getElementById("and-val").textContent = "R$ " + corte.toLocaleString("pt-BR");
    document.getElementById("and-warn").innerHTML = andInner
      ? "Quatro veículos sumiram do relatório. Continuam no pátio — o INNER JOIN é que não os enxerga."
      : "";
  }

  /* --- DANIEL: a nota de corte -------------------------------------------- */
  function desenharDaniel() {
    var corte = +document.getElementById("dan-rng").value;
    var linhas = DAN_RESULTADO.filter(function (r) {
      return r.nota === null || r.nota < corte;
    });
    montarTabela(document.getElementById("t-dan-res"), [
      { h: "canal",      f: function (r) { return r.canal; } },
      { h: "reservas",   f: function (r) { return r.reservas; }, num: true },
      { h: "nota_media", f: function (r) {
          return r.nota === null ? null : r.nota.toFixed(2).replace(".", ","); }, num: true }
    ], linhas, true);
    document.getElementById("dan-cap").textContent =
      linhas.length + " linha" + (linhas.length === 1 ? "" : "s");
    document.getElementById("dan-val").textContent = corte.toFixed(1).replace(".", ",");
  }

  /* --- GUILHERME: a mesma consulta com cada junção ------------------------ */
  var guiTipo = "full";
  function desenharGuilherme() {
    var linhas = GUI_POR_JUNCAO[guiTipo];
    montarTabela(document.getElementById("t-gui-res"), [
      { h: "veiculo",  f: function (r) { return r.veiculo; } },
      { h: "modelo",   f: function (r) { return r.modelo; } },
      { h: "reservas", f: function (r) { return r.n; }, num: true },
      { h: "primeira", f: function (r) { return r.pri; } },
      { h: "ultima",   f: function (r) { return r.ult; } }
    ], linhas, true);
    document.getElementById("gui-cap").textContent = linhas.length + " linhas";
    var n = document.getElementById("gui-n");
    n.textContent = linhas.length;
    n.style.setProperty("--ac", "var(--" + guiTipo + ")");
    document.getElementById("gui-txt").textContent = GUI_PERDA[guiTipo];
    document.getElementById("gui-placa").textContent =
      guiTipo === "full" ? "FULL OUTER" : guiTipo.toUpperCase() + " JOIN";
    [].forEach.call(document.querySelectorAll("#gui-picker .pick"), function (b) {
      b.setAttribute("aria-pressed", b.dataset.j === guiTipo ? "true" : "false");
    });
  }

  /* =========================================================================
     NAVEGAÇÃO
     ========================================================================= */
  var slides = [].slice.call(document.querySelectorAll(".slide"));
  var pos = { i: 0, passo: 0 };

  function passos(i) { return +(slides[i].dataset.steps || 0); }

  function pintarPassos(n) {
    var atual = slides[pos.i];
    var clausulas = atual.querySelectorAll(".cl");
    if (!clausulas.length) return;
    [].forEach.call(clausulas, function (c) {
      var s = +c.dataset.s;
      c.classList.toggle("on", s === n);
      c.classList.toggle("seen", s < n);
    });
    var notas = atual.querySelectorAll("[data-nota]");
    [].forEach.call(notas, function (el) {
      el.hidden = +el.dataset.nota !== n;
    });
  }

  function desenhar() {
    slides.forEach(function (s, n) { s.classList.toggle("on", n === pos.i); });

    document.getElementById("contador").textContent = pos.i + 1;
    document.getElementById("estrada").style.setProperty(
      "--p", ((pos.i + 1) / slides.length * 100) + "%");

    var dono = slides[pos.i].dataset.dono || "";
    var rot = document.getElementById("dono-atual");
    rot.textContent = slides[pos.i].dataset.quem || "";
    rot.style.setProperty("--ac", dono ? "var(--" + dono + ")" : "var(--ink-3)");

    pintarPassos(pos.passo);

    var id = slides[pos.i].id;
    if (id && location.hash !== "#" + id) {
      history.replaceState(null, "", "#" + id);
    }
    marcarGrade();

    /* O console SQL escuta isto para so acordar o Postgres quando o slide
       dele aparece. Carregar 17 MB na abertura atrasaria o deck a toa. */
    document.dispatchEvent(new CustomEvent("slide:mudou", {
      detail: { id: slides[pos.i].id, indice: pos.i }
    }));
  }

  function avancar() {
    if (pos.passo < passos(pos.i)) { pos.passo++; pintarPassos(pos.passo); return; }
    if (pos.i < slides.length - 1) { pos.i++; pos.passo = 0; desenhar(); }
  }
  function voltar() {
    if (pos.passo > 0) { pos.passo--; pintarPassos(pos.passo); return; }
    if (pos.i > 0) { pos.i--; pos.passo = passos(pos.i); desenhar(); }
  }
  function irPara(n) {
    pos.i = Math.max(0, Math.min(slides.length - 1, n));
    pos.passo = 0;
    desenhar();
  }

  /* ---- visão geral (tecla O) ---------------------------------------------- */
  var grade = document.getElementById("grade");

  function montarGrade() {
    var h = "";
    slides.forEach(function (s, n) {
      var dono = s.dataset.dono;
      h += '<button class="gcard" data-ir="' + n + '"' +
           (dono ? ' style="--ac:var(--' + dono + ')"' : "") + ">" +
           '<span class="gn">' + String(n + 1).padStart(2, "0") + "</span>" +
           '<span class="gt">' + (s.dataset.titulo || "—") + "</span></button>";
    });
    grade.innerHTML = h;
    [].forEach.call(grade.querySelectorAll(".gcard"), function (b) {
      b.addEventListener("click", function () {
        grade.classList.remove("on");
        irPara(+b.dataset.ir);
      });
    });
  }
  function marcarGrade() {
    [].forEach.call(grade.querySelectorAll(".gcard"), function (b, n) {
      b.classList.toggle("cur", n === pos.i);
    });
  }

  /* ---- tema ---------------------------------------------------------------- */
  function trocarTema() {
    var atual = document.documentElement.getAttribute("data-theme");
    if (!atual) {
      atual = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    var novo = atual === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", novo);
    try { localStorage.setItem("tema", novo); } catch (e) { /* sem storage, tudo bem */ }
  }
  try {
    var salvo = localStorage.getItem("tema");
    if (salvo) document.documentElement.setAttribute("data-theme", salvo);
  } catch (e) { /* ignora */ }

  /* ---- teclado, clique e toque -------------------------------------------- */
  document.addEventListener("keydown", function (e) {
    var campo = e.target.tagName;
    if (campo === "INPUT" || campo === "TEXTAREA" || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (k === "ArrowRight" || k === " " || k === "PageDown") { e.preventDefault(); avancar(); }
    else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); voltar(); }
    else if (k === "Home") { irPara(0); }
    else if (k === "End")  { irPara(slides.length - 1); }
    else if (k === "o" || k === "O") { grade.classList.toggle("on"); marcarGrade(); }
    else if (k === "Escape") { grade.classList.remove("on"); }
    else if (k === "t" || k === "T") { trocarTema(); }
    else if (k === "f" || k === "F") {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(function () {});
    }
  });

  /* Clique nas bordas para avancar, util em tablet e sem teclado.
     Antes isso eram duas faixas sobrepostas a tela, que passavam a 11px do
     botao mais a esquerda de cada slide interativo. Agora a decisao e no
     alvo: se o clique caiu num controle, ele e do controle. */
  var INTERATIVO = "button, a, input, select, textarea, label, summary, [role=button]";
  document.addEventListener("click", function (e) {
    if (grade.classList.contains("on")) return;
    if (e.target.closest && e.target.closest(INTERATIVO)) return;
    if (String(getSelection()).length) return;          /* selecionando texto */
    var faixa = e.clientX / window.innerWidth;
    if (faixa > 0.91) avancar();
    else if (faixa < 0.09) voltar();
  });
  document.getElementById("btn-tema").addEventListener("click", trocarTema);
  document.getElementById("btn-grade").addEventListener("click", function () {
    grade.classList.toggle("on");
    marcarGrade();
  });

  var toqueX = 0;
  document.addEventListener("touchstart", function (e) {
    toqueX = e.changedTouches[0].clientX;
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    var d = e.changedTouches[0].clientX - toqueX;
    if (Math.abs(d) > 60) { if (d < 0) avancar(); else voltar(); }
  }, { passive: true });

  /* =========================================================================
     PARTIDA
     ========================================================================= */
  document.getElementById("total").textContent = slides.length;

  montarDiagrama(
    document.getElementById("diagrama-estrutura"), "estrutura",
    document.getElementById("campos-tabela"));
  montarDiagrama(document.getElementById("diagrama-donos"), "donos", null);

  document.getElementById("aug-rng").addEventListener("input", desenharAugusto);
  desenharAugusto();

  document.getElementById("and-rng").addEventListener("input", desenharAndre);
  document.getElementById("and-inner").addEventListener("click", function () {
    andInner = !andInner;
    this.setAttribute("aria-pressed", andInner ? "true" : "false");
    this.textContent = andInner ? "voltar para LEFT JOIN" : "trocar por INNER JOIN";
    desenharAndre();
  });
  desenharAndre();

  document.getElementById("dan-rng").addEventListener("input", desenharDaniel);
  desenharDaniel();

  [].forEach.call(document.querySelectorAll("#gui-picker .pick"), function (b) {
    b.addEventListener("click", function () { guiTipo = b.dataset.j; desenharGuilherme(); });
  });
  desenharGuilherme();

  /* amostras das tabelas de origem dos quatro blocos */
  montarTabela(document.getElementById("t-aug-multa"), [
    { h: "id", f: function (r) { return r.id; }, num: true },
    { h: "valor", f: function (r) { return r.valor; }, num: true },
    { h: "reserva", f: function (r) { return r.reserva; }, num: true }], AUG_MULTA);
  montarTabela(document.getElementById("t-aug-reserva"), [
    { h: "id", f: function (r) { return r.id; }, num: true },
    { h: "fk_Cliente_cpf", f: function (r) { return r.cpf; }, num: true }], AUG_RESERVA);
  montarTabela(document.getElementById("t-aug-cliente"), [
    { h: "cpf", f: function (r) { return r.cpf; }, num: true },
    { h: "nome", f: function (r) { return r.nome; } }], AUG_CLIENTE);

  montarTabela(document.getElementById("t-and-veiculo"), [
    { h: "placa", f: function (r) { return r.placa; } },
    { h: "marca", f: function (r) { return r.marca; } },
    { h: "modelo", f: function (r) { return r.modelo; } }], AND_VEICULO);
  montarTabela(document.getElementById("t-and-manut"), [
    { h: "id", f: function (r) { return r.id; }, num: true },
    { h: "fk_Veiculo_placa", f: function (r) { return r.placa; } },
    { h: "valor", f: function (r) { return r.valor; }, num: true }], AND_MANUT);

  montarTabela(document.getElementById("t-dan-aval"), [
    { h: "id", f: function (r) { return r.id; }, num: true },
    { h: "nota", f: function (r) { return r.nota; }, num: true },
    { h: "plataforma", f: function (r) { return r.plataforma; } },
    { h: "reserva", f: function (r) { return r.reserva; }, num: true }], DAN_AVAL);
  montarTabela(document.getElementById("t-dan-reserva"), [
    { h: "id", f: function (r) { return r.id; }, num: true },
    { h: "status", f: function (r) { return r.status; } }], DAN_RESERVA);

  montarTabela(document.getElementById("t-gui-veiculo"), [
    { h: "placa", f: function (r) { return r.placa; } },
    { h: "modelo", f: function (r) { return r.modelo; } }], GUI_VEICULO);
  montarTabela(document.getElementById("t-gui-reserva"), [
    { h: "id", f: function (r) { return r.id; }, num: true },
    { h: "inicio", f: function (r) { return r.inicio; } },
    { h: "fim", f: function (r) { return r.fim; } },
    { h: "fk_Veiculo_placa", f: function (r) { return r.placa; } }], GUI_RESERVA);

  montarGrade();

  /* Responde a mudancas no endereco depois de carregado: link direto colado
     na barra, botao voltar do navegador, atalho do professor. Sem isso o
     hash muda e o slide fica onde estava. */
  function irPeloEndereco() {
    var alvo = slides.map(function (s) { return "#" + s.id; }).indexOf(location.hash);
    if (alvo > -1 && alvo !== pos.i) { pos.i = alvo; pos.passo = 0; desenhar(); }
  }
  window.addEventListener("hashchange", irPeloEndereco);

  /* abre no slide do endereço, se houver */
  if (location.hash) {
    var alvo = slides.map(function (s) { return "#" + s.id; }).indexOf(location.hash);
    if (alvo > -1) pos.i = alvo;
  }
  desenhar();
})();
