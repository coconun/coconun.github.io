# Manual de uso: tu página web PROP

Este manual explica cómo funciona tu web y cómo cambiar precios o agregar productos tú mismo, sin programar.

---

## 1. Qué hace tu web

- **Portada:** muestra tus productos estrella (hoy, la chicha morada y la limonada) en un carrusel animado.
  Cada 5 segundos cambia de botella y el fondo toma el color del producto.
- **Nuestras estrellas:** una sección grande para cada producto estrella, con descripción, precio y botón para pedir.
- **Catálogo y precios:** todos tus productos en tarjetas. Al tocar la foto se abre una vista ampliada con zoom.
- **Botón «Lo quiero»:** abre WhatsApp con un mensaje ya escrito, por ejemplo:
  *«Hola PROP, quiero Chicha morada (Botella 320 ml) a S/ 3.50. ¿Está disponible?»*.
  Así sabes al toque qué producto le interesa al cliente.
- **Contacto:** botón de WhatsApp, botón para llamar, formulario que llega a tu correo, redes sociales y horario.
- **Botón verde flotante** de WhatsApp, siempre visible.

Los pedidos y pagos (Yape, Plin, efectivo) se coordinan por WhatsApp. La web no cobra en línea.

---

## 2. Dónde se cambia todo: el archivo `config.json`

Todo el contenido de la web está en un solo archivo: **`config.json`**. Ábrelo con el Bloc de notas o con VS Code.

**Reglas de oro al editar:**

1. Cambia solo el texto **entre comillas, a la derecha de los dos puntos**.
2. **No borres** comillas `"`, comas `,`, llaves `{ }` ni corchetes `[ ]`.
3. Los **precios van sin comillas** y con **punto** decimal: `3.5` ✅ — `"3.50"` ❌ — `3,50` ❌
4. Después de guardar, revisa la web. Si sale un aviso rojo o amarillo, lee el paso 7.

---

## 3. Cambiar un precio

Busca el producto en `config.json` y cambia el número después de `"precio":`.

```json
"precio": 4,
```

La web lo mostrará como **S/ 4.00**, también en el mensaje de WhatsApp.

**Para poner una oferta**, agrega el precio anterior. Aparecerá tachado y con la etiqueta roja «Oferta»:

```json
"precio": 3,
"precioAnterior": 3.5,
```

Para quitar la oferta, borra esa línea `"precioAnterior"` completa.

**Si un producto se agota**, agrega `"agotado": true,`. Se verá en gris, con la etiqueta «Agotado»,
y no se podrá pedir. Cuando vuelva a haber, borra esa línea.

---

## 4. Agregar un producto nuevo (bebida o accesorio)

### Paso 1: prepara la foto

- Lo ideal es una foto del producto **con fondo transparente**, como las de las botellas.
  Para quitarle el fondo puedes usar https://www.remove.bg (gratis).
- Guárdala en formato **PNG o WebP**, de **unos 1100 px de alto** como máximo.
  Para reducir su peso usa https://squoosh.app (que pese menos de 150 KB).
- Ponle un nombre simple, **sin espacios ni tildes**, por ejemplo `maracuya.webp` o `tomatodo.png`,
  y cópiala en la carpeta **`img/`**.

### Paso 2: copia un bloque en `config.json`

Dentro de `"productos": [ ... ]`, copia el bloque de la limonada completo, desde su `{` hasta su `}`.
Pégalo **después de él**, separado por una coma, y cambia los datos:

```json
    {
      "nombre": "Chicha morada",
      ...
    },
    {
      "nombre": "Limonada",
      ...
    },
    {
      "nombre": "Maracuyá",
      "categoria": "Bebidas",
      "presentacion": "Botella 320 ml",
      "precio": 3.5,
      "descripcion": "Refresco de maracuyá natural, dulce y ácido.",
      "detalles": ["Fruta natural", "Sin alcohol"],
      "imagenes": ["img/maracuya.webp"],
      "color": "#f2a900",
      "fondo": "#3a2600",
      "etiqueta": "Nuevo"
    }
  ],
```

> ⚠️ Entre un bloque y el siguiente va una coma `},`. **Después del último bloque no va coma.**

Guarda el archivo y listo: el producto aparece solo en el catálogo, con su precio y su botón de WhatsApp.

### Qué significa cada dato

| Dato | ¿Obligatorio? | Para qué sirve |
|---|---|---|
| `nombre` | **Sí** | Nombre del producto |
| `precio` | **Sí** | Precio en soles, sin comillas: `3.5` |
| `categoria` | Recomendado | Por ejemplo `"Bebidas"` o `"Accesorios"`. Con 2 categorías o más aparecen pestañas para filtrar |
| `presentacion` | No | `"Botella 320 ml"`, `"Pack x 6"`, `"600 ml"`… |
| `descripcion` | No | Una o dos frases |
| `detalles` | No | Etiquetitas que se ven en la ficha: `["Sin alcohol", "Natural"]` |
| `imagenes` | Recomendado | Una o varias fotos: `["img/foto1.webp", "img/foto2.webp"]`. Con varias, se pueden deslizar en la vista ampliada |
| `color` | No | Color del producto para el fondo de su tarjeta (formato `#rrggbb`). Elige uno en https://htmlcolorcodes.com/es/ |
| `fondo` | No | Color oscuro para su franja y la portada. Debe ser oscuro para que el texto blanco se lea |
| `palabra` | No | La palabra gigante que se ve detrás de la botella. Si no la pones, usa la primera palabra del nombre |
| `etiqueta` | No | Una etiqueta verde: `"Nuevo"`, `"Favorita"`, `"Más vendido"`… |
| `precioAnterior` | No | Precio de antes, para mostrar oferta |
| `agotado` | No | `true` si no hay stock |
| `estrella` | No | `true` para que salga en la portada y en «Nuestras estrellas». Si no la pones, solo sale en el catálogo |

