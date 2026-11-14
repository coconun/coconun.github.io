# Web de PROP: bebidas y accesorios (Lima)

Web catálogo con precios, animaciones y contacto directo por WhatsApp, llamada y formulario.
Las estrellas de la página son la **chicha morada** y la **limonada** de 320 ml.
Está basada en la plantilla `web-negocio`.

- HTML, CSS y JavaScript puros, sin frameworks ni librerías. Pesa unos 175 KB **con** las fotos.
- **Todo el contenido está en `config.json`**: productos, precios, textos y contacto.
- Para agregar un producto nuevo basta con copiar un bloque en `config.json` y poner su foto en `img/`.
- No necesita servidor ni base de datos. Se puede publicar gratis en Netlify.

```
web-prop/
├── index.html          ← estructura, título para Google y vista previa al compartir
├── config.json         ← AQUÍ va todo lo de PROP
├── css/estilos.css     ← colores, diseño y animaciones
├── js/catalogo.js      ← lógica: precios, filtros, búsqueda y mensajes de WhatsApp
├── js/app.js           ← pantalla y animaciones
├── img/                ← fotos de las botellas (fondo transparente)
├── tests/              ← pruebas automáticas
├── ESPECIFICACION.md   ← alcance aprobado
└── MANUAL-DE-USO.md    ← manual para PROP
```

## Verla en tu computadora

Un doble clic en `index.html` no funciona, porque el navegador bloquea la lectura de `config.json`.
Abre una terminal dentro de esta carpeta y ejecuta:

```bash
python3 -m http.server 8000
```

Luego entra a http://localhost:8000.

## Pruebas

Se necesita Node.js 18 o una versión más reciente. Ejecuta esto dentro de la carpeta `web-prop`:

```bash
node --test
```

Las pruebas revisan que `config.json` esté bien escrito y que sus fotos existan, además de los precios en soles,
el filtro, el buscador y los mensajes y enlaces de WhatsApp.

## Animaciones

| Efecto | Dónde |
|---|---|
| Carrusel de estrellas: la botella sale girando, entra la siguiente y el fondo cambia al color del producto | Portada |
| Parallax por capas al hacer scroll, botella que sigue al mouse y título letra por letra | Portada |
| Burbujas flotando y brillo giratorio detrás de la botella | Portada |
| Botella que gira y palabra gigante que se desliza según el scroll; foto revelada en círculo | Estrellas |
| Fotos reveladas con máscara diagonal, inclinación 3D y brillo que sigue al mouse | Catálogo |
| Tarjetas que se reacomodan animadas al filtrar | Catálogo (con 2 categorías o más) |
| La foto «vuela» desde la tarjeta a la vista ampliada, con zoom al tocar | Vista ampliada |
| Contadores con rebote e íconos que saltan | Nosotros |

Todas usan solo `transform` y `opacity` para no trabar el celular. Si el teléfono tiene activado
**«reducir movimiento»**, se apagan. El carrusel tiene un botón de pausa.

**Medición** (celular simulado con 4G y procesador 4 veces más lento): primera pintura en unos 0.4 s
y la botella visible en menos de 0.8 s.

## Pendientes con el cliente (antes de publicar)

- [ ] **Confirmar los precios.** Ahora dice S/ 3.50 por botella (dato de ejemplo).
- [ ] Confirmar las descripciones e ingredientes de la chicha y la limonada.
- [ ] Correo para recibir los mensajes del formulario y **crear el formulario en Formspree** (ver el manual).
- [ ] Links de Instagram, Facebook y TikTok.
- [ ] Horario real y dirección o zona de despacho (para el mapa).
- [ ] Logo en archivo, si tienen uno distinto al texto «PROP».
- [ ] Testimonios reales (opcional; la sección no aparece mientras no haya).

El número de WhatsApp y de teléfono (+51 997 555 990) se tomó de la etiqueta de la botella.
