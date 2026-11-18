# ExpressMart HN — Chatbot de tienda de conveniencia
 
Asistente virtual con IA para una tienda de conveniencia en línea de San Pedro Sula, Honduras. Responde preguntas sobre **productos, precios, disponibilidad, horarios, envíos y estado de pedidos**, las 24 horas.
 
> Proyecto de clase (Inteligencia Artificial Aplicada, UTH). Los datos de la tienda son **simulados**.
 
**Demo en vivo:** https://TU-SITIO.netlify.app
 
## Qué hace
- Contesta en español (entiende expresiones como «ocupo» y errores de ortografía).
- Consulta el catálogo (40 productos), los horarios y 10 pedidos de ejemplo (formato `EM-1042`).
- Si no tiene el dato, lo dice y ofrece el WhatsApp de la tienda en lugar de inventar.
- Quita números de tarjeta, correos y teléfonos del mensaje antes de enviarlo.
- Solo **consulta** información; no crea pedidos.
 
## Cómo se usa
1. Abre la página y escribe tu pregunta, o usa los botones rápidos (horarios, pedido, precios, envío).
2. Para consultar un pedido, escribe su número, por ejemplo `EM-1042`.
3. Califica cada respuesta con 👍 / 👎 y usa «Limpiar» para empezar de nuevo.
 
Ejemplos: «¿A qué hora cierran los domingos?», «¿Tienen pan de molde integral?», «¿Dónde está mi pedido EM-1042?».
 
## Tecnologías
- Frontend: HTML, CSS y JavaScript puro; `marked.js` y `DOMPurify` (CDN) para mostrar las respuestas con formato de forma segura.
- Backend: función serverless de Netlify (`netlify/functions/chat.mjs`, Node.js).
- IA: API de Google Gemini (modelo Flash-Lite, con modelo de respaldo).
- Despliegue: Netlify, conectado a este repositorio de GitHub.
 
## Cómo funciona
```
Navegador (JS + JSON de la tienda) → /api/chat (función serverless) → API de Gemini
```
El navegador elige los datos relevantes y los envía junto con la pregunta; la función agrega las instrucciones del bot y llama a Gemini con la clave secreta. La clave **nunca** llega al navegador.
 
## Ejecutar en tu computadora
1. Instala [Node.js](https://nodejs.org) (LTS) y Netlify CLI: `npm i -g netlify-cli`
2. Clona el repositorio y entra a la carpeta.
3. Crea tu clave en [Google AI Studio](https://aistudio.google.com) y copia `.env.example` como `.env`, con tus valores:
   ```
   GEMINI_API_KEY=tu_clave
   GEMINI_MODEL=gemini-flash-lite-latest
   GEMINI_FALLBACK=gemini-3.5-flash-lite
   ```
4. Ejecuta `netlify dev` y abre http://localhost:8888
5. Pruebas: `node test/retrieval.test.js` y `node test/chat.mock.test.mjs` (sin gastar la API). Con la API: `node test/pruebas.js` (50 preguntas, con `netlify dev` encendido).
 
## Desplegar en Netlify
Importa el repositorio en Netlify («Import from Git»), con *publish directory* `.` y *functions* `netlify/functions` (ya está en `netlify.toml`). En *Site configuration → Environment variables* agrega `GEMINI_API_KEY`, `GEMINI_MODEL` y `GEMINI_FALLBACK`, y vuelve a desplegar.
 
## Seguridad y límites
- La clave vive solo en variables de entorno (el `.env` está en `.gitignore`).
- Límite de 15 solicitudes por minuto por IP (en la configuración de la función), 30 mensajes por sesión y mensajes de máximo 500 caracteres.
- Los nombres de los modelos cambian con el tiempo: se configuran por variable de entorno.
- No se guarda el historial de las conversaciones.
 
## Estructura
```
index.html · style.css · app.js     Interfaz del chat
retrieval.js                        Búsqueda de datos y filtro de privacidad
data/                               productos.json, pedidos.json, horarios.json (simulados)
netlify/functions/chat.mjs          Función serverless que llama a Gemini
test/                               Pruebas automáticas
```
 
**Autor:** Pedro Abinadi Funes Castro — Universidad Tecnológica de Honduras.
