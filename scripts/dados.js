/* ============================================================================
   DADOS DO DECK
   Tudo que aparece nas tabelas dos slides sai daqui. É a mesma carga do
   arquivo sql/02_dml.sql, então o slide nunca diverge do print do SGBD.
   ============================================================================ */

/* ---------------------------------------------------------------------------
   ESQUEMA — alimenta o diagrama interativo do modelo lógico.
   x, y, w, h ficam num espaço de 1000 x 560 e viram porcentagem na tela.
   dono: de quem é o evento (define a cor). null = tabela de apoio.
   --------------------------------------------------------------------------- */
const ESQUEMA = {
  Veiculo: {
    x: 640, y: 30, w: 165, h: 78, dono: null,
    campos: [
      { n: "placa",  t: "VARCHAR(10)", k: "PK" },
      { n: "marca",  t: "VARCHAR(50)" },
      { n: "modelo", t: "VARCHAR(50)" },
      { n: "cor",    t: "VARCHAR(30)" }
    ]
  },
  Manutencao: {
    x: 825, y: 190, w: 165, h: 78, dono: "left",
    campos: [
      { n: "id",               t: "INTEGER",      k: "PK" },
      { n: "defeito",          t: "VARCHAR(150)" },
      { n: "peca",             t: "VARCHAR(100)" },
      { n: "descricao",        t: "VARCHAR(255)" },
      { n: "mecanico_chefe",   t: "VARCHAR(100)" },
      { n: "status",           t: "VARCHAR(20)" },
      { n: "valor",            t: "INTEGER" },
      { n: "fk_Veiculo_placa", t: "VARCHAR(10)",  k: "FK" }
    ]
  },
  Residencia: {
    x: 10, y: 250, w: 165, h: 78, dono: null,
    campos: [
      { n: "cep",              t: "INTEGER",      k: "PK" },
      { n: "numero",           t: "INTEGER" },
      { n: "complemento",      t: "VARCHAR(100)" },
      { n: "ponto_referencia", t: "VARCHAR(150)" },
      { n: "fk_Cliente_cpf",   t: "BIGINT",       k: "FK" }
    ]
  },
  Cliente: {
    x: 250, y: 250, w: 165, h: 78, dono: null,
    campos: [
      { n: "cpf",     t: "BIGINT",       k: "PK" },
      { n: "nome",    t: "VARCHAR(100)" },
      { n: "idade",   t: "INTEGER" },
      { n: "genero",  t: "VARCHAR(20)" },
      { n: "contato", t: "VARCHAR(20)" },
      { n: "status",  t: "VARCHAR(20)" }
    ]
  },
  Reserva: {
    x: 490, y: 250, w: 165, h: 78, dono: "full",
    campos: [
      { n: "id",               t: "INTEGER",     k: "PK" },
      { n: "inicio",           t: "DATE" },
      { n: "fim",              t: "DATE" },
      { n: "retirada",         t: "DATE" },
      { n: "status",           t: "VARCHAR(20)" },
      { n: "fk_Cliente_cpf",   t: "BIGINT",      k: "FK" },
      { n: "fk_Veiculo_placa", t: "VARCHAR(10)", k: "FK", novo: true }
    ]
  },
  Avaliacao: {
    x: 250, y: 450, w: 165, h: 78, dono: "right",
    campos: [
      { n: "id",            t: "INTEGER",      k: "PK" },
      { n: "comentario",    t: "VARCHAR(255)" },
      { n: "nota",          t: "INTEGER" },
      { n: "plataforma",    t: "VARCHAR(50)" },
      { n: "sugestao",      t: "VARCHAR(255)" },
      { n: "fk_Reserva_id", t: "INTEGER",      k: "FK" }
    ]
  },
  Multa: {
    x: 490, y: 450, w: 165, h: 78, dono: "inner",
    campos: [
      { n: "id",            t: "INTEGER",      k: "PK" },
      { n: "valor",         t: "INTEGER" },
      { n: "tipo",          t: "VARCHAR(50)" },
      { n: "motivo",        t: "VARCHAR(255)" },
      { n: "status",        t: "VARCHAR(20)" },
      { n: "fk_Reserva_id", t: "INTEGER",      k: "FK" }
    ]
  }
};

