// Prueba del módulo de recuperación (NO usa la API). Ejecutar: node test/retrieval.test.js
const R = require('../retrieval.js'); const fs = require('fs');
const d = { productos: JSON.parse(fs.readFileSync('data/productos.json')), pedidos: JSON.parse(fs.readFileSync('data/pedidos.json')), horarios: JSON.parse(fs.readFileSync('data/horarios.json')) };
const topId = q => (R.searchProducts(q, d.productos)[0] || {}).id;
const cases = [
 ['¿Tienen leche deslactosada?', () => topId('¿Tienen leche deslactosada?') === 'P003'],
 ['¿Cuánto cuesta el pan de molde integral?', () => topId('¿Cuánto cuesta el pan de molde integral?') === 'P004'],
 ['ocupo una gaseosa de 2 litros', () => topId('ocupo una gaseosa de 2 litros') === 'P002'],
 ['papitas', () => topId('papitas') === 'P005'],
 ['detergente en polvo', () => topId('detergente en polvo') === 'P007'],
 ['¿tienen jabon de bano?', () => topId('¿tienen jabon de bano?') === 'P006'],
 ['agua', () => ['P001','P009'].includes(topId('agua'))],
 ['¿Hay huevos?', () => topId('¿Hay huevos?') === 'P039'],
 ['¿Venden pañales?', () => R.searchProducts('¿Venden pañales?', d.productos).length === 0],
 ['Pedido EM-1042 → id', () => R.findOrderId('¿Dónde está mi pedido EM-1042?') === 'EM-1042'],
 ['em 1042 (minúsculas/espacio)', () => R.findOrderId('mi pedido em 1042 no llega') === 'EM-1042'],
 ['Sin número de pedido → null', () => R.findOrderId('¿dónde está mi pedido?') === null],
 ['Contexto incluye pedido encontrado', () => R.buildContext('pedido EM-1042', d).pedido_consultado.encontrado === true],
 ['Contexto: pedido inexistente', () => R.buildContext('pedido EM-9999', d).pedido_consultado.encontrado === false],
 ['Contexto genérico incluye catálogo resumido', () => {
   const ctx = R.buildContext('¿Qué productos y precios tienen?', d);
   const expected = d.productos.map(p => ({ id: p.id, nombre: p.nombre, precio: p.precio, disponible: p.disponible }));
   return JSON.stringify(ctx.catalogo_resumido) === JSON.stringify(expected);
 }],
 ['Contexto sin coincidencias incluye catálogo resumido', () => {
   const ctx = R.buildContext('¿Venden pañales?', d);
   return ctx.catalogo_resumido.length === d.productos.length && !ctx.productos_relacionados;
 }],
 ['Contexto específico no incluye el catálogo completo', () => {
   const ctx = R.buildContext('¿Tienen leche deslactosada?', d);
   return !ctx.catalogo_resumido && ctx.productos_relacionados[0].id === 'P003';
 }],
 ['Filtro: tarjeta 4111 1111 1111 1111', () => { const s = R.sanitize('mi tarjeta es 4111 1111 1111 1111'); return s.changed && !/4111/.test(s.text); }],
 ['Filtro: correo', () => R.sanitize('escribame a juan@correo.com').changed],
 ['Filtro: teléfono 9876-5432', () => R.sanitize('llamen al 9876-5432').changed],
 ['Filtro NO borra EM-1042', () => { const s = R.sanitize('pedido EM-1042'); return !s.changed && s.text.includes('EM-1042'); }],
 ['Estado: domingo 7:00 p. m. → cerrado', () => R.storeStatus(d.horarios, new Date('2026-10-19T01:00:00Z')).abierto === false],
 ['Estado: sábado 10:00 a. m. → abierto', () => R.storeStatus(d.horarios, new Date('2026-10-17T16:00:00Z')).abierto === true],
];
let ok = 0;
cases.forEach(([n, f]) => { let r = false; try { r = f(); } catch (e) {} if (r) ok++; console.log((r ? 'PASS ' : 'FAIL ') + n); });
console.log(`\nResultado: ${ok}/${cases.length} = ${(ok / cases.length * 100).toFixed(0)} %`);
