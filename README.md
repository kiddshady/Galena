# Mesada

Simulador de laboratorio para los TPL 1 a 4 de Tecnología Farmacéutica y
Biofarmacia II (UMAZA, 2026). Construida sobre [Onyx](C:\tools\Onyx).

Cada fórmula se prepara de principio a fin, en siete etapas:

1. **Receta** — el Rp/ del práctico; asignás la función de cada componente.
2. **Estantería** — buscás los frascos, con distractores de los que se confunden.
3. **Pesada** — balanza, probeta o pipeta, con el lote que tocó (×0,5 a ×2).
4. **Elaboración** — cada paso en orden; titulación de pH y baño María donde el práctico da números.
5. **Envasado** — envase y leyendas del rótulo.
6. **Control** — los controles de calidad que corresponden.
7. **Resultado** — puntaje, estrellas y la lista de errores con su explicación.

Las 25 fórmulas, sus cantidades y sus pasos están en `renderer/js/lab/formulas.js`,
sacados de los prácticos de la cátedra. El catálogo de la estantería, envases,
leyendas y controles, en `renderer/js/lab/catalogo.js`.

```
npm start          # abre la app
npm test           # tokens, almacenamiento y datos de las fórmulas
npm run partidas   # juega las 25 fórmulas por la UI real: tienen que dar 100
```

El progreso se guarda en `data/progreso.json`.
