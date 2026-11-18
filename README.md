# ExpressMart HN — Chatbot (Proyecto Integrador, Parcial 2)

Chatbot de tienda de conveniencia en línea (datos simulados) con Google Gemini.

## Ejecutar en tu computadora
1. Instala Node.js y Netlify CLI: `npm i -g netlify-cli`
2. Crea tu clave en Google AI Studio y copia `.env.example` a `.env` con tu `GEMINI_API_KEY` (el archivo `.env` NO se sube a GitHub).
3. En esta carpeta: `netlify dev` → abre http://localhost:8888
4. Pruebas sin API: `node test/retrieval.test.js`
5. Pruebas con API (50 preguntas): `node test/pruebas.js` (genera `resultados.csv`)

## Notas
- El modelo se cambia con la variable `GEMINI_MODEL` (por defecto `gemini-2.5-flash`). Verifica en AI Studio que siga vigente.
- La clave solo la lee `netlify/functions/chat.js`; el navegador nunca la ve.
- Los datos (`data/*.json`) son inventados para un proyecto de clase.
