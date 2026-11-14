// Pruebas de la lógica del catálogo. Ejecutar dentro de web-prop con:  node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../js/catalogo.js');

const raiz = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(raiz, 'config.json'), 'utf8'));

test('config.json es válido: productos sin errores y con fotos que existen', () => {
  const { productos, errores } = C.prepararProductos(config.productos);
  assert.deepEqual(errores, []);
  assert.equal(productos.length, config.productos.length);
  for (const p of productos) {
    assert.ok(p.imagenes.length > 0, p.nombre + ' sin foto');
    for (const img of p.imagenes) assert.ok(fs.existsSync(path.join(raiz, img)), 'No existe ' + img);
  }
  assert.match(C.numeroWhatsApp(config.contacto.whatsapp), /^51\d{9}$/);
});

test('las estrellas actuales son la chicha, la limonada y la gran combinación de 320 ml', () => {
  const { productos } = C.prepararProductos(config.productos);
  const nombres = C.estrellas(productos).map(p => p.nombre + ' ' + p.presentacion);
  assert.deepEqual(nombres, ['Chicha morada Botella 320 ml', 'Limonada Botella 320 ml', 'La gran combinación Botella 320 ml']);
});

test('hay una categoría de accesorios básicos con la libreta', () => {
  const { productos } = C.prepararProductos(config.productos);
  assert.deepEqual(C.categorias(productos), ['Bebidas', 'Accesorios básicos']);
  assert.deepEqual(C.filtrar(productos, 'Accesorios básicos', '').map(p => p.nombre), ['Libreta kraft']);
});

test('el chat de WhatsApp tiene saludo y respuestas rápidas', () => {
  const chat = config.contacto.chat;
  assert.ok(chat.saludo);
  assert.ok(Array.isArray(chat.respuestasRapidas) && chat.respuestasRapidas.length > 0);
});

test('un producto nuevo solo necesita nombre y precio', () => {
  const { productos, errores } = C.prepararProductos([{ nombre: 'Tomatodo PROP', precio: 15, imagen: 'img/x.webp' }]);
  assert.deepEqual(errores, []);
  const p = productos[0];
  assert.equal(p.id, 'tomatodo-prop');
  assert.equal(p.categoria, 'Productos');
  assert.equal(p.palabra, 'TOMATODO');
  assert.deepEqual(p.imagenes, ['img/x.webp']);
  assert.match(p.color, /^#/);
  assert.equal(p.estrella, false);
});

test('errores comunes al editar se detectan y ese producto no se muestra', () => {
  const { productos, errores } = C.prepararProductos([
    { nombre: '', precio: 3 },
    { nombre: 'Chicha', precio: '3.50' },  // precio entre comillas
    { nombre: 'Limonada', precio: -1 },
    { nombre: 'Sin foto', precio: 2 },
    null
  ]);
  assert.deepEqual(productos.map(p => p.nombre), ['Sin foto']);
  assert.equal(errores.length, 5);
  assert.match(errores[1], /sin comillas/);
  assert.match(errores[3], /no tiene foto/);
});

test('ids únicos aunque se repita el nombre', () => {
  const { productos } = C.prepararProductos([{ nombre: 'Chicha', precio: 1 }, { nombre: 'Chicha', precio: 2 }, { nombre: 'Chicha', precio: 3 }]);
  assert.deepEqual(productos.map(p => p.id), ['chicha', 'chicha-2', 'chicha-3']);
});

test('etiquetas: oferta solo si el precio anterior es mayor, y agotado', () => {
  const { productos } = C.prepararProductos([
    { nombre: 'A', precio: 3, precioAnterior: 4, etiqueta: 'Nuevo' },
    { nombre: 'B', precio: 3, precioAnterior: 2 },
    { nombre: 'C', precio: 3, agotado: true }
  ]);
  assert.deepEqual(productos[0].etiquetas, ['Oferta', 'Nuevo']);
  assert.equal(productos[1].precioAnterior, null);
  assert.deepEqual(productos[1].etiquetas, []);
  assert.deepEqual(productos[2].etiquetas, ['Agotado']);
});

test('soles con dos decimales y sin errores de redondeo', () => {
  assert.equal(C.soles(3.5), 'S/ 3.50');
  assert.equal(C.soles(0.1 + 0.2), 'S/ 0.30');
  assert.equal(C.soles(12), 'S/ 12.00');
  assert.equal(C.soles(1.005), 'S/ 1.01');
});

const LISTA = C.prepararProductos([
  { nombre: 'Chicha morada', categoria: 'Bebidas', presentacion: 'Botella 320 ml', precio: 3.5, detalles: ['Maíz morado'] },
  { nombre: 'Limonada', categoria: 'Bebidas', presentacion: 'Botella 320 ml', precio: 3.5, descripcion: 'Con limón peruano' },
  { nombre: 'Tomatodo', categoria: 'Accesorios', precio: 15 }
]).productos;

test('categorías en el orden de config.json', () => {
  assert.deepEqual(C.categorias(LISTA), ['Bebidas', 'Accesorios']);
});

test('filtro por categoría y búsqueda sin importar tildes ni mayúsculas', () => {
  const nombres = r => r.map(p => p.nombre);
  assert.deepEqual(nombres(C.filtrar(LISTA, 'Todos', '')), ['Chicha morada', 'Limonada', 'Tomatodo']);
  assert.deepEqual(nombres(C.filtrar(LISTA, 'Accesorios', '')), ['Tomatodo']);
  assert.deepEqual(nombres(C.filtrar(LISTA, '', 'LIMON')), ['Limonada']);
  assert.deepEqual(nombres(C.filtrar(LISTA, '', 'maiz')), ['Chicha morada']);
  assert.deepEqual(nombres(C.filtrar(LISTA, 'Bebidas', '320 chicha')), ['Chicha morada']);
  assert.deepEqual(nombres(C.filtrar(LISTA, 'Accesorios', 'chicha')), []);
});

test('mensaje de WhatsApp por producto', () => {
  const msg = C.mensajeProducto(config.contacto.mensajeProducto, LISTA[0], 'PROP');
  assert.equal(msg, 'Hola PROP, quiero Chicha morada (Botella 320 ml) a S/ 3.50. ¿Está disponible?');
  // sin presentación no quedan paréntesis vacíos; con plantilla vacía usa la de por defecto
  assert.equal(C.mensajeProducto('', LISTA[2], 'PROP'), 'Hola PROP, quiero Tomatodo a S/ 15.00. ¿Está disponible?');
});

test('enlaces de WhatsApp y teléfono', () => {
  assert.equal(C.numeroWhatsApp('+51 997 555 990'), '51997555990');
  assert.equal(C.numeroWhatsApp('997 555 990'), '51997555990'); // agrega el 51 a celulares de 9 dígitos
  assert.equal(C.enlaceWhatsApp('51997555990', 'Hola, ¿precio?'), 'https://wa.me/51997555990?text=Hola%2C%20%C2%BFprecio%3F');
  assert.equal(C.enlaceWhatsApp('51997555990', ''), 'https://wa.me/51997555990');
  assert.equal(C.enlaceTelefono('+51 997 555 990'), 'tel:+51997555990');
});
