/*
 * PROP — pantalla y animaciones. Todo el contenido se lee de config.json;
 * para agregar productos NO necesitas tocar este archivo.
 * La lógica (precios, filtros, mensajes de WhatsApp) está en js/catalogo.js.
 */
(function () {
  'use strict';

  var C = window.Catalogo;
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var cfg, contacto;

  if (quieto) document.documentElement.classList.add('sin-movimiento');

  // ---------- utilidades ----------
  function obtener(obj, ruta) {
    return ruta.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }

  // Crea elementos de forma segura (siempre textContent, nunca innerHTML)
  function el(etiqueta, attrs, hijos) {
    var nodo = document.createElement(etiqueta);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'texto') nodo.textContent = v;
      else if (k === 'estilo') Object.keys(v).forEach(function (p) { nodo.style.setProperty(p, v[p]); });
      else if (k.indexOf('on') === 0) nodo.addEventListener(k.slice(2), v);
      else nodo.setAttribute(k, v);
    });
    (hijos || []).forEach(function (h) { if (h) nodo.appendChild(typeof h === 'string' ? document.createTextNode(h) : h); });
    return nodo;
  }

  function colores(p) { return { '--c': p.color, '--f': p.fondo }; }

  function mensajeDe(p) { return C.mensajeProducto(contacto.mensajeProducto, p, cfg.negocio.nombre); }

  function botonPedir(p) {
    if (p.agotado) return el('a', { class: 'boton boton--lima', 'aria-disabled': 'true', texto: 'Agotado' });
    return el('a', {
      class: 'boton boton--lima', href: C.enlaceWhatsApp(contacto.whatsapp, mensajeDe(p)),
      target: '_blank', rel: 'noopener', 'data-chat': mensajeDe(p), 'aria-label': 'Lo quiero: pedir ' + p.nombre + ' por WhatsApp', texto: 'Lo quiero'
    });
  }

  function etiquetas(p) {
    if (!p.etiquetas.length) return null;
    return el('div', { class: 'etiquetas' }, p.etiquetas.map(function (t) {
      var mod = t === 'Oferta' ? ' etiqueta--oferta' : t === 'Agotado' ? ' etiqueta--agotado' : '';
      return el('span', { class: 'etiqueta' + mod, texto: t });
    }));
  }

  function bloquePrecio(p, clase) {
    return el('div', { class: clase }, [
      el('strong', { texto: C.soles(p.precio) }),
      p.precioAnterior ? el('s', { 'aria-label': 'Antes ' + C.soles(p.precioAnterior), texto: C.soles(p.precioAnterior) }) : null,
      p.presentacion ? el('span', { texto: p.presentacion }) : null
    ]);
  }

  function chips(p) {
    return p.detalles.length ? el('ul', { class: 'chips' }, p.detalles.map(function (d) { return el('li', { texto: d }); })) : null;
  }

  // ---------- textos simples ----------
  function pintarTextos() {
    document.querySelectorAll('[data-texto]').forEach(function (n) {
      var v = obtener(cfg, n.getAttribute('data-texto'));
      if (v) n.textContent = v;
      else if (n.tagName !== 'A') n.hidden = true;
    });
    var nombre = cfg.negocio.nombre || 'PROP';
    document.getElementById('marca').textContent = nombre;
    document.querySelector('.pie__marca').textContent = nombre;
  }

  // ==========================================================================
  // 1. PORTADA: vitrina de productos estrella
  // ==========================================================================
  function pintarHero(estrellas) {
    var hero = document.getElementById('inicio');
    var h1 = document.getElementById('hero-titulo');
    var titulo = (cfg.inicio && cfg.inicio.titulo) || cfg.negocio.nombre;

    // Título que aparece letra por letra (la última palabra va en verde)
    h1.setAttribute('aria-label', titulo);
    var palabras = titulo.split(/\s+/), i = 0;
    palabras.forEach(function (w, wi) {
      var caja = el('span', { class: 'palabra' + (wi === palabras.length - 1 ? ' acento' : ''), 'aria-hidden': 'true' });
      Array.from(w).forEach(function (letra) { caja.appendChild(el('span', { class: 'letra', estilo: { '--i': i++ }, texto: letra })); });
      h1.appendChild(caja);
      if (wi < palabras.length - 1) h1.appendChild(document.createTextNode(' '));
    });

    // Burbujas
    if (!quieto) {
      var burbujas = document.getElementById('burbujas');
      for (var b = 0; b < 18; b++) {
        burbujas.appendChild(el('i', { estilo: {
          '--x': (Math.random() * 100).toFixed(1) + '%',
          '--t': (6 + Math.random() * 22).toFixed(0) + 'px',
          '--d': (7 + Math.random() * 9).toFixed(1) + 's',
          '--r': (-Math.random() * 14).toFixed(1) + 's'
        } }));
      }
    }

    if (!estrellas.length) { document.getElementById('hero-escena').hidden = true; return; }

    var cont = document.getElementById('hero-botellas');
    var imgs = estrellas.map(function (p, n) {
      var img = el('img', { class: 'hero__botella', src: p.imagenes[0] || '', alt: p.nombre + ' ' + p.presentacion, decoding: 'async', fetchpriority: n === 0 ? 'high' : null });
      img.addEventListener('click', function () { abrirVisor(p, img); });
      img.style.cursor = 'zoom-in';
      cont.appendChild(img);
      return img;
    });

    var palabra = document.getElementById('hero-palabra');
    var actual = document.getElementById('hero-actual');
    var pedir = document.getElementById('hero-pedir');
    var controles = document.getElementById('hero-controles');
    var meta = document.querySelector('meta[name="theme-color"]');
    var puntos = [];
    var indice = -1, temporizador = null, pausado = quieto, pausaUsuario = false;

    function mostrar(n) {
      if (n === indice) return;
      var anterior = imgs[indice];
      if (anterior) {
        anterior.classList.remove('activa');
        anterior.classList.add('saliendo');
        setTimeout(function () { anterior.classList.remove('saliendo'); }, 900);
      }
      indice = n;
      var p = estrellas[n];
      imgs[n].classList.add('activa');
      hero.style.setProperty('--f', p.fondo);
      hero.style.setProperty('--c', p.color);
      if (meta) meta.setAttribute('content', p.fondo);

      palabra.textContent = '';
      palabra.appendChild(el('span', { texto: (p.palabra + ' ').repeat(3) }));

      actual.textContent = '';
      actual.classList.remove('cambio');
      void actual.offsetWidth; // reinicia la animación
      actual.classList.add('cambio');
      actual.appendChild(el('span', { class: 'nombre', texto: p.nombre }));
      actual.appendChild(el('span', { class: 'precio', texto: C.soles(p.precio) }));
      if (p.presentacion) actual.appendChild(el('span', { class: 'presentacion', texto: p.presentacion }));

      var nuevo = botonPedir(p);
      nuevo.id = 'hero-pedir';
      pedir.replaceWith(nuevo);
      pedir = nuevo;

      puntos.forEach(function (b, k) { b.setAttribute('aria-current', String(k === n)); });
    }

    function siguiente(paso) { mostrar((indice + (paso || 1) + estrellas.length) % estrellas.length); }

    function programar() {
      clearInterval(temporizador);
      if (!pausado && !pausaUsuario && estrellas.length > 1) temporizador = setInterval(function () { if (!document.hidden) siguiente(1); }, 5200);
    }

    if (estrellas.length > 1) {
      estrellas.forEach(function (p, n) {
        var b = el('button', { class: 'hero__punto', type: 'button', 'aria-label': 'Ver ' + p.nombre });
        b.addEventListener('click', function () { mostrar(n); programar(); });
        controles.appendChild(b);
        puntos.push(b);
      });
      if (!quieto) {
        var pausa = el('button', { class: 'hero__pausa', type: 'button', 'aria-label': 'Pausar carrusel', texto: '❚❚' });
        pausa.addEventListener('click', function () {
          pausaUsuario = !pausaUsuario;
          pausa.textContent = pausaUsuario ? '▶' : '❚❚';
          pausa.setAttribute('aria-label', pausaUsuario ? 'Reanudar carrusel' : 'Pausar carrusel');
          programar();
        });
        controles.appendChild(pausa);
      }

      // Deslizar con el dedo sobre la botella
      var escena = document.getElementById('hero-escena'), x0 = null;
      escena.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
      escena.addEventListener('pointerup', function (e) {
        if (x0 === null) return;
        var dx = e.clientX - x0; x0 = null;
        if (Math.abs(dx) > 45) { siguiente(dx < 0 ? 1 : -1); programar(); }
      });
      // Pausa mientras el usuario lee o usa el teclado dentro de la portada
      document.getElementById('hero-texto').addEventListener('pointerenter', function () { pausado = true; programar(); });
      document.getElementById('hero-texto').addEventListener('pointerleave', function () { pausado = quieto; programar(); });
      hero.addEventListener('focusin', function () { pausado = true; programar(); });
      hero.addEventListener('focusout', function () { pausado = quieto; programar(); });
    }

    mostrar(0);
    programar();

    // Inclinación de la botella siguiendo el mouse
    if (conMouse && !quieto) {
      var capa = cont;
      hero.addEventListener('pointermove', function (e) {
        var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
        capa.style.setProperty('--px', (x * 18).toFixed(2) + 'deg');
        capa.style.setProperty('--py', (-y * 12).toFixed(2) + 'deg');
      });
    }
  }

  // ==========================================================================
  // 2. ESTRELLAS: franjas grandes por producto
  // ==========================================================================
  function pintarEstrellas(estrellas) {
    var cont = document.getElementById('lista-estrellas');
    if (!estrellas.length) { document.getElementById('estrellas').hidden = true; return; }

    estrellas.forEach(function (p, n) {
      var inversa = n % 2 === 1;
      var img = el('img', { src: p.imagenes[0] || '', alt: p.nombre + ' ' + p.presentacion, loading: 'lazy', decoding: 'async' });
      var verCerca = function () { abrirVisor(p, img); };
      var estilo = colores(p);
      estilo['--lado'] = inversa ? '70%' : '30%';

      cont.appendChild(el('article', { class: 'banda' + (inversa ? ' banda--inversa' : ''), estilo: estilo, 'aria-label': p.nombre }, [
        el('div', { class: 'banda__cinta', 'aria-hidden': 'true', texto: (p.palabra + ' • ').repeat(4) }),
        el('div', { class: 'contenedor banda__fila' }, [
          el('div', { class: 'banda__foto' }, [
            el('div', { class: 'banda__anillo', 'aria-hidden': 'true' }),
            img,
            el('button', { type: 'button', 'aria-label': 'Ver de cerca: ' + p.nombre, onclick: verCerca })
          ]),
          el('div', { class: 'banda__info' }, [
            etiquetas(p),
            el('h3', { texto: p.nombre }),
            p.descripcion ? el('p', { texto: p.descripcion }) : null,
            chips(p),
            bloquePrecio(p, 'banda__precio'),
            el('div', { class: 'banda__botones' }, [
              botonPedir(p),
              el('button', { class: 'boton boton--borde', type: 'button', texto: 'Ver de cerca', onclick: verCerca })
            ])
          ])
        ])
      ]));
    });
  }

  // ==========================================================================
  // 3. CATÁLOGO con pestañas, buscador y filtro animado
  // ==========================================================================
  function pintarCatalogo(productos) {
    var rejilla = document.getElementById('rejilla');
    var pestanas = document.getElementById('pestanas');
    var buscador = document.getElementById('buscador');
    var buscar = document.getElementById('buscar');
    var vacio = document.getElementById('vacio');
    var categoria = 'Todos';
    var tarjetas = {};

    if (productos.length < 4) rejilla.classList.add('pocos');

    productos.forEach(function (p) {
      var img = p.imagenes[0] ? el('img', { src: p.imagenes[0], alt: p.nombre + ' ' + p.presentacion, loading: 'lazy', decoding: 'async' }) : null;
      var t = el('article', { class: 'tarjeta' + (p.agotado ? ' tarjeta--agotado' : ''), 'data-id': p.id, estilo: colores(p) }, [
        el('div', { class: 'tarjeta__cuerpo' }, [
          el('div', { class: 'tarjeta__etiquetas' }, [etiquetas(p)]),
          el('button', { class: 'tarjeta__foto', type: 'button', 'data-palabra': p.palabra, 'aria-label': 'Ver de cerca: ' + p.nombre, onclick: function () { abrirVisor(p, img); } }, [img]),
          el('div', { class: 'tarjeta__info' }, [
            el('h3', { texto: p.nombre }),
            p.presentacion ? el('p', { class: 'tarjeta__presentacion', texto: p.presentacion }) : null,
            p.descripcion ? el('p', { class: 'tarjeta__descripcion', texto: p.descripcion }) : null,
            el('div', { class: 'tarjeta__pie' }, [
              el('div', { class: 'precio' }, [
                p.precioAnterior ? el('s', { texto: C.soles(p.precioAnterior) }) : null,
                el('strong', { texto: C.soles(p.precio) })
              ]),
              botonPedir(p)
            ])
          ])
        ])
      ]);
      if (conMouse && !quieto) inclinacion3D(t);
      tarjetas[p.id] = t;
      rejilla.appendChild(t);
    });

    // Pestañas: solo si hay más de una categoría
    var cats = C.categorias(productos);
    if (cats.length > 1) {
      ['Todos'].concat(cats).forEach(function (cat) {
        var b = el('button', { class: 'pestana', type: 'button', role: 'tab', 'aria-selected': String(cat === 'Todos'), texto: cat });
        b.addEventListener('click', function () {
          categoria = cat;
          pestanas.querySelectorAll('.pestana').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
          filtrar();
        });
        pestanas.appendChild(b);
      });
    }
    // Buscador: aparece solo cuando hay 6 productos o más
    if (productos.length >= 6) {
      buscador.hidden = false;
      var espera;
      buscar.addEventListener('input', function () { clearTimeout(espera); espera = setTimeout(filtrar, 180); });
    }

    function filtrar() {
      var ids = {};
      C.filtrar(productos, categoria, buscar.value).forEach(function (p) { ids[p.id] = true; });
      var todas = productos.map(function (p) { return tarjetas[p.id]; });
      var antes = new Map();
      todas.forEach(function (t) { if (!t.hidden) antes.set(t, t.getBoundingClientRect()); });

      var base = rejilla.getBoundingClientRect();
      var salen = [];
      todas.forEach(function (t) {
        var mostrar = !!ids[t.getAttribute('data-id')];
        if (!mostrar && !t.hidden) salen.push(t);
        t.hidden = !mostrar;
      });
      vacio.hidden = Object.keys(ids).length > 0;
      if (quieto || !Element.prototype.animate) return;

      // Animación FLIP: las que se quedan se deslizan a su nuevo lugar
      todas.forEach(function (t) {
        if (t.hidden) return;
        var r = t.getBoundingClientRect(), a = antes.get(t);
        if (a) {
          var dx = a.left - r.left, dy = a.top - r.top;
          if (dx || dy) t.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 550, easing: 'cubic-bezier(.22,1,.36,1)' });
        } else {
          t.classList.add('visible');
          t.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 500, easing: 'cubic-bezier(.2,.9,.25,1.2)' });
        }
      });
      // Las que salen: una copia se encoge y desaparece en su posición anterior
      salen.forEach(function (t) {
        var a = antes.get(t);
        var copia = t.cloneNode(true);
        copia.hidden = false;
        copia.setAttribute('aria-hidden', 'true');
        copia.style.cssText += ';position:absolute;margin:0;pointer-events:none;left:' + (a.left - base.left) + 'px;top:' + (a.top - base.top) + 'px;width:' + a.width + 'px;height:' + a.height + 'px';
        rejilla.appendChild(copia);
        copia.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(.5) rotate(-6deg)', opacity: 0 }], { duration: 380, easing: 'ease-in', fill: 'forwards' })
          .onfinish = function () { copia.remove(); };
      });
    }
  }

  function inclinacion3D(t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      t.classList.add('inclinando');
      t.style.setProperty('--ry', ((x - 0.5) * 16).toFixed(2) + 'deg');
      t.style.setProperty('--rx', ((0.5 - y) * 12).toFixed(2) + 'deg');
      t.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      t.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    t.addEventListener('pointerleave', function () {
      t.classList.remove('inclinando');
      t.style.setProperty('--rx', '0deg');
      t.style.setProperty('--ry', '0deg');
    });
  }

  // ==========================================================================
  // Vista ampliada (la foto «vuela» desde donde se tocó)
  // ==========================================================================
  var visor = document.getElementById('visor');
  var visorCaja = document.getElementById('visor-caja');
  var pista = document.getElementById('visor-pista');
  var visorPuntos = document.getElementById('visor-puntos');
  var ultimoFoco = null;

  function abrirVisor(p, origen) {
    ultimoFoco = document.activeElement;
    Object.keys(colores(p)).forEach(function (k) { visorCaja.style.setProperty(k, colores(p)[k]); });

    pista.textContent = '';
    visorPuntos.textContent = '';
    p.imagenes.forEach(function (src, n) {
      var foto = el('div', { class: 'visor__foto' }, [el('img', { src: src, alt: p.nombre + (p.imagenes.length > 1 ? ' — foto ' + (n + 1) : '') })]);
      foto.addEventListener('click', function (e) { alternarZoom(foto, e); });
      foto.addEventListener('pointermove', function (e) { if (foto.classList.contains('zoom')) moverZoom(foto, e); });
      pista.appendChild(foto);
      visorPuntos.appendChild(el('i', { class: n === 0 ? 'actual' : null }));
    });
    var varias = p.imagenes.length > 1;
    document.getElementById('visor-ant').hidden = !varias;
    document.getElementById('visor-sig').hidden = !varias;
    visorPuntos.hidden = !varias;

    var info = document.getElementById('visor-info');
    info.textContent = '';
    [etiquetas(p), el('h3', { id: 'visor-nombre', texto: p.nombre }),
      p.descripcion ? el('p', { texto: p.descripcion }) : null,
      chips(p), bloquePrecio(p, 'banda__precio'), el('div', {}, [botonPedir(p)])
    ].forEach(function (n) { if (n) info.appendChild(n); });

    visor.hidden = false;
    visor.classList.remove('cerrando');
    document.body.classList.add('sin-scroll');
    pista.scrollLeft = 0;
    document.getElementById('visor-cerrar').focus({ preventScroll: true });

    // FLIP: la foto parte del tamaño y lugar de la original
    var destino = pista.querySelector('img');
    if (quieto || !origen || !destino || !Element.prototype.animate) return;
    var desde = origen.getBoundingClientRect();
    var correr = function () {
      var caja = destino.getBoundingClientRect();
      if (!caja.height || !desde.height || !destino.naturalHeight) return;
      // Zona real de la foto dentro de la caja (object-fit: contain la centra)
      var prop = destino.naturalWidth / destino.naturalHeight;
      var ch = Math.min(caja.height, caja.width / prop), cw = ch * prop;
      var cx = (caja.width - cw) / 2, cy = (caja.height - ch) / 2;
      var s = desde.height / ch;
      var tx = desde.left - caja.left - cx * s, ty = desde.top - caja.top - cy * s;
      destino.animate([
        { transformOrigin: '0 0', transform: 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')' },
        { transformOrigin: '0 0', transform: 'none' }
      ], { duration: 700, easing: 'cubic-bezier(.22,1,.36,1)' });
      visorCaja.animate([{ backgroundColor: 'rgba(0,0,0,0)', boxShadow: 'none' }, {}], { duration: 450, easing: 'ease-out' });
    };
    if (destino.complete) correr(); else destino.addEventListener('load', correr, { once: true });
  }

  function cerrarVisor() {
    if (visor.hidden) return;
    visor.classList.add('cerrando');
    setTimeout(function () {
      visor.hidden = true;
      visor.classList.remove('cerrando');
      document.body.classList.remove('sin-scroll');
      if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus({ preventScroll: true });
    }, quieto ? 0 : 260);
  }

  function alternarZoom(foto, e) {
    var activo = foto.classList.toggle('zoom');
    if (activo) moverZoom(foto, e);
  }
  function moverZoom(foto, e) {
    var r = foto.getBoundingClientRect();
    foto.querySelector('img').style.transformOrigin = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '% ' + ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%';
  }

  function configurarVisor() {
    visor.addEventListener('click', function (e) { if (e.target.closest('[data-cerrar]')) cerrarVisor(); });
    document.getElementById('visor-ant').addEventListener('click', function () { pista.scrollBy({ left: -pista.clientWidth, behavior: 'smooth' }); });
    document.getElementById('visor-sig').addEventListener('click', function () { pista.scrollBy({ left: pista.clientWidth, behavior: 'smooth' }); });
    pista.addEventListener('scroll', function () {
      var n = Math.round(pista.scrollLeft / Math.max(1, pista.clientWidth));
      visorPuntos.querySelectorAll('i').forEach(function (p, k) { p.classList.toggle('actual', k === n); });
    }, { passive: true });
    document.addEventListener('keydown', function (e) {
      if (visor.hidden) return;
      if (e.key === 'Escape') cerrarVisor();
      if (e.key === 'Tab') { // mantiene el foco dentro de la ventana
        var f = visorCaja.querySelectorAll('button:not([hidden]), a[href]');
        var primero = f[0], ultimo = f[f.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      }
    });
  }

  // ==========================================================================
  // PROMOCIÓN (por ejemplo: 3 botellas + libreta gratis)
  // ==========================================================================
  function pintarPromo(promo, productos) {
    if (!promo || !promo.titulo) return;
    var seccion = document.getElementById('promo');
    var fotos = document.getElementById('promo-fotos');
    var regalo = productos.filter(function (p) { return C.sinTildes(p.nombre) === C.sinTildes(promo.regalo); })[0];
    var botellas = productos.filter(function (p) { return p !== regalo && p.categoria === 'Bebidas' && p.imagenes.length; }).slice(0, 3);

    botellas.forEach(function (p) {
      fotos.appendChild(el('img', { class: 'promo__botella', src: p.imagenes[0], alt: '', loading: 'lazy', decoding: 'async' }));
    });
    if (regalo && regalo.imagenes.length) {
      fotos.appendChild(el('span', { class: 'promo__mas', texto: '+' }));
      fotos.appendChild(el('div', { class: 'promo__regalo' }, [
        el('img', { src: regalo.imagenes[0], alt: '', loading: 'lazy', decoding: 'async' }),
        el('span', { class: 'promo__gratis', texto: 'GRATIS' })
      ]));
    }
    var etiqueta = document.getElementById('promo-etiqueta');
    etiqueta.textContent = promo.etiqueta || 'Promo';
    document.getElementById('promo-titulo').textContent = promo.titulo;
    document.getElementById('promo-texto').textContent = promo.texto || '';
    var boton = document.getElementById('promo-boton');
    var mensaje = promo.mensaje || promo.titulo;
    boton.textContent = promo.boton || 'Lo quiero';
    boton.href = C.enlaceWhatsApp(contacto.whatsapp, mensaje);
    boton.setAttribute('data-chat', mensaje);
    seccion.hidden = false;
  }

  // ==========================================================================
  // 4. NOSOTROS
  // ==========================================================================
  function pintarNosotros(n) {
    var cifras = document.getElementById('cifras');
    (n.cifras || []).forEach(function (c) {
      var valor = Number(c.valor) || 0;
      var num = el('strong', { 'data-valor': valor, 'data-sufijo': c.sufijo || '', texto: (quieto ? valor : 0) + (c.sufijo || '') });
      cifras.appendChild(el('div', { class: 'cifra' }, [num, el('span', { texto: c.texto || '' })]));
    });
    var ventajas = document.getElementById('ventajas');
    (n.ventajas || []).forEach(function (v) {
      ventajas.appendChild(el('div', { class: 'ventaja' }, [
        el('span', { class: 'ventaja__icono', 'aria-hidden': 'true', texto: v.icono || '' }),
        el('h3', { texto: v.titulo }),
        el('p', { texto: v.texto })
      ]));
    });
    var testimonios = document.getElementById('testimonios');
    (n.testimonios || []).forEach(function (t) {
      var e = Math.max(0, Math.min(5, Number(t.estrellas) || 5));
      testimonios.appendChild(el('figure', { class: 'testimonio revelar' }, [
        el('div', { class: 'testimonio__estrellas', 'aria-label': e + ' de 5 estrellas', texto: '★'.repeat(e) + '☆'.repeat(5 - e) }),
        el('blockquote', { texto: '“' + t.texto + '”' }),
        el('figcaption', { texto: t.nombre + (t.lugar ? ' · ' + t.lugar : '') })
      ]));
    });
  }

  function contar(strong) {
    var fin = Number(strong.getAttribute('data-valor')), suf = strong.getAttribute('data-sufijo'), t0 = null;
    if (quieto || !fin) { strong.textContent = fin + suf; return; }
    function paso(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / 1400);
      strong.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3))) + suf;
      if (k < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  // ==========================================================================
  // 5. CONTACTO
  // ==========================================================================
  function pintarContacto() {
    var c = contacto;
    var canales = document.getElementById('canales');
    var redes = cfg.redes || {};
    [
      c.whatsapp && { icono: '💬', titulo: 'WhatsApp', texto: 'Respuesta rápida', href: C.enlaceWhatsApp(c.whatsapp, c.mensajeWhatsapp), clase: ' canal--whatsapp', chat: '' },
      c.telefono && { icono: '📞', titulo: 'Llámanos', texto: c.telefono, href: C.enlaceTelefono(c.telefono) },
      c.correo && { icono: '✉️', titulo: 'Correo', texto: c.correo, href: 'mailto:' + c.correo },
      redes.instagram && { icono: '📸', titulo: 'Instagram', texto: 'Síguenos', href: redes.instagram },
      redes.facebook && { icono: '👍', titulo: 'Facebook', texto: 'Síguenos', href: redes.facebook },
      redes.tiktok && { icono: '🎵', titulo: 'TikTok', texto: 'Síguenos', href: redes.tiktok }
    ].filter(Boolean).forEach(function (k) {
      var externo = k.href.indexOf('http') === 0;
      canales.appendChild(el('a', { class: 'canal revelar' + (k.clase || ''), href: k.href, target: externo ? '_blank' : null, rel: externo ? 'noopener' : null, 'data-chat': k.chat }, [
        el('span', { class: 'canal__icono', 'aria-hidden': 'true', texto: k.icono }),
        el('strong', { texto: k.titulo }),
        el('span', { texto: k.texto })
      ]));
    });

    var lista = document.getElementById('datos-contacto');
    [['📍', c.direccion], ['🕒', c.horario]].forEach(function (f) {
      if (f[1]) lista.appendChild(el('li', {}, [el('span', { 'aria-hidden': 'true', texto: f[0] }), el('span', { texto: f[1] })]));
    });

    if (c.mapa) {
      var mapa = document.getElementById('mapa');
      mapa.hidden = false;
      mapa.appendChild(el('iframe', { src: 'https://maps.google.com/maps?q=' + encodeURIComponent(c.mapa) + '&z=15&output=embed', title: 'Mapa: ' + c.mapa, loading: 'lazy', referrerpolicy: 'no-referrer-when-downgrade' }));
    }
  }

  // ==========================================================================
  // 6. CHAT DE WHATSAPP dentro de la página
  //    El cliente escribe aquí sin salir de la web; al tocar «Enviar» se abre
  //    WhatsApp en otra pestaña (o la app en el celular) con el mensaje listo,
  //    y esta página queda abierta.
  // ==========================================================================
  function configurarChat() {
    var c = contacto;
    var chat = document.getElementById('chat');
    var boton = document.getElementById('chat-boton');
    if (!c.whatsapp) return;
    var conf = c.chat || {};
    var mensajes = document.getElementById('chat-mensajes');
    var rapidas = document.getElementById('chat-rapidas');
    var form = document.getElementById('chat-form');
    var texto = document.getElementById('chat-texto');
    var aviso = document.getElementById('chat-aviso');
    var saludado = false, ultimoFoco = null;

    document.getElementById('chat-titulo').textContent = conf.titulo || cfg.negocio.nombre;
    document.getElementById('chat-estado').textContent = conf.estado || 'En línea';
    boton.hidden = false;

    function hora() { return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }); }
    function bajar() { mensajes.scrollTop = mensajes.scrollHeight; }

    function burbuja(quien, contenido) {
      var b = el('div', { class: 'burbuja burbuja--' + quien }, [contenido, el('span', { class: 'burbuja__hora', texto: hora() })]);
      mensajes.appendChild(b);
      bajar();
      return b;
    }

    // Respuesta de la tienda, con los puntitos de «escribiendo…»
    function responder(contenido, espera) {
      if (quieto) { burbuja('ellos', contenido); return; }
      var puntos = el('div', { class: 'escribiendo', 'aria-label': 'Escribiendo' }, [el('i'), el('i'), el('i')]);
      mensajes.appendChild(puntos);
      bajar();
      setTimeout(function () { puntos.remove(); burbuja('ellos', contenido); }, espera || 900);
    }

    function ajustarAlto() {
      texto.style.height = 'auto';
      texto.style.height = Math.min(texto.scrollHeight, 120) + 'px';
    }

    (conf.respuestasRapidas || []).forEach(function (r) {
      rapidas.appendChild(el('button', { type: 'button', texto: r, onclick: function () {
        texto.value = texto.value.trim() ? texto.value.trim() + '\n' + r : r;
        ajustarAlto();
        texto.focus();
      } }));
    });
    rapidas.hidden = !rapidas.children.length;

    function abrir(mensaje) {
      if (!visor.hidden) cerrarVisor();
      if (chat.hidden) ultimoFoco = document.activeElement;
      chat.hidden = false;
      chat.classList.remove('cerrando');
      boton.setAttribute('aria-expanded', 'true');
      boton.setAttribute('aria-label', 'Cerrar chat de WhatsApp');
      aviso.hidden = true;
      if (!saludado) {
        saludado = true;
        responder(conf.saludo || c.mensajeWhatsapp || '¡Hola! ¿En qué te ayudamos?', 600);
      }
      if (mensaje) texto.value = mensaje;
      ajustarAlto();
      bajar();
      setTimeout(function () { texto.focus({ preventScroll: true }); }, 50);
    }

    function cerrar() {
      if (chat.hidden) return;
      boton.setAttribute('aria-expanded', 'false');
      boton.setAttribute('aria-label', 'Abrir chat de WhatsApp');
      chat.classList.add('cerrando');
      setTimeout(function () {
        chat.hidden = true;
        chat.classList.remove('cerrando');
        if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus({ preventScroll: true });
      }, quieto ? 0 : 200);
    }

    boton.addEventListener('click', function () { if (chat.hidden) abrir(); else cerrar(); });
    document.getElementById('chat-cerrar').addEventListener('click', cerrar);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !chat.hidden) cerrar(); });
    texto.addEventListener('input', ajustarAlto);
    // En computadora, Enter envía y Shift+Enter hace un salto de línea
    texto.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && conMouse) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true })); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = texto.value.trim();
      if (!msg) { texto.focus(); return; }
      var enlace = C.enlaceWhatsApp(c.whatsapp, msg);
      window.open(enlace, '_blank', 'noopener');
      burbuja('yo', msg);
      texto.value = '';
      ajustarAlto();
      responder(el('span', {}, [
        '¡Listo! Abrimos WhatsApp con tu mensaje para que lo envíes y te respondemos al toque. Si no se abrió, ',
        el('a', { href: enlace, target: '_blank', rel: 'noopener', texto: 'toca aquí' }), '.'
      ]));
    });

    // Todos los botones «Lo quiero» y el de WhatsApp abren este chat con el mensaje ya escrito
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-chat]');
      if (!a || a.getAttribute('aria-disabled') === 'true' || e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      abrir(a.getAttribute('data-chat') || '');
    });
  }

  function configurarFormulario() {
    var form = document.getElementById('formulario');
    var estado = document.getElementById('formulario-estado');
    var boton = form.querySelector('button[type="submit"]');
    var id = String(contacto.formspreeId || '').trim();
    var listo = id && id !== 'TU_ID_DE_FORMSPREE';
    form.action = 'https://formspree.io/f/' + id;

    function mostrar(msg, tipo) { estado.textContent = msg; estado.className = 'formulario__estado ' + (tipo || ''); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { mostrar('Por favor completa tu nombre, celular y mensaje.', 'error'); form.reportValidity(); return; }
      if (!listo) { mostrar('El formulario aún no está activo. Escríbenos por WhatsApp, por favor.', 'error'); return; }
      boton.disabled = true;
      mostrar('Enviando…');
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); form.reset(); mostrar('¡Gracias! Recibimos tu mensaje y te responderemos pronto.', 'ok'); })
        .catch(function () { mostrar('No se pudo enviar. Revisa tu conexión o escríbenos por WhatsApp.', 'error'); })
        .finally(function () { boton.disabled = false; });
    });
  }

  function pintarPie() {
    document.getElementById('pie-texto').textContent = '© ' + new Date().getFullYear() + ' ' + cfg.negocio.nombre + ' · Lima, Perú';
    var redes = document.getElementById('redes');
    var nombres = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok' };
    Object.keys(cfg.redes || {}).forEach(function (k) {
      if (cfg.redes[k]) redes.appendChild(el('a', { href: cfg.redes[k], target: '_blank', rel: 'noopener', texto: nombres[k] || k }));
    });
  }

  // ==========================================================================
  // Menú, scroll y apariciones
  // ==========================================================================
  function configurarMenu() {
    var boton = document.getElementById('menu-boton');
    var menu = document.getElementById('menu');
    function alternar(abrir) {
      menu.classList.toggle('abierto', abrir);
      boton.setAttribute('aria-expanded', String(abrir));
      boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    }
    boton.addEventListener('click', function () { alternar(!menu.classList.contains('abierto')); });
    menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') alternar(false); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.cabecera')) alternar(false); });

    // Resalta en el menú la sección que se está viendo
    if ('IntersectionObserver' in window) {
      var enlaces = menu.querySelectorAll('a');
      var io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting) enlaces.forEach(function (a) { a.classList.toggle('activo', a.getAttribute('href') === '#' + en.target.id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      document.querySelectorAll('main > section').forEach(function (s) { io.observe(s); });
    }
  }

  function configurarScroll() {
    var cabecera = document.getElementById('cabecera');
    var palabra = document.getElementById('hero-palabra');
    var escena = document.getElementById('hero-escena');
    var texto = document.getElementById('hero-texto');
    var bandas = Array.prototype.slice.call(document.querySelectorAll('.banda'));
    var pendiente = false;

    function actualizar() {
      pendiente = false;
      var y = window.scrollY, h = window.innerHeight;
      cabecera.classList.toggle('solida', y > 40);
      if (quieto) return;
      if (y < h * 1.2) { // parallax de la portada por capas
        palabra.style.setProperty('--dx', (-y * 0.5).toFixed(1) + 'px');
        escena.style.setProperty('--sy', (y * 0.22).toFixed(1) + 'px');
        escena.style.setProperty('--sr', (y * 0.015).toFixed(2) + 'deg');
        texto.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
        texto.style.opacity = Math.max(0, 1 - y / (h * 0.85)).toFixed(3);
      }
      bandas.forEach(function (b) { // botella que gira y cinta que se desliza según el scroll
        var r = b.getBoundingClientRect();
        if (r.bottom < 0 || r.top > h) return;
        var p = Math.min(1, Math.max(0, (h - r.top) / (h + r.height)));
        b.style.setProperty('--p', p.toFixed(3));
      });
    }
    window.addEventListener('scroll', function () { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } }, { passive: true });
    window.addEventListener('resize', actualizar);
    actualizar();
  }

  function configurarApariciones() {
    var objetivos = document.querySelectorAll('.revelar, .banda, .tarjeta, .cifra, .ventaja');
    if (quieto || !('IntersectionObserver' in window)) {
      objetivos.forEach(function (n) { n.classList.add('visible'); });
      document.querySelectorAll('.cifra strong').forEach(contar);
      return;
    }
    var io = new IntersectionObserver(function (entradas) {
      var retraso = 0;
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        var n = en.target;
        io.unobserve(n);
        setTimeout(function () {
          n.classList.add('visible');
          var s = n.classList.contains('cifra') && n.querySelector('strong');
          if (s) contar(s);
        }, retraso);
        retraso += 110; // las que entran juntas aparecen una tras otra
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    objetivos.forEach(function (n) { io.observe(n); });
  }

  // ==========================================================================
  function avisar(texto, clase) {
    var aviso = el('p', { class: 'aviso ' + (clase || ''), role: 'alert', texto: texto });
    var cat = document.querySelector('#catalogo .contenedor');
    cat.insertBefore(aviso, cat.firstChild);
  }

  function iniciar(datos) {
    cfg = datos;
    cfg.negocio = cfg.negocio || { nombre: 'PROP' };
    contacto = cfg.contacto || {};

    var r = C.prepararProductos(cfg.productos);
    if (r.errores.length) {
      console.warn('Revisa config.json:\n- ' + r.errores.join('\n- '));
      avisar('Revisa config.json: ' + r.errores.join(' · '), 'aviso--suave');
    }
    var estrellas = C.estrellas(r.productos);

    pintarTextos();
    pintarHero(estrellas);
    pintarEstrellas(estrellas);
    pintarPromo(cfg.promocion, r.productos);
    pintarCatalogo(r.productos);
    pintarNosotros(cfg.nosotros || {});
    pintarContacto();
    configurarChat();
    configurarFormulario();
    pintarPie();
    configurarVisor();
    configurarMenu();
    configurarScroll();
    configurarApariciones();
  }

  fetch('config.json', { credentials: 'same-origin' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(iniciar)
    .catch(function (err) {
      console.error('No se pudo cargar la página:', err);
      document.getElementById('contenido').prepend(el('p', { class: 'aviso', texto: 'No se pudo cargar la información de la página (config.json). Si abriste el archivo con doble clic, usa un servidor local: revisa el README. Si editaste config.json, revisa que no falte ni sobre una coma.' }));
    });
})();