/* Ligações do diagrama. `d` é o traçado (coordenadas do espaço 1000x560),
   `rot` são os rótulos de cardinalidade nas duas pontas. */
const LIGACOES = [
  /* Nas ligacoes horizontais o vao e curto, entao um rotulo fica acima da
     linha e o outro abaixo — senao eles se sobrepoem. */
  { d: "M175,289 H250",
    rot: [[180, 283, "(1,n)", "start"], [245, 306, "(1,1)", "end"]] },
  { d: "M415,289 H490",
    rot: [[420, 283, "(1,1)", "start"], [485, 306, "(0,n)", "end"]] },
  { d: "M572,250 V160 H722 V108",
    rot: [[580, 246, "(0,n)", "start"], [730, 126, "(1,1)", "start"]] },
  { d: "M805,69 H907 V190",
    rot: [[811, 62, "(0,1)", "start"], [915, 186, "(0,n)", "start"]] },
  { d: "M572,328 V450",
    rot: [[580, 344, "(1,1)", "start"], [580, 444, "(0,n)", "start"]] },
  { d: "M520,328 V390 H332 V450",
    rot: [[514, 344, "(1,1)", "end"], [340, 444, "(0,1)", "start"]] }
];

/* Quem responde por qual evento. A cor acompanha a junção. */
const EQUIPE = [
  { nome: "Augusto",   evento: "Multa",      tabela: "Multa",      junta: "INNER JOIN",  cor: "inner", fn: "COUNT" },
  { nome: "André",     evento: "Manutenção", tabela: "Manutencao", junta: "LEFT JOIN",   cor: "left",  fn: "SUM" },
  { nome: "Daniel",    evento: "Avaliação",  tabela: "Avaliacao",  junta: "RIGHT JOIN",  cor: "right", fn: "AVG" },
  { nome: "Guilherme", evento: "Reserva",    tabela: "Reserva",    junta: "FULL OUTER",  cor: "full",  fn: "MAX · MIN" }
];

/* ===========================================================================
   OS QUATRO BLOCOS
   Amostras das tabelas de origem e o resultado real de cada consulta,
   conferido no PostgreSQL 16.
   =========================================================================== */

/* --- AUGUSTO · Multa · INNER JOIN · COUNT -------------------------------- */
const AUG_MULTA = [
  { id: 1, valor: 293, tipo: "Media",      reserva: 2 },
  { id: 2, valor: 195, tipo: "Leve",       reserva: 4 },
  { id: 3, valor: 880, tipo: "Gravissima", reserva: 12 },
  { id: 4, valor: 130, tipo: "Leve",       reserva: 7 }
];
const AUG_RESERVA = [
  { id: 2,  cpf: 22233344455 },
  { id: 4,  cpf: 22233344455 },
  { id: 12, cpf: 22233344455 },
  { id: 7,  cpf: 66677788899 }
];
/* Helena e Fernanda entram no lugar de Igor e Ana de proposito: elas nao tem
   NENHUMA multa no banco inteiro. Igor tem duas e Ana tem uma — apareciam
   riscadas como descartadas aqui e voltavam no resultado dois slides depois,
   uma contradicao que o professor pegaria na hora. */
const AUG_CLIENTE = [
  { cpf: 22233344455, nome: "Carlos Eduardo Lima" },
  { cpf: 66677788899, nome: "Gabriel Fonseca" },
  { cpf: 77788899900, nome: "Helena Vasconcelos" },
  { cpf: 55566677788, nome: "Fernanda Rocha" }
];
/* agregado completo, antes do HAVING */
const AUG_RESULTADO = [
  { cliente: "Carlos Eduardo Lima", contato: "(11) 97654-3210", multas: 3, reservas: 3 },
  { cliente: "Gabriel Fonseca",     contato: "(11) 93210-9876", multas: 2, reservas: 2 },
  { cliente: "Igor Salgado",        contato: "(11) 91098-7654", multas: 2, reservas: 2 },
  { cliente: "Ana Beatriz Moraes",  contato: "(11) 98765-4321", multas: 1, reservas: 1 },
  { cliente: "Daniela Prado",       contato: "(11) 96543-2109", multas: 1, reservas: 1 },
  { cliente: "Leonardo Castro",     contato: "(11) 99876-5432", multas: 1, reservas: 1 }
];

