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

/* ---------------------------------------------------------------------------
   AMOSTRAS — recortes reais da carga, usados nos slides de demonstração.
   --------------------------------------------------------------------------- */

/* Par Veiculo x Reserva: a FK aceita NULL, então as quatro junções
   devolvem quantidades diferentes. É o que sustenta o slide "ao vivo". */
const DEMO_VEICULO = [
  { placa: "ABC1D23", modelo: "Nivus" },
  { placa: "HIJ8K90", modelo: "Kwid" },
  { placa: "KLM1N23", modelo: "208" },
  { placa: "LMN2O34", modelo: "C3" }
];
const DEMO_RESERVA = [
  { id: 1,  placa: "ABC1D23" },
  { id: 5,  placa: "HIJ8K90" },
  { id: 18, placa: null },
  { id: 20, placa: null }
];

/* Multas por cliente, antes e depois do GROUP BY — slides de agrupamento. */
const DEMO_MULTAS = [
  { cliente: "Carlos Eduardo Lima", valor: 293, tipo: "Média" },
  { cliente: "Carlos Eduardo Lima", valor: 195, tipo: "Leve" },
  { cliente: "Carlos Eduardo Lima", valor: 880, tipo: "Gravíssima" },
  { cliente: "Gabriel Fonseca",     valor: 130, tipo: "Leve" },
  { cliente: "Gabriel Fonseca",     valor: 293, tipo: "Média" },
  { cliente: "Ana Beatriz Moraes",  valor: 293, tipo: "Média" }
];
