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
      '<p class="hint">Clique numa tabela para ver os campos dela. ' +
      'Os atributos ficam escondidos de propósito: listados todos de uma vez, ' +
      'ninguém lê do fundo da sala.</p>';
  }

  /* =========================================================================
     AS QUATRO JUNÇÕES AO VIVO
     ========================================================================= */
  var EXPLICA = {
    inner: "Só quem tem par nos dois lados. Carro sem reserva e reserva sem carro somem.",
    left:  "Todo carro do pátio aparece. Sem reserva, o lado direito vira NULL.",
    right: "Toda reserva aparece. Sem carro alocado, o lado esquerdo vira NULL.",
    full:  "Os dois lados inteiros. Carro encalhado e reserva sem carro na mesma tabela."
  };

  function juntar(tipo) {
    var saida = [];
    DEMO_VEICULO.forEach(function (v) {
      var pares = DEMO_RESERVA.filter(function (r) { return r.placa === v.placa; });
      if (pares.length) pares.forEach(function (r) { saida.push({ v: v, r: r }); });
      else if (tipo === "left" || tipo === "full") saida.push({ v: v, r: null });
    });
    if (tipo === "right" || tipo === "full") {
      DEMO_RESERVA.filter(function (r) { return r.placa === null; })
                  .forEach(function (r) { saida.push({ v: null, r: r }); });
    }
    return saida;
  }

  var COLUNAS_JUNCAO = [
    { h: "placa",   f: function (o) { return o.v ? o.v.placa : null; } },
    { h: "modelo",  f: function (o) { return o.v ? o.v.modelo : null; } },
    { h: "reserva", f: function (o) { return o.r ? o.r.id : null; }, num: true }
  ];

  var tipoAtual = "left";

  function desenharJuncao() {
    var linhas = juntar(tipoAtual);
    montarTabela(document.getElementById("t-juncao"), COLUNAS_JUNCAO, linhas, true);
    document.getElementById("juncao-cap").textContent = linhas.length + " linhas";
    var n = document.getElementById("juncao-n");
    n.textContent = linhas.length;
    n.style.setProperty("--ac", "var(--" + tipoAtual + ")");
    document.getElementById("juncao-txt").textContent = EXPLICA[tipoAtual];
    document.getElementById("juncao-placa").textContent =
      tipoAtual === "full" ? "FULL OUTER" : tipoAtual.toUpperCase() + " JOIN";
    [].forEach.call(document.querySelectorAll("#picker-juncao .pick"), function (b) {
      b.setAttribute("aria-pressed", b.dataset.j === tipoAtual ? "true" : "false");
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
    if (slides[pos.i].querySelector("#t-juncao")) desenharJuncao();

    var id = slides[pos.i].id;
    if (id && location.hash !== "#" + id) {
      history.replaceState(null, "", "#" + id);
    }
    marcarGrade();
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
    if (e.target.tagName === "INPUT" || e.ctrlKey || e.metaKey || e.altKey) return;
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

  document.getElementById("zona-dir").addEventListener("click", avancar);
  document.getElementById("zona-esq").addEventListener("click", voltar);
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

  [].forEach.call(document.querySelectorAll("#picker-juncao .pick"), function (b) {
    b.addEventListener("click", function () { tipoAtual = b.dataset.j; desenharJuncao(); });
  });

  /* amostra de multas — slides de GROUP BY */
  montarTabela(document.getElementById("t-multas-cru"), [
    { h: "cliente", f: function (r) { return r.cliente; } },
    { h: "tipo",    f: function (r) { return r.tipo; } },
    { h: "valor",   f: function (r) { return r.valor; }, num: true }
  ], DEMO_MULTAS);

  var agrupado = [];
  DEMO_MULTAS.forEach(function (m) {
    var g = agrupado.filter(function (x) { return x.cliente === m.cliente; })[0];
    if (!g) { g = { cliente: m.cliente, qtd: 0, soma: 0 }; agrupado.push(g); }
    g.qtd++; g.soma += m.valor;
  });
  montarTabela(document.getElementById("t-multas-agrupado"), [
    { h: "cliente",      f: function (r) { return r.cliente; } },
    { h: "COUNT(*)",     f: function (r) { return r.qtd; },  num: true },
    { h: "SUM(valor)",   f: function (r) { return r.soma; }, num: true }
  ], agrupado);

  montarGrade();

  /* abre no slide do endereço, se houver */
  if (location.hash) {
    var alvo = slides.map(function (s) { return "#" + s.id; }).indexOf(location.hash);
    if (alvo > -1) pos.i = alvo;
  }
  desenhar();
})();