**Ejemplo de accesorio** (lo mínimo):

```json
    {
      "nombre": "Tomatodo PROP",
      "categoria": "Accesorios",
      "precio": 15,
      "imagenes": ["img/tomatodo.webp"]
    }
```

**Para quitar un producto**, borra su bloque `{ ... }` completo y revisa que no quede una coma suelta al final.

**Para cambiar el orden**, mueve los bloques: la web los muestra en el mismo orden que en el archivo.

> Cuando tengas 6 productos o más, aparecerá un **buscador** en el catálogo de forma automática.

---

## 5. Cambiar textos y datos de contacto

| En `config.json` | Qué cambia |
|---|---|
| `inicio` → `titulo`, `subtitulo` | Textos grandes de la portada (la última palabra del título sale en verde) |
| `estrellas`, `catalogo` | Títulos de esas secciones |
| `nosotros` → `texto` | Párrafo de «¿Por qué PROP?» |
| `nosotros` → `cifras` | Los números que se animan (`320 ml`, `0 %`, `2 sabores`). **Si agregas sabores, actualiza el número** |
| `nosotros` → `ventajas` | Las tres tarjetas con ícono (`icono` es un emoji) |
| `contacto` → `whatsapp` | Tu número **con 51 adelante, sin + ni espacios**: `"51997555990"` |
| `contacto` → `telefono` | Cómo se ve el teléfono: `"+51 997 555 990"` |
| `contacto` → `mensajeWhatsapp` | Mensaje que aparece al tocar el botón verde general |
| `contacto` → `mensajeProducto` | Mensaje del botón «Lo quiero». Puedes usar `{producto}`, `{presentacion}`, `{precio}` y `{negocio}` |
| `contacto` → `correo`, `horario`, `direccion` | Se muestran en Contacto. Si dejas `""`, no aparecen |
| `contacto` → `mapa` | Dirección para el mapa de Google, p. ej. `"Av. Arequipa 1234, Lince, Lima, Perú"`. Con `""` no se muestra |
| `redes` | Links completos de Instagram, Facebook y TikTok. Con `""` no se muestran |

**Testimonios (opcional):** cuando tengas opiniones reales de clientes, agrégalas en `nosotros` → `testimonios`:

```json
"testimonios": [
  { "nombre": "Carla M.", "lugar": "Surco", "texto": "La chicha sabe a la de mi abuela.", "estrellas": 5 }
]
```

**Título en Google y al compartir el link:** se cambia en `index.html`, en las primeras líneas
(`<title>` y `description`). Cambia solo el texto entre comillas o entre `>` y `<`.

---

## 6. Activar el formulario de contacto (una sola vez, 5 minutos)

1. Crea una cuenta gratis en https://formspree.io con el **correo donde quieres recibir los mensajes**.
2. Haz clic en **+ New Form**, ponle un nombre y créalo.
3. Copia el código del final de la dirección `https://formspree.io/f/XXXXXXXX`.
4. Pégalo en `config.json` → `"formspreeId": "XXXXXXXX"`.
5. Envía un mensaje de prueba desde la web y confirma el correo de activación que te manda Formspree.

El plan gratis permite 50 mensajes al mes. Mientras no esté activado, el formulario le pide al visitante que escriba por WhatsApp.

---

## 7. Si algo sale mal

| Qué ves | Qué hacer |
|---|---|
| La página sale vacía o con un **aviso rojo** | Falta o sobra una coma, comilla o llave en `config.json`. Pega todo el contenido en https://jsonlint.com y te dirá en qué línea está el error |
| Un **aviso amarillo** «Revisa config.json» en el catálogo | Un producto tiene un dato mal escrito: el aviso dice cuál y qué falta (por ejemplo, un precio con comillas). Ese producto no se muestra hasta que lo corrijas |
| Un producto sale **sin foto** | El nombre del archivo en `imagenes` no coincide con el de la carpeta `img/`. Revisa mayúsculas, espacios y la extensión (`.webp`, `.png`, `.jpg`) |
| WhatsApp abre otro número | Revisa `contacto` → `whatsapp`: solo números, empezando con 51 |
| Cambié algo y no se ve | Recarga la página con **Ctrl + F5** (en el celular, cierra y vuelve a abrir el navegador) |

---

## 8. Publicar los cambios

Si tu web está en **Netlify**: entra a https://app.netlify.com, abre tu sitio, ve a **Deploys** y arrastra
la carpeta `web-prop` completa al recuadro. En un minuto los cambios están en línea.

**Antes de subir**, revisa en tu computadora (ver el README) que se vea bien y que el botón «Lo quiero»
del producto nuevo abra WhatsApp con el mensaje correcto.

---

## 9. Lo que la web no hace (según lo acordado)

No tiene carrito ni pagos en línea, panel de administración, control de stock, cálculo de delivery
ni boletas electrónicas. Si más adelante los necesitas, se pueden agregar como un trabajo adicional.
