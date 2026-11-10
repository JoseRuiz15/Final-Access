# Uso del CodeGraph local

Para analizar o refactorizar código, carga la habilidad del proyecto `codegraph` antes de explorar archivos. Consulta el grafo con `npm run graph:query -- src/ruta/al/archivo.js`; el comando lee `.opencode/graph.json` y devuelve solo los módulos directamente conectados con sus exportaciones y firmas públicas.

Usa esa salida para decidir qué archivos conectados abrir. No cargues el grafo entero ni archivos no conectados salvo que la información disponible sea insuficiente para resolver la tarea.

Si `.opencode/graph.json` no existe o quedó desactualizado, ejecútalo con `npm run graph:build` antes de consultarlo. El JSON es un artefacto local derivado y no debe agregarse a Git.

La habilidad se carga bajo demanda; el `AGENTS.md` del repositorio indica a OpenCode cuándo usarla.