/* --- ANDRÉ · Manutenção · LEFT JOIN · SUM -------------------------------- */
const AND_VEICULO = [
  { placa: "ABC1D23", marca: "Volkswagen", modelo: "Nivus" },
  { placa: "DEF4G56", marca: "Toyota",     modelo: "Corolla" },
  { placa: "CDE3F45", marca: "Fiat",       modelo: "Pulse" },
  { placa: "EFG5H67", marca: "Honda",      modelo: "Civic" }
];
const AND_MANUT = [
  { id: 1, placa: "ABC1D23", valor: 1800 },
  { id: 2, placa: "ABC1D23", valor: 950 },
  { id: 3, placa: "DEF4G56", valor: 1200 },
  { id: 4, placa: "DEF4G56", valor: 2400 },
  { id: 5, placa: "DEF4G56", valor: 1500 }
];
/* agregado completo, antes do HAVING */
const AND_RESULTADO = [
  { placa: "DEF4G56", marca: "Toyota",     modelo: "Corolla",  qtd: 3, custo: 5100 },
  { placa: "GHI7J89", marca: "Jeep",       modelo: "Renegade", qtd: 2, custo: 4090 },
  { placa: "JKL0M12", marca: "Ford",       modelo: "Ranger",   qtd: 2, custo: 3550 },
  { placa: "ABC1D23", marca: "Volkswagen", modelo: "Nivus",    qtd: 2, custo: 2750 },
  { placa: "IJK9L01", marca: "Nissan",     modelo: "Kicks",    qtd: 1, custo: 1750 },
  { placa: "FGH6I78", marca: "Hyundai",    modelo: "HB20",     qtd: 1, custo: 680 },
  { placa: "KLM1N23", marca: "Peugeot",    modelo: "208",      qtd: 1, custo: 520 },
  { placa: "BRA2E19", marca: "Chevrolet",  modelo: "Onix",     qtd: 1, custo: 450 },
  { placa: "CDE3F45", marca: "Fiat",       modelo: "Pulse",    qtd: 0, custo: null },
  { placa: "EFG5H67", marca: "Honda",      modelo: "Civic",    qtd: 0, custo: null },
  { placa: "HIJ8K90", marca: "Renault",    modelo: "Kwid",     qtd: 0, custo: null },
  { placa: "LMN2O34", marca: "Citroen",    modelo: "C3",       qtd: 0, custo: null }
];

/* --- DANIEL · Avaliação · RIGHT JOIN · AVG ------------------------------- */
const DAN_AVAL = [
  { id: 1, nota: 9, plataforma: "Google Maps", reserva: 1 },
  { id: 3, nota: 7, plataforma: "Instagram",   reserva: 3 },
  { id: 5, nota: 5, plataforma: "WhatsApp",    reserva: 5 }
];
const DAN_RESERVA = [
  { id: 1,  status: "Concluida" },
  { id: 3,  status: "Concluida" },
  { id: 5,  status: "Concluida" },
  { id: 18, status: "Pendente" },
  { id: 20, status: "Pendente" }
];
/* agregado completo, antes do HAVING */
const DAN_RESULTADO = [
  { canal: "WhatsApp",        reservas: 2, nota: 5.50 },
  { canal: "Instagram",       reservas: 3, nota: 7.00 },
  { canal: "Site Proprio",    reservas: 3, nota: 8.00 },
  { canal: "Google Maps",     reservas: 4, nota: 9.00 },
  { canal: "(sem avaliacao)", reservas: 8, nota: null }
];

