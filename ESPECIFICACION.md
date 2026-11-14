# Especificación: web catálogo de bebidas y accesorios — PROP (Lima)

**Plantilla base:** `web-negocio` (HTML, CSS y JS puros; contenido en `config.json`).
**Objetivo:** una web llamativa, con mucho movimiento, que muestre los productos con su precio y lleve al cliente a escribir, llamar o dejar un mensaje a PROP en 1 o 2 toques desde el celular.

## Qué verá el visitante
1. **Portada animada:** foto o video corto del producto con efecto de profundidad (parallax), título que aparece letra por letra y botón «Ver catálogo».
2. **Catálogo con precios** en S/, separado por pestañas (**Bebidas** / **Accesorios** / más categorías si hacen falta), con buscador y filtro animado.
3. Cada producto tiene foto, nombre, descripción corta, precio (y precio anterior tachado si está en oferta), etiquetas como «Nuevo», «Oferta» o «Agotado», y un botón **«Lo quiero»** que abre WhatsApp con el producto ya escrito en el mensaje.
4. **Vista ampliada del producto:** al tocar la foto se abre una ventana con galería deslizable y zoom.
5. **Sección de destacados / promociones** en carrusel que avanza solo.
6. **Contacto:** WhatsApp, llamada directa, correo, formulario (llega al correo de PROP), redes sociales, horario y mapa del local o zona de despacho.

## Animaciones de las imágenes (todo con CSS y JS propio, sin librerías pesadas)
| Efecto | Dónde |
|---|---|
| Parallax por capas al hacer scroll | Portada |
| Aparición de fotos con «cortina» o máscara diagonal al entrar en pantalla | Catálogo y destacados |
| Inclinación 3D y brillo que sigue al dedo/mouse | Tarjetas de producto |
| Zoom lento tipo «Ken Burns» | Carrusel de destacados |
| Reacomodo animado de tarjetas al filtrar (las que salen se encogen, las que quedan se deslizan) | Catálogo |
| Transición de la foto pequeña a la ventana ampliada (la foto «vuela» y crece) | Vista de producto |
| Burbujas / partículas flotando en el fondo (solo en sección de bebidas, ligero) | Fondo |
| Contadores y textos que entran con rebote | Cifras y títulos |

**Cuidado de velocidad y accesibilidad:** fotos en WebP con carga diferida, animaciones solo con `transform`/`opacity` (no traban el celular), y si el usuario tiene activado «reducir movimiento» en su teléfono, las animaciones se suavizan o se apagan. Meta: **carga < 2 s en 4G**.

## Tareas
| # | Tarea | Resultado |
|---|---|---|
| 1 | Copiar la plantilla a `Productos/web-prop/` | Base lista |
| 2 | Secciones: Inicio, **Catálogo**, Destacados, Nosotros/Testimonios, Contacto | Menú de navegación nuevo |
| 3 | Catálogo configurable en `config.json` (categoría, nombre, precio, precio anterior, fotos, etiquetas, agotado) | PROP cambia precios sin tocar código |
| 4 | Pestañas por categoría + buscador + filtro animado | Encuentran el producto rápido |
| 5 | Botón «Lo quiero» por producto con mensaje de WhatsApp prellenado | Contacto directo con el producto claro |
| 6 | Vista ampliada con galería deslizable y zoom | Ven el producto en detalle |
| 7 | Carrusel de destacados/ofertas | Promociones visibles |
| 8 | Animaciones de imágenes de la tabla de arriba + modo «reducir movimiento» | Estilo dinámico sin sacrificar velocidad |
| 9 | Contacto: WhatsApp flotante, llamada, correo, formulario Formspree, redes, horario y mapa | Todas las formas de contacto |
| 10 | Aviso de venta solo a mayores de 18 años **si hay bebidas alcohólicas** (Ley 28681) | Cumple la norma |
| 11 | Diseño adaptado a celular, colores y logo de PROP, SEO básico y vista previa al compartir el link | Cumple estándares |
| 12 | Pruebas automáticas (filtro, buscador, mensaje de WhatsApp, precios) + revisión en celular y medición de velocidad | Calidad verificada |
| 13 | Manual de uso para el cliente en español | PROP actualiza su catálogo solo |

## Lo que NO incluye
- **Carrito de compras ni pagos en línea** (tarjeta, Niubiz, Culqi, Mercado Pago). La venta se cierra por WhatsApp/Yape/Plin. *(El carrito con total se puede agregar como extra, como en la web de Alka.)*
- **Panel de administración**, cuentas de usuario o inicio de sesión. El catálogo se edita en `config.json`.
- **Control de stock** automático, base de datos o historial de pedidos.
- **Animaciones 3D con modelos** (Three.js/WebGL), videos pesados de fondo o librerías de animación externas: chocan con la meta de 2 segundos.
- Cálculo de delivery por distrito o seguimiento del pedido.
- Integración con Rappi, PedidosYa, Mercado Libre, Instagram Shopping ni sistemas de caja.
- **Boletas o facturas electrónicas** (SUNAT) y Libro de Reclamaciones virtual (solo se coloca el enlace si ya lo tienen).
- Sesión de fotos, edición/recorte profesional de fotos, diseño de logo ni redacción publicitaria.
- Compra de dominio y hosting (se recomienda Netlify gratis; el dominio `.pe` lo paga el cliente).
- Versión en otros idiomas, cupones, puntos o blog.

## Lo que necesito del cliente
Lista de productos con precio, categoría y 1 a 4 fotos cada uno · logo y colores · **¿venden bebidas alcohólicas?** · número de WhatsApp y teléfono · correo para el formulario · dirección o zona de despacho · horario · redes sociales · 2 a 4 testimonios reales · productos a destacar u ofertas.
*Mientras no lleguen, uso datos y fotos de ejemplo claramente marcados para reemplazar.*
