# T-P0-C5 · Arte P0: sprites, iconos, logotipo y fondo

| Campo | Valor |
| --- | --- |
| ID | T-P0-C5 |
| Prioridad · hito | P0 · de H2 a H4, en paralelo |
| Perfil recomendado | [Arte y audio](../prompts/arte-y-audio.md) |
| Responsable · revisor | C · B |
| Base Git | Rama `c/p0-c5-arte` desde `main` |
| Estimación | 1,5 h |
| Estado | integrado en Luna. Marte verificado en la vista de arte |

## Objetivo

El juego tiene identidad visual propia: terreno lunar, edificios, iconos, logotipo, fondo del menú y viñetas de la apertura. Cada activo está registrado con su autoría y licencia.

## Componentes

[proceso-de-activos](../../componentes/proceso-de-activos.md) · [ARTE-Y-ACTIVOS.md](../../ARTE-Y-ACTIVOS.md)

## Contexto a leer

1. [ARTE-Y-ACTIVOS.md](../../ARTE-Y-ACTIVOS.md) completo
2. [proceso-de-activos](../../componentes/proceso-de-activos.md)
3. [NASA-SPACE-APPS-2026.md](../../NASA-SPACE-APPS-2026.md): IA, datos y derechos
4. [GUION-CINEMATICAS.md](../../GUION-CINEMATICAS.md), apertura

## Dependencias

Ninguna. El mapa (B3) y el HUD (C2) funcionan con marcadores hasta que lleguen los activos.

## Rutas

- **Permitidas:** `public/assets/sprites/**`, `public/assets/ui/**`, `public/assets/cinematics/**`, `public/assets/fonts/**`, `docs/ARTE-Y-ACTIVOS.md` (columna de estado), sección de C en `docs/IA-Y-CREDITOS.md`.
- **Excluidas:** código.

## Contratos

Nombres de archivo, dimensiones y formato exactos del manifiesto. Un activo con otro nombre no se carga.

## Pasos de implementación

Orden de producción. Lo de arriba primero: es lo que más se ve en la demo.

1. **Edificios** (24 × 32, PNG): panel, batería, generador, reciclador, extractor, invernadero, refugio, nave. Más un andamio genérico.
2. **Terreno lunar** (24 × 24): llano, roca, cráter, hielo, mineral, misterio, niebla.
3. **Iconos de interfaz** (16 × 16 y 32 × 32): energía, oxígeno, agua, alimentos, materiales, radiación, puntos de acción, día, Tierra, y los tres de estado con formas distintas.
4. **Logotipo** propio de Earth's Angel y **fondo del menú**.
5. **Viñetas de la apertura** (640 × 360): seis, según el guion.
6. **Retratos de la tripulación** (32 × 32): cuatro, por rol.
7. **Tipografías:** archivos y su licencia en `public/assets/fonts/`. Comprueba que tienen ñ, tildes, ¿ y ¡.

Para cada activo:

- Guárdalo en la ruta del manifiesto.
- Actualiza su fila: estado, autoría y licencia.
- Si se generó con IA: marca de agua visible en ilustraciones y viñetas, y entrada en [IA-Y-CREDITOS.md](../../IA-Y-CREDITOS.md) con herramienta, modelo, prompt, fecha y quién lo revisó.
- Comprueba que no contiene logotipos, insignias, banderas ni identificadores de misión.

## Entregables

Activos P0 del manifiesto y registros al día.

## Pruebas

Manual M-ART-01 a M-ART-03 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] Los ocho edificios se distinguen por su silueta a tamaño real.
- [ ] Todos los archivos tienen el nombre y las dimensiones del manifiesto.
- [ ] Toda ilustración o viñeta generada lleva marca de agua legible.
- [ ] Ningún activo contiene marca de NASA ni de otra agencia.
- [ ] Cada activo tiene autoría y licencia en el manifiesto.
- [ ] Las tipografías muestran bien "¿Refugiar a la tripulación?" y "Señal".

## Evidencia

Hoja con todos los sprites a tamaño real y ampliados.

## Condiciones de integración

Se fusiona por tandas: edificios y terreno antes de H3; el resto antes de H4. B revisa que los edificios se leen en el tablero.

**Recorte previsto:** si no hay tiempo, se entregan formas geométricas de la paleta con el icono del edificio. La mecánica manda sobre el pulido.

## Informe final

Activos entregados con ruta y dimensiones · pendientes · herramientas y modelos · qué lleva marca de agua · licencia de cada uno · qué revisó una persona.