/* --- GUILHERME · Reserva · FULL OUTER JOIN · MAX e MIN ------------------- */
const GUI_VEICULO = [
  { placa: "BRA2E19", modelo: "Onix" },
  { placa: "HIJ8K90", modelo: "Kwid" },
  { placa: "KLM1N23", modelo: "208" },
  { placa: "LMN2O34", modelo: "C3" }
];
const GUI_RESERVA = [
  { id: 3,  inicio: "2025-10-15", fim: "2025-10-22", placa: "BRA2E19" },
  { id: 5,  inicio: "2025-11-13", fim: "2025-11-20", placa: "HIJ8K90" },
  { id: 18, inicio: "2026-07-06", fim: "2026-07-13", placa: null },
  { id: 20, inicio: "2026-08-10", fim: "2026-08-17", placa: null }
];
/* Resultado real de cada variante da consulta. Trocar a juncao muda o que
   se enxerga: 2 / 4 / 3 / 5 linhas. Conferido no PostgreSQL 16. */
const GUI_POR_JUNCAO = {
  inner: [
    { veiculo: "BRA2E19", modelo: "Onix", n: 1, pri: "2025-10-15", ult: "2025-10-22" },
    { veiculo: "HIJ8K90", modelo: "Kwid", n: 1, pri: "2025-11-13", ult: "2025-11-20" }
  ],
  left: [
    { veiculo: "KLM1N23", modelo: "208",  n: 0, pri: null, ult: null },
    { veiculo: "LMN2O34", modelo: "C3",   n: 0, pri: null, ult: null },
    { veiculo: "BRA2E19", modelo: "Onix", n: 1, pri: "2025-10-15", ult: "2025-10-22" },
    { veiculo: "HIJ8K90", modelo: "Kwid", n: 1, pri: "2025-11-13", ult: "2025-11-20" }
  ],
  right: [
    { veiculo: "BRA2E19", modelo: "Onix", n: 1, pri: "2025-10-15", ult: "2025-10-22" },
    { veiculo: "HIJ8K90", modelo: "Kwid", n: 1, pri: "2025-11-13", ult: "2025-11-20" },
    { veiculo: "(sem veiculo alocado)", modelo: "---", n: 3, pri: "2026-07-06", ult: "2026-08-17" }
  ],
  full: [
    { veiculo: "KLM1N23", modelo: "208",  n: 0, pri: null, ult: null },
    { veiculo: "LMN2O34", modelo: "C3",   n: 0, pri: null, ult: null },
    { veiculo: "BRA2E19", modelo: "Onix", n: 1, pri: "2025-10-15", ult: "2025-10-22" },
    { veiculo: "HIJ8K90", modelo: "Kwid", n: 1, pri: "2025-11-13", ult: "2025-11-20" },
    { veiculo: "(sem veiculo alocado)", modelo: "---", n: 3, pri: "2026-07-06", ult: "2026-08-17" }
  ]
};
const GUI_PERDA = {
  inner: "Perde tudo que nao tem par: some o carro parado e some a reserva sem carro.",
  left:  "Mostra os carros parados, mas nao ve as reservas sem veiculo alocado.",
  right: "Mostra as reservas sem carro, mas nao ve os carros que ninguem reservou.",
  full:  "Unico que mostra os dois problemas ao mesmo tempo."
};

/* ===========================================================================
   AS JUNÇÕES, PASSO A PASSO
   Alimenta a animação do slide de dados originais: quais linhas de origem
   produziram cada linha do resultado. As amostras são subconjuntos fechados
   da carga — nenhum registro aponta para fora do que está na tela.
   =========================================================================== */

/* Uma tabela de origem: nome, colunas visíveis e como identificar cada linha */
function fonte(nome, colunas, linhas, id) {
  return { nome, colunas, linhas, id };
}

