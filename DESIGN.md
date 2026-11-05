---
name: Final Acces
description: Interfaz minimalista y legible para un juego de plataformas 2D.
colors:
  canvas-dark: "#080E20"
  surface-dark: "#101827"
  surface-raised-dark: "#182333"
  ink-on-dark: "#F4F6F8"
  muted-on-dark: "#A8B2BE"
  border-dark: "#2B3746"
  canvas-light: "#F4F6F8"
  surface-light: "#FFFFFF"
  ink-on-light: "#17202A"
  muted-on-light: "#5B6673"
  border-light: "#DDE3E9"
  accent-cyan: "#62C9D5"
  accent-cyan-ink: "#267C87"
  ink-on-accent: "#07151A"
  accent-gold: "#D3B66E"
  accent-success: "#58B88D"
  accent-danger: "#D96E79"
  arcade-cyan: "#00D9FF"
  arcade-magenta: "#FF00D9"
  progress-violet: "#A255F8"
typography:
  display:
    fontFamily: "Goldman, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Goldman, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Press Start 2P, cursive"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "9999px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s6: "24px"
  s8: "32px"
  s12: "48px"
  s16: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent-cyan}"
    textColor: "{colors.ink-on-accent}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  button-secondary-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.ink-on-dark}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  button-secondary-light:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.ink-on-light}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Design System: Final Acces

## Overview

**Norte creativo: «Arcade tranquilo».**

Final Acces combina la claridad y sobriedad de una interfaz de producto con la personalidad de un juego de plataformas 2D. Los menús, formularios, pantallas de cuenta y salas deben sentirse tranquilos y directos; el mundo del juego, los sprites y las recompensas pueden conservar la energía arcade. Usa la claridad de las interfaces Apple como referencia de jerarquía y acabado, sin copiar sus componentes ni su identidad.

La interfaz debe hacer evidente la siguiente acción útil. Cada vista tiene una sola acción principal dominante. El texto de apoyo debe ser corto y funcional; conserva los términos en español y la identidad pixel art que ya usa el juego.

**Rasgos clave:**

- Superficies neutras y serenas con opciones oscuras y claras equilibradas.
- Cian refinado para la interacción; los tonos arcade intensos se reservan para el juego y énfasis puntuales.
- Jerarquía tipográfica marcada con texto de lectura cómodo.
- Una acción principal clara por vista.

## Colors

La paleta equilibra azul noche con superficies marfil claro y usa un cian moderado como acento de producto. El tema oscuro es el punto de partida de las pantallas actuales de juego y lobby; las superficies claras quedan disponibles para vistas utilitarias cuando mejoren la lectura.

### Superficies oscuras

- **Fondo noche** (`#080E20`): fondos de página y marco del juego actual.
- **Superficie profunda** (`#101827`): paneles, menús y grupos de controles.
- **Superficie elevada** (`#182333`): una sola capa superior para menús o paneles seleccionados.
- **Texto principal** (`#F4F6F8`): títulos y contenido importante sobre oscuro.
- **Texto atenuado** (`#A8B2BE`): apoyo y metadatos.
- **Borde oscuro** (`#2B3746`): separadores discretos y contornos de controles.

### Superficies claras

- **Fondo claro** (`#F4F6F8`): fondo de página en tema claro.
- **Superficie papel** (`#FFFFFF`): controles y paneles sobre fondo claro.
- **Tinta** (`#17202A`): texto principal en superficies claras.
- **Tinta secundaria** (`#5B6673`): texto de apoyo en superficies claras.
- **Borde claro** (`#DDE3E9`): divisores y límites de campos.

### Acentos y reglas

- **Cian refinado** (`#62C9D5`): relleno de acciones principales, estados activos y foco sobre fondos oscuros. Usa texto casi negro en botones cian.
- **Cian para texto** (`#267C87`): enlaces y texto de énfasis en superficies claras.
- **Oro de logro** (`#D3B66E`): recompensas o hitos puntuales.
- **Éxito** (`#58B88D`) y **peligro** (`#D96E79`): estados, siempre junto a una etiqueta o icono.
- **Cian arcade** (`#00D9FF`), **magenta arcade** (`#FF00D9`) y **violeta de progreso** (`#A255F8`): conserva estos colores en el HUD, el arte de personajes y el progreso propio del juego. Evítalos en la navegación y los formularios habituales.

**Regla del presupuesto de acento.** Cada vista usa un solo acento como señal principal de interacción. Limita el color de acento a una zona pequeña; no ilumines todos los bordes, títulos, iconos y botones a la vez. Evita rellenos con degradado como comportamiento predeterminado.

## Typography

