// Prueba directa de la API (lee tu .env, no imprime la clave)
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const key = (env.match(/GEMINI_API_KEY=(.+)/) || [])[1]?.trim();
console.log('Clave leída:', key ? `sí (${key.length} caracteres)` : 'NO');
const modelo = process.argv[2] || 'gemini-2.5-flash';
const t0 = Date.now();
fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
  body: JSON.stringify({ contents: [{ parts: [{ text: 'Responde solo: hola' }] }] }),
  signal: AbortSignal.timeout(20000)
}).then(async r => {
  console.log('Modelo:', modelo, '| Estado:', r.status, '| Tiempo:', ((Date.now() - t0) / 1000).toFixed(1), 's');
  console.log((await r.text()).slice(0, 500));
}).catch(e => console.log('Error de conexión:', e.name, e.message));