const JUNCOES = {
  /* AUGUSTO · INNER JOIN encadeado: Multa -> Reserva -> Cliente.
     Igor e Ana estão na tabela Cliente e não produzem nada: é o INNER
     descartando quem não tem par. */
  aug: {
    tipo: "INNER JOIN", cor: "inner",
    fontes: [
      fonte("Multa", [["id","id"],["valor","valor"],["reserva","fk_Reserva_id"]],
            AUG_MULTA, (r) => r.id),
      fonte("Reserva", [["id","id"],["cpf","fk_Cliente_cpf"]],
            AUG_RESERVA, (r) => r.id),
      fonte("Cliente", [["cpf","cpf"],["nome","nome"]],
            AUG_CLIENTE, (r) => r.cpf)
    ],
    colunas: ["multa", "valor", "reserva", "cliente"],
    montar() {
      const saida = [];
      AUG_MULTA.forEach((m) => {
        const r = AUG_RESERVA.find((x) => x.id === m.reserva);
        if (!r) return;
        const c = AUG_CLIENTE.find((x) => x.cpf === r.cpf);
        if (!c) return;
        saida.push({
          cel: [m.id, m.valor, r.id, c.nome],
          origem: { Multa: [m.id], Reserva: [r.id], Cliente: [c.cpf] }
        });
      });
      return saida;
    }
  },

  /* ANDRÉ · LEFT JOIN: Pulse e Civic ficam na lista com NULL do lado direito.
     Com INNER JOIN eles sumiriam. */
  and: {
    tipo: "LEFT JOIN", cor: "left",
    fontes: [
      fonte("Veiculo", [["placa","placa"],["modelo","modelo"]],
            AND_VEICULO, (r) => r.placa),
      fonte("Manutencao", [["id","id"],["placa","fk_Veiculo_placa"],["valor","valor"]],
            AND_MANUT, (r) => r.id)
    ],
    colunas: ["placa", "modelo", "manutencao", "valor"],
    montar() {
      const saida = [];
      AND_VEICULO.forEach((v) => {
        const ms = AND_MANUT.filter((m) => m.placa === v.placa);
        if (ms.length) {
          ms.forEach((m) => saida.push({
            cel: [v.placa, v.modelo, m.id, m.valor],
            origem: { Veiculo: [v.placa], Manutencao: [m.id] }
          }));
        } else {
          saida.push({
            cel: [v.placa, v.modelo, null, null],
            origem: { Veiculo: [v.placa], Manutencao: [] }
          });
        }
      });
      return saida;
    }
  },

  /* DANIEL · RIGHT JOIN: as reservas 18 e 20 aparecem sem avaliação.
     A tabela preservada é a da direita. */
  dan: {
    tipo: "RIGHT JOIN", cor: "right",
    fontes: [
      fonte("Avaliacao", [["id","id"],["nota","nota"],["plataforma","plataforma"],["reserva","fk_Reserva_id"]],
            DAN_AVAL, (r) => r.id),
      fonte("Reserva", [["id","id"],["status","status"]],
            DAN_RESERVA, (r) => r.id)
    ],
    colunas: ["reserva", "plataforma", "nota"],
    montar() {
      return DAN_RESERVA.map((r) => {
        const a = DAN_AVAL.find((x) => x.reserva === r.id);
        return a
          ? { cel: [r.id, a.plataforma, a.nota], origem: { Avaliacao: [a.id], Reserva: [r.id] } }
          : { cel: [r.id, null, null],           origem: { Avaliacao: [],     Reserva: [r.id] } };
      });
    }
  },

  /* GUILHERME · FULL OUTER JOIN: sobra dos dois lados na mesma tabela —
     carro que ninguém reservou e reserva sem carro alocado. */
  gui: {
    tipo: "FULL OUTER JOIN", cor: "full",
    fontes: [
      fonte("Veiculo", [["placa","placa"],["modelo","modelo"]],
            GUI_VEICULO, (r) => r.placa),
      fonte("Reserva", [["id","id"],["fim","fim"],["placa","fk_Veiculo_placa"]],
            GUI_RESERVA, (r) => r.id)
    ],
    colunas: ["placa", "modelo", "reserva", "fim"],
    montar() {
      const saida = [];
      GUI_VEICULO.forEach((v) => {
        const rs = GUI_RESERVA.filter((r) => r.placa === v.placa);
        if (rs.length) {
          rs.forEach((r) => saida.push({
            cel: [v.placa, v.modelo, r.id, r.fim],
            origem: { Veiculo: [v.placa], Reserva: [r.id] }
          }));
        } else {
          saida.push({
            cel: [v.placa, v.modelo, null, null],
            origem: { Veiculo: [v.placa], Reserva: [] }
          });
        }
      });
      GUI_RESERVA.filter((r) => r.placa === null).forEach((r) => saida.push({
        cel: [null, null, r.id, r.fim],
        origem: { Veiculo: [], Reserva: [r.id] }
      }));
      return saida;
    }
  }
};