**Fuente de display:** Goldman, con fallback sans-serif.  
**Fuente de cuerpo:** sans-serif del sistema (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`).  
**Fuente de etiquetas de juego:** Press Start 2P, disponible como `.font-pixel`.  
**Acento numérico:** Orbitron puede usarse en puntuaciones o temporizadores cortos, nunca en párrafos.

Mantén una fuente de display expresiva y otra muy legible para el cuerpo en cada vista. Usa tipografía pixelada solo en etiquetas breves, valores compactos del HUD y elementos que expresen la identidad del juego; nunca en instrucciones, párrafos o textos largos de botones.

### Jerarquía

- **Display** (Goldman, 36–40px, interlineado 1.1): un título de página cuando la pantalla lo necesite.
- **Titular** (Goldman, 24–28px, interlineado 1.2): títulos de sección y modos de juego.
- **Título** (sans-serif del sistema, 18–20px, interlineado 1.35): encabezados de paneles y formularios.
- **Cuerpo** (sans-serif del sistema, 16px, interlineado 1.5): instrucciones, descripciones y formularios.
- **Apoyo** (sans-serif del sistema, 14px, interlineado 1.45): metadatos e indicaciones secundarias.
- **Etiqueta de juego** (Press Start 2P, 10–12px, interlineado 1.6): solo etiquetas breves; aumenta el tamaño si la lectura lo requiere.

**Regla de una sola voz dominante.** Cada vista tiene un encabezado visualmente dominante. El cuerpo y el texto de apoyo quedan en segundo plano para que la acción principal siga siendo evidente.

## Layout

Usa una escala estricta con base de 4px y agrupaciones de 8px. Los únicos pasos de espaciado son 4, 8, 12, 16, 24, 32, 48 y 64px. Los bordes de 1px y los contornos de foco de 2px son excepciones deliberadas. No introduzcas medidas arbitrarias cuando exista un token adecuado.

- 4–8px: relación entre iconos y etiquetas o controles muy relacionados.
- 12–16px: relleno de controles y separación entre campos relacionados.
- 24px: relleno de paneles compactos y separación de grupos relacionados.
- 32px: relleno de paneles en escritorio y separación entre grupos principales.
- 48–64px: secciones de página y márgenes exteriores en pantallas grandes.
- Márgenes exteriores: 16px en pantallas estrechas, 24px en medianas y 32px en amplias.

Deja que el contenido determine la altura. Prefiere anchos flexibles con un máximo legible en lugar de paneles de ancho fijo. Agrupa los controles relacionados, alinea los bordes y usa un contenedor por concepto; evita tarjetas dentro de tarjetas. Reduce columnas antes de que el texto o los controles se compriman.

## Elevation & Depth

Usa cambios tonales y bordes finos para estructurar la interfaz. Reserva las sombras suaves para diálogos, menús flotantes y la acción principal activa cuando necesite separarse del fondo. El brillo neón es un efecto del juego, no la sombra predeterminada de los paneles. Mantén las superficies legibles sin desenfoques ni adornos.

## Shapes

- Radio de 4px: campos compactos y controles pequeños.
- Radio de 8px: botones, tarjetas y paneles estándar.
- Radio de 12px: diálogos y superficies grandes de función.
- Radio de 16px: solo contenedores grandes y excepcionales.
- Radio de píldora: insignias y estados compactos.

Usa el radio más pequeño que convenga al componente. Mantén los bordes finos y consistentes; reserva los bordes cuadrados para superficies del juego que deban coincidir con el pixel art.

## Components

### Buttons

- **Principal:** una por vista; relleno cian con texto casi negro, 12px de relleno vertical, 16px horizontal y radio de 8px.
- **Secundario:** superficie discreta o contorno con la misma geometría; no compite con la acción principal.
- **Destructivo:** usa el token de peligro y una etiqueta directa; nunca comuniques el riesgo solo con color.
- **Estados:** muestra estados hover, presionado, deshabilitado y foco visible. El foco debe distinguirse en ambos temas.
- **Táctil:** los objetivos interactivos miden al menos 44×44px.

### Formularios

Usa etiquetas persistentes, texto de entrada de 16px, ayuda breve y errores junto al campo correspondiente. No uses el placeholder como única etiqueta. Cada formulario tiene una acción principal de envío.

### Tarjetas y paneles

Usa superficies planas, un borde discreto y relleno de 16–32px según la densidad. Cada panel representa una tarea o categoría. Añade una segunda capa solo cuando aclare la interacción o la jerarquía.

## Do's and Don'ts

### Sí

- Haz evidente el siguiente paso del jugador al primer vistazo.
- Usa textos breves en español que nombren una acción, estado, requisito o resultado.
- Separa claramente títulos, cuerpo y etiquetas mediante tamaño y peso.
- Conserva la expresividad del arte del juego y mantén sobrios los controles a su alrededor.
- Revisa contraste, foco de teclado, ajuste en pantallas pequeñas y movimiento reducido.

### No

- No pongas lemas genéricos, párrafos de relleno ni sobrelíneas decorativas junto a un botón. Todo texto cercano debe explicar la tarea, el estado o la consecuencia.
- No dejes que varios botones rellenos compitan como acción principal en una misma vista. Una acción domina; las demás quedan como secundarias o textuales.
- No uses etiquetas vagas como «Descubrir», «Empezar» o «Continuar» si puedes nombrar la acción real.
- No uses tipografía pixelada en el cuerpo, brillo neón en todas las superficies, tarjetas apiladas ni degradados grandes como decoración.
- No uses el color como única señal de progreso, error, disponibilidad o éxito.
