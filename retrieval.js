/* retrieval.js — Selección de datos relevantes y filtro de privacidad.
   Funciona en el navegador (window.Retrieval) y en Node (module.exports) para poder probarlo. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Retrieval = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const STOPWORDS = new Set(('el la los las un una unos unas de del al y o u en con sin por para que cual cuales cuanto cuanta cuantos ' +
    'cuesta cuestan precio precios tiene tienen tienes hay venden vende me mi mis tu su es son esta estan ' +
    'hola buenas buenos dias tardes noches quiero quisiera ocupo necesito busco saber favor porfa por favor ' +
    'a que hora horas cierran abren abre cierra donde pedido como puedo se si no lo le les ya mas').split(' '));

  function normalize(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function stem(w) { // singular simple
    if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
    if (w.length > 3 && w.endsWith('s')) return w.slice(0, -1);
    return w;
  }
  function tokens(t) {
    return normalize(t).replace(/[^a-z0-9ñ\s-]/g, ' ').split(/\s+/)
      .filter(w => w && !STOPWORDS.has(w) && w.length > 1).map(stem);
  }

  /** Quita datos sensibles ANTES de enviar el texto a la API. */
  function sanitize(text) {
    let out = String(text || '').slice(0, 500);
    let changed = false;
    const rep = (re, tag) => { out = out.replace(re, () => { changed = true; return tag; }); };
    rep(/\b(?:\d[ -]?){13,19}\b/g, '[DATO ELIMINADO]');                 // números de tarjeta
    rep(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[DATO ELIMINADO]');               // correos
    rep(/(?<![A-Za-z]-)\b\d{4}[ -]?\d{4}\b(?!\d)/g, '[DATO ELIMINADO]'); // teléfonos de 8 dígitos (no toca EM-1042)
    return { text: out, changed };
  }

  function findOrderId(text) {
    const m = String(text || '').match(/\bEM[\s-]?(\d{4})\b/i);
    return m ? 'EM-' + m[1] : null;
  }

  function searchProducts(query, productos, max = 5) {
    const q = tokens(query);
    if (!q.length) return [];
    const scored = productos.map(p => {
      const nombre = tokens(p.nombre), cat = tokens(p.categoria),
            desc = tokens(p.descripcion), sin = tokens((p.sinonimos || []).join(' '));
      let s = 0;
      q.forEach(w => {
        if (nombre.includes(w)) s += 3;
        if (sin.includes(w)) s += 3;
        if (cat.includes(w)) s += 1.5;
        if (desc.includes(w)) s += 1;
      });
      return { p, s };
    }).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
    return scored.slice(0, max).map(x => x.p);
  }

  /** ¿Está abierta la tienda ahora? (hora de Honduras, UTC-6, sin horario de verano) */
  function storeStatus(horarios, now = new Date()) {
    const hn = new Date(now.getTime() - 6 * 3600 * 1000);
    const dow = hn.getUTCDay(); // 0 = domingo
    const h = horarios.horario[dow === 0 ? 'domingo' : 'lunes_a_sabado'];
    const mins = hn.getUTCHours() * 60 + hn.getUTCMinutes();
    const [ah, am] = h.abre.split(':').map(Number), [ch, cm] = h.cierra.split(':').map(Number);
    const abierto = mins >= ah * 60 + am && mins < ch * 60 + cm;
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return { abierto, dia: dias[dow], hora_local: String(hn.getUTCHours()).padStart(2, '0') + ':' + String(hn.getUTCMinutes()).padStart(2, '0') };
  }

  /** Arma el contexto (solo lo necesario) que se envía junto con la pregunta. */
  function buildContext(message, data, now = new Date()) {
    const orderId = findOrderId(message);
    const ctx = { tienda: data.horarios, estado_actual: storeStatus(data.horarios, now) };
    if (orderId) {
      const pedido = data.pedidos.find(p => p.id === orderId);
      ctx.pedido_consultado = { numero: orderId, encontrado: !!pedido, datos: pedido || null };
    }
    const prods = searchProducts(message, data.productos);
    if (prods.length) ctx.productos_relacionados = prods;
    const generico = /\b(productos?|precios?|catalogo|lista|que venden|que tienen)\b/.test(normalize(message));
    if (generico || !prods.length) {
      ctx.catalogo_resumido = data.productos.map(p => ({ id: p.id, nombre: p.nombre, precio: p.precio, disponible: p.disponible }));
    }
    ctx.categorias_disponibles = [...new Set(data.productos.map(p => p.categoria))];
    return ctx;
  }

  return { normalize, tokens, sanitize, findOrderId, searchProducts, storeStatus, buildContext };
});
