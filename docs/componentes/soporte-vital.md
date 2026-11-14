# Soporte vital

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-19 |
| Prioridad · fase | P0 · H2 y H3 |
| Objetivo | Modelar el oxígeno: cómo se genera, cómo se consume y qué pasa cuando falta. |
| Responsabilidad | `src/core/life-support.ts` |
| Depende de | [energia](energia.md), [agua-y-alimentos](agua-y-alimentos.md), [tripulacion](tripulacion.md) |
| No incluye | Agua y alimentos ([agua-y-alimentos](agua-y-alimentos.md)). Salud ([tripulacion](tripulacion.md)). |
| Responsable · revisor | A · B |
| Estado | Propuesto. Reglas validadas en el modelo de referencia. |

## 2. Arquitectura y funcionamiento

"Soporte vital" agrupa en el HUD oxígeno, agua y alimentos. Esta ficha define el oxígeno y el hecho `lsOk`.

### Generador de oxígeno · paso 5, tercer módulo

```text
si tiene electricidad y aguaParaModulos >= generatorWaterIn:
  agua    −= generatorWaterIn      // 2
  oxigeno += generatorOxygenOut    // 6
  funcionó hoy
si no:
  no produce
```

`aguaParaModulos` es el agua por encima de la ración de la tripulación ([motor-recursos](motor-recursos.md)).

### Consumo · paso 6

Un oxígeno por tripulante y día, antes que el agua y los alimentos. Quien se queda sin oxígeno pierde 50 de salud ese día.

### Soporte vital operativo

```text
lsOk = hoy funcionó al menos un extractor, un reciclador y un generador
```

Es el objetivo `soporte` y una condición del día estable ([objetivos](objetivos.md)).

### Señales al jugador

| Situación | Señal |
| --- | --- |
| Margen de oxígeno de 2 a 3 días | Medidor en ▲ "Atención" |
| Margen de 1 día o menos | Medidor en ✖ "Crítico" y alerta hablada |
| Generador sin electricidad | Icono sobre el edificio y línea en el informe |
| Generador sin agua | Línea en el informe: "El generador no tuvo agua" |
| Tripulante sin oxígeno | `alert/shortage`, retrato en ✖ |

## 3. Datos y uso

Con cuatro tripulantes: consumo de 4 por día, generación de 6. Margen de +2 por día con el generador encendido.

### Ejemplo: una decisión que se paga después

Media, día 4, sombra. Si el jugador apaga el generador para ahorrar 4 de energía:

- Hoy: el oxígeno baja de 12 a 8 en lugar de subir a 14.
- Efecto: seis unidades menos que recuperar. El objetivo `reservas` (oxígeno ≥ 16) se alcanza tres días más tarde.

Es el compromiso que pide el reto: lo que ahorra energía hoy cuesta oxígeno mañana.

### Simplificaciones

No se modelan el CO₂, la presión ni las fugas. La proporción 2 de agua → 6 de oxígeno es `balance`. Que el oxígeno salga del agua por electrólisis es `transformación didáctica` basada en ECLSS ([CIENCIA-Y-DATOS.md](../CIENCIA-Y-DATOS.md)).

### Casos límite

- Agua justa para la tripulación: el generador no funciona y el informe lo explica.
- Dos generadores: cada uno gasta 2 de agua y da 6 de oxígeno, si hay para ambos.
- Oxígeno al máximo: el generador funciona igual y el exceso se desperdicia.

## 4. Implementación delegable

**Tareas:** [T-P0-A3](../agentes/tareas/T-P0-A3-nucleo-recursos-y-dias.md) (generador) y [T-P0-A4](../agentes/tareas/T-P0-A4-nucleo-tripulacion-y-objetivos.md) (faltas y `lsOk`).

**Prompt breve:**

```text
Implementa el generador de oxígeno y el hecho lsOk según docs/componentes/soporte-vital.md.
El generador solo usa agua por encima de la ración de la tripulación. Añade al informe las
claves de causa y efecto de "sin electricidad" y "sin agua".
```

**Pruebas:** U-AGU-03, U-AGU-04, U-OBJ-02 y U-TRI-01 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** con electricidad y agua, +6 de oxígeno y −2 de agua; sin una de las dos, nada; `lsOk` es falso si falta cualquiera de los tres módulos.

**Evidencia:** pruebas en verde.

**Terminado cuando:** el oxígeno de los tres recorridos coincide con las tablas.

**Riesgos:** que el jugador no vea por qué baja el oxígeno. Mitigación: frase de causa y efecto en cada informe.
