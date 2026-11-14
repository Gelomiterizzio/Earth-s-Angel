# T-P0-C7 · Entrega: demo, formulario en inglés y defensa

| Campo | Valor |
| --- | --- |
| ID | T-P0-C7 |
| Prioridad · hito | P0 · Entrega, domingo de 09:30 a 11:30 |
| Perfil recomendado | [Integración y QA](../prompts/integracion-y-qa.md) |
| Responsable · revisor | C · A y B |
| Base Git | Rama `c/p0-c7-entrega` desde `main` |
| Estimación | 2,0 h |
| Estado | pendiente de publicación y demo oficial |

## Objetivo

El proyecto queda enviado antes de las 11:30 del domingo con todos los campos en inglés, una demo dentro de los límites y enlaces que cualquiera puede abrir. El equipo llega a la defensa de las 14:00 con el pitch ensayado.

## Componentes

[ENTREGA.md](../../ENTREGA.md) · [presentacion/](../../presentacion/PITCH.md) · [IA-Y-CREDITOS.md](../../IA-Y-CREDITOS.md)

## Contexto a leer

1. [ENTREGA.md](../../ENTREGA.md) completo
2. [NASA-SPACE-APPS-2026.md](../../NASA-SPACE-APPS-2026.md): sección 1 y matriz de entrega
3. [presentacion/GUION-DEMO.md](../../presentacion/GUION-DEMO.md), [DIAPOSITIVAS.md](../../presentacion/DIAPOSITIVAS.md) y [PITCH.md](../../presentacion/PITCH.md)
4. [PLAN-EQUIPO.md](../../PLAN-EQUIPO.md#8-lista-de-verificación-de-lanzamiento)

## Dependencias

X1: URL pública funcionando. B aporta el texto del campo NASA Data. A aporta enlaces.

## Rutas

- **Permitidas:** `docs/ENTREGA.md`, `docs/presentacion/**`, `docs/IA-Y-CREDITOS.md`, `README.md`.
- **Excluidas:** código.

## Contratos

Límites oficiales: video de 30 segundos o menos, o 7 diapositivas o menos contando título e introducción. Todo en inglés. Video en español solo con subtítulos en inglés. Enlaces públicos sin registro.

## Pasos de implementación

**Sábado, cuanto antes**

1. Confirmar con la organización de la sede: si las 12:00 son límite estricto, formato y duración de la defensa, idioma, proyector, y si se puede reenviar después.
2. Comprobar que los tres integrantes aparecen en la pestaña Members y que el reto elegido es el correcto.
3. Abrir la pestaña Project y comparar sus campos con [ENTREGA.md](../../ENTREGA.md). Si hay diferencias, actualizar el documento.
4. Guardar un primer borrador en el formulario con **Save Progress**.

**Domingo**

5. 09:30 · Rellenar los `[POR COMPLETAR]` de [ENTREGA.md](../../ENTREGA.md): nombres, enlaces, resultados reales.
6. 09:45 · Grabar la demo siguiendo [GUION-DEMO.md](../../presentacion/GUION-DEMO.md) con `?seed=demo`. Subtítulos en inglés incrustados. Medir la duración del archivo final: 30 segundos o menos.
7. 10:15 · Subir el video como público o no listado, sin restricción de edad ni de región. Alternativa: exportar las diapositivas a PDF, 7 páginas o menos, y subirlo con enlace público.
8. 10:30 · Probar los dos enlaces en una ventana privada y desde un teléfono con datos móviles.
9. 10:40 · Copiar al formulario cada campo desde [ENTREGA.md](../../ENTREGA.md). Activar el candado de edición mientras escribes.
10. 10:55 · Revisar con A y B: campo NASA Data, campo de IA y lista de referencias contra [IA-Y-CREDITOS.md](../../IA-Y-CREDITOS.md).
11. 11:10 · Revisar que nada muestra a menores ni marca de NASA, y que todo lo generado con IA está identificado.
12. 11:20 · Marcar las dos casillas y pulsar **Submit for Judging**. Capturar el aviso de confirmación.
13. 11:30 · Abrir la página pública del proyecto y comprobar que se ve.
14. 12:00 a 14:00 · Ensayar el pitch dos veces con cronómetro. Dejar el juego abierto en dos laptops, con una partida de respaldo en el día 7.

## Entregables

Proyecto enviado, demo pública, documentos de entrega actualizados y pitch ensayado.

## Pruebas

Manual M-ENT-01 a M-ENT-06 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] Aviso de envío correcto capturado antes de las 11:30.
- [ ] La demo dura 30 segundos o menos, o tiene 7 diapositivas o menos.
- [ ] Los dos enlaces abren en ventana privada y en un teléfono.
- [ ] Todo el texto del formulario y de los materiales enlazados está en inglés.
- [ ] El campo NASA Data nombra DONKI, el identificador del registro y dónde aparece en el juego.
- [ ] El campo de IA describe herramientas, usos y revisión humana.
- [ ] Las referencias listan cada recurso externo.
- [ ] Ningún material contiene menores, datos personales ni marca de NASA.

## Evidencia

Captura del aviso de envío y enlaces finales anotados en [ENTREGA.md](../../ENTREGA.md).

## Condiciones de integración

Los documentos actualizados se fusionan en `main` tras el envío. Etiqueta `entrega-2026-11-15`.

## Informe final

Hora de envío · enlaces · qué quedó sin confirmar con la sede · qué se dijo en cada campo sobre IA y datos.
