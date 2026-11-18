// Pruebas de extremo a extremo con 50 preguntas. Uso:
//   1) netlify dev                         (en otra terminal, con tu .env)
//   2) node test/pruebas.js [url]          (por defecto http://localhost:8888/.netlify/functions/chat)
// Corrección AUTOMÁTICA por palabras clave: revisa también las respuestas a mano (columna "respuesta" del CSV).
const fs = require('fs'); const R = require('../retrieval.js');
const URL_ = process.argv[2] || 'http://localhost:8888/.netlify/functions/chat';
const d = { productos: JSON.parse(fs.readFileSync('data/productos.json')), pedidos: JSON.parse(fs.readFileSync('data/pedidos.json')), horarios: JSON.parse(fs.readFileSync('data/horarios.json')) };
const casos = JSON.parse(fs.readFileSync('test/pruebas.json'));
const norm = s => R.normalize(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  let ok = 0, tiempos = [], filas = ['n,pregunta,paso,segundos,respuesta'];
  for (let i = 0; i < casos.length; i++) {
    const [q, debe = [], noDebe = []] = casos[i];
    const t0 = Date.now(); let reply = '';
    try {
      const r = await fetch(URL_, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, history: [], context: R.buildContext(q, d) }) });
      reply = (await r.json()).reply || ''; 
    } catch (e) { reply = 'ERROR: ' + e.message; }
    const seg = (Date.now() - t0) / 1000; tiempos.push(seg);
    const n = norm(reply);
    const paso = debe.every(p => new RegExp(norm(p)).test(n)) && !noDebe.some(p => new RegExp(norm(p)).test(n));
    if (paso) ok++;
    console.log(`${String(i + 1).padStart(2)} ${paso ? 'PASS' : 'FAIL'} (${seg.toFixed(1)}s) ${q}`);
    filas.push([i + 1, q, paso ? 'SI' : 'NO', seg.toFixed(1), reply.replace(/\s+/g, ' ')].map(x => `"${String(x).replace(/"/g, '""')}"`).join(','));
    await sleep(4500); // respeta el límite de solicitudes por minuto del plan gratuito
  }
  fs.writeFileSync('resultados.csv', filas.join('\n'));
  const prom = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
  console.log(`\nExactitud: ${ok}/${casos.length} = ${(ok / casos.length * 100).toFixed(1)} %  |  Tiempo promedio: ${prom.toFixed(1)} s`);
  console.log('Detalle en resultados.csv — revisa a mano los FAIL (a veces la respuesta es correcta pero con otras palabras).');
})();
