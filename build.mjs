/* ============================================================================
   GERA O ARQUIVO ÚNICO DE PRÉ-VISUALIZAÇÃO
   Junta CSS, JS e fontes num só HTML, para abrir sem servidor.
   O site de verdade é o index.html com os arquivos separados — este aqui é
   só uma cópia empacotada.

   Uso:  node build.mjs
   ============================================================================ */
import { readFileSync, writeFileSync } from "node:fs";

const ler = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

const html = ler("./index.html");

/* pega só o miolo: o que está entre <body> e </body> */
const corpo = html.split("<body>")[1].split("</body>")[0];

/* tira as tags de script, que serão embutidas */
const corpoLimpo = corpo.replace(/\s*<script src="[^"]+"><\/script>/g, "");

const saida = `<title>Quatro Junções</title>
<style>
${ler("./assets/fontes.css")}
</style>
<style>
${ler("./styles/deck.css")}
</style>
${corpoLimpo}
<script>
${ler("./scripts/dados.js")}
</script>
<script>
${ler("./scripts/deck.js")}
</script>
`;

writeFileSync(new URL("./preview.html", import.meta.url), saida);
console.log(`preview.html gerado · ${(saida.length / 1024).toFixed(0)} KB`);
