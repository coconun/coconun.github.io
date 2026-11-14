/*
 * Lógica del catálogo de PROP (sin nada de pantalla, para poder probarla).
 * La usa js/app.js en el navegador y tests/catalogo.test.js en Node.
 */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.Catalogo = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var COLOR_POR_DEFECTO = '#7b2d86';
  var FONDO_POR_DEFECTO = '#2b0f30';
  var MENSAJE_POR_DEFECTO = 'Hola {negocio}, quiero {producto} ({presentacion}) a {precio}. ¿Está disponible?';

  // 3.5 → "S/ 3.50"
  function soles(monto) {
    // Redondeo con notación exponencial para evitar errores como 1.005 → 1.00
    var n = Math.round(Number(Number(monto) + 'e2')) / 100;
    return 'S/ ' + (isFinite(n) ? n : 0).toFixed(2);
  }

  // "Limón Sútil" → "limon sutil" (para buscar sin importar tildes ni mayúsculas)
  function sinTildes(texto) {
    return String(texto == null ? '' : texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }

  function slug(texto) {
    return sinTildes(texto).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'producto';
  }

  function esColor(c) {
    return typeof c === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c.trim());
  }

  function esPrecio(p) {
    return typeof p === 'number' ? isFinite(p) && p >= 0 : false;
  }

  /*
   * Revisa y completa la lista de productos de config.json.
   * Solo son obligatorios "nombre" y "precio"; lo demás tiene un valor por defecto.
   * Devuelve { productos, errores } — los productos con errores no se muestran.
   */
  function prepararProductos(lista) {
    var productos = [];
    var errores = [];
    var usados = {};

    (Array.isArray(lista) ? lista : []).forEach(function (p, i) {
      var n = i + 1;
      if (!p || typeof p !== 'object') { errores.push('Producto ' + n + ': no tiene el formato correcto.'); return; }
      var nombre = String(p.nombre || '').trim();
      if (!nombre) { errores.push('Producto ' + n + ': falta el nombre.'); return; }
      if (!esPrecio(p.precio)) { errores.push('Producto ' + n + ' (' + nombre + '): el precio debe ser un número sin comillas, por ejemplo 3.5'); return; }

      var id = slug(p.id || nombre);
      var base = id, k = 2;
      while (usados[id]) id = base + '-' + (k++);
      usados[id] = true;

      var imagenes = [].concat(p.imagenes || [], p.imagen || []).filter(function (s) { return typeof s === 'string' && s.trim(); });
      var precioAnterior = esPrecio(p.precioAnterior) && p.precioAnterior > p.precio ? p.precioAnterior : null;
      var agotado = p.agotado === true;

      var etiquetas = [];
      if (agotado) etiquetas.push('Agotado');
      if (precioAnterior) etiquetas.push('Oferta');
      if (p.etiqueta && String(p.etiqueta).trim()) etiquetas.push(String(p.etiqueta).trim());

      productos.push({
        id: id,
        nombre: nombre,
        categoria: String(p.categoria || '').trim() || 'Productos',
        presentacion: String(p.presentacion || '').trim(),
        precio: p.precio,
        precioAnterior: precioAnterior,
        descripcion: String(p.descripcion || '').trim(),
        detalles: (Array.isArray(p.detalles) ? p.detalles : []).map(String).filter(Boolean),
        imagenes: imagenes,
        color: esColor(p.color) ? p.color.trim() : COLOR_POR_DEFECTO,
        fondo: esColor(p.fondo) ? p.fondo.trim() : FONDO_POR_DEFECTO,
        palabra: String(p.palabra || nombre.split(/\s+/)[0]).toUpperCase(),
        estrella: p.estrella === true,
        agotado: agotado,
        etiquetas: etiquetas
      });
      if (!imagenes.length) errores.push('Producto ' + n + ' (' + nombre + '): no tiene foto; se muestra sin imagen.');
    });

    return { productos: productos, errores: errores };
  }

  // Categorías en el orden en que aparecen en config.json
  function categorias(productos) {
    var vistas = [];
    productos.forEach(function (p) { if (vistas.indexOf(p.categoria) === -1) vistas.push(p.categoria); });
    return vistas;
  }

  // Productos marcados como "estrella"; si no hay ninguno, los 3 primeros
  function estrellas(productos) {
    var marcadas = productos.filter(function (p) { return p.estrella; });
    return marcadas.length ? marcadas : productos.slice(0, 3);
  }

  /*
   * Filtra por categoría ("" o "Todos" = todas) y por texto.
   * Cada palabra buscada debe aparecer en el nombre, categoría, presentación, descripción o detalles.
   */
  function filtrar(productos, categoria, texto) {
    var palabras = sinTildes(texto).split(/\s+/).filter(Boolean);
    return productos.filter(function (p) {
      if (categoria && categoria !== 'Todos' && p.categoria !== categoria) return false;
      if (!palabras.length) return true;
      var pajar = sinTildes([p.nombre, p.categoria, p.presentacion, p.descripcion].concat(p.detalles).join(' '));
      return palabras.every(function (w) { return pajar.indexOf(w) !== -1; });
    });
  }

  // Solo números; si es un celular peruano de 9 dígitos, agrega el 51
  function numeroWhatsApp(numero) {
    var d = String(numero || '').replace(/\D/g, '');
    if (d.length === 9 && d.charAt(0) === '9') d = '51' + d;
    return d;
  }

  function enlaceWhatsApp(numero, mensaje) {
    return 'https://wa.me/' + numeroWhatsApp(numero) + (mensaje ? '?text=' + encodeURIComponent(mensaje) : '');
  }

  function mensajeProducto(plantilla, producto, negocio) {
    var datos = {
      negocio: negocio || '',
      producto: producto.nombre,
      presentacion: producto.presentacion,
      precio: soles(producto.precio),
      categoria: producto.categoria
    };
    return String(plantilla || MENSAJE_POR_DEFECTO)
      .replace(/\{(\w+)\}/g, function (todo, clave) { return clave in datos ? datos[clave] : todo; })
      .replace(/\s*\(\s*\)/g, '')            // sin presentación: quita los paréntesis vacíos
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function enlaceTelefono(telefono) {
    return 'tel:' + String(telefono || '').replace(/[^\d+]/g, '');
  }

  return {
    soles: soles,
    sinTildes: sinTildes,
    slug: slug,
    prepararProductos: prepararProductos,
    categorias: categorias,
    estrellas: estrellas,
    filtrar: filtrar,
    numeroWhatsApp: numeroWhatsApp,
    enlaceWhatsApp: enlaceWhatsApp,
    mensajeProducto: mensajeProducto,
    enlaceTelefono: enlaceTelefono
  };
});
