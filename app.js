// app.js — Lógica del chat (frontend). No contiene ninguna clave de API.
const ENDPOINT = '/.netlify/functions/chat';
const state = { data: null, history: [], busy: false };
const $ = id => document.getElementById(id);
const box = $('messages'), input = $('input'), sendBtn = $('send');

async function loadData() {
  const [productos, horarios, pedidos] = await Promise.all(
    ['productos', 'horarios', 'pedidos'].map(f => fetch(`data/${f}.json`).then(r => r.json())));
  state.data = { productos, horarios, pedidos };
}

function render(md) {
  return DOMPurify.sanitize(marked.parse(md, { breaks: true }));
}
function addMsg(text, who, extraClass = '') {
  const el = document.createElement('div');
  el.className = `msg ${who} ${extraClass}`.trim();
  if (who === 'bot') el.innerHTML = render(text); else el.textContent = text;
  box.appendChild(el); box.scrollTop = box.scrollHeight;
  return el;
}
function addFeedback(el) {
  const fb = document.createElement('div'); fb.className = 'fb';
  ['👍', '👎'].forEach((e, i) => {
    const b = document.createElement('button'); b.textContent = e;
    b.setAttribute('aria-label', i ? 'Respuesta no útil' : 'Respuesta útil');
    b.onclick = () => { fb.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on');
      console.log('feedback', i ? 'negativo' : 'positivo'); }; // en esta etapa solo se registra en consola
    fb.appendChild(b);
  });
  el.appendChild(fb);
}
function typing() {
  const el = document.createElement('div'); el.className = 'msg bot';
  el.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
  box.appendChild(el); box.scrollTop = box.scrollHeight; return el;
}

async function send(raw) {
  const text = raw.trim();
  if (!text || state.busy || !state.data) return;
  state.busy = true; sendBtn.disabled = true;
  const { text: clean, changed } = Retrieval.sanitize(text);
  addMsg(clean, 'user');
  input.value = '';
  if (changed) addMsg('⚠️ Quité datos sensibles de tu mensaje antes de enviarlo. Por seguridad, no los compartas por aquí.', 'bot');
  const wait = typing();
  try {
    const context = Retrieval.buildContext(clean, state.data);
    const res = await fetch(ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: clean, history: state.history.slice(-6), context })
    });
    const data = await res.json();
    wait.remove();
    if (!res.ok) throw new Error(data.error || 'Error desconocido');
    const el = addMsg(data.reply, 'bot'); addFeedback(el);
    state.history.push({ role: 'user', text: clean }, { role: 'model', text: data.reply });
  } catch (e) {
    wait.remove();
    addMsg(`${e.message || 'No pude conectarme.'} Puedes escribirnos por WhatsApp: ${state.data.horarios.whatsapp}`, 'bot', 'error');
  } finally { state.busy = false; sendBtn.disabled = false; input.focus(); }
}

function welcome() {
  box.innerHTML = ''; state.history = [];
  addMsg('¡Hola! 👋 Soy **Expi**, el asistente de **ExpressMart HN**. Te ayudo con productos, precios, horarios, envíos y el estado de tu pedido. ¿En qué te ayudo?', 'bot');
}

sendBtn.onclick = () => send(input.value);
input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } });
$('clear').onclick = welcome;
$('chips').addEventListener('click', e => {
  const q = e.target.dataset.q; if (!q) return;
  if (q.endsWith('EM-')) { input.value = q; input.focus(); } else send(q);
});
loadData().then(welcome).catch(() => addMsg('No pude cargar los datos de la tienda.', 'bot', 'error'));
