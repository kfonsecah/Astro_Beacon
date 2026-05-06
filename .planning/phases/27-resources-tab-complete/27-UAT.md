---
status: complete
phase: 27-resources-tab-complete
source: 27-01-SUMMARY.md, 27-02-SUMMARY.md
started: 2026-05-06T00:00:00Z
updated: 2026-05-06T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Resources tab — datos correctos en barra de progreso
expected: Cada card muestra "actual / máximo unidad" (ej. "23.5 / 100 L"). La barra de progreso refleja ese porcentaje real.
result: pass
note: "RECURSOS (6/0) — total mostraba 0. Corregido inline: resource.service.ts ahora hace fallback a data.total ?? items.length"

### 2. Historial dentro de cada card
expected: Si un recurso tiene movimientos registrados, aparece una sección "ULTIMOS MOVIMIENTOS" dentro de la misma card (no flotando fuera de la lista), con hasta 3 movimientos mostrando +/-, cantidad y fecha.
result: pass

### 3. Borde de color y símbolo por categoría
expected: Cada card tiene un borde izquierdo de color según categoría (ej. azul para agua, verde para comida) y muestra un símbolo (O2, H2O, ALI, MED, EQP, OTR) antes del nombre del recurso.
result: pass

### 4. Pull-to-refresh repopula la lista
expected: Al hacer pull-to-refresh en el tab de Recursos, la lista se actualiza con datos frescos. La lista NO queda vacía después del refresh.
result: pass

### 5. Chips en log-resource muestran cantidad disponible
expected: Al abrir log-resource, los chips de selección muestran nombre + cantidad + unidad (ej. "AGUA  23.5 L"). El chip seleccionado resalta con fondo de color primario.
result: pass

### 6. Validación de egreso — cantidad excede disponible
expected: Seleccionar un recurso → tipo EGRESO → ingresar cantidad mayor a la disponible → pulsar registrar. Aparece mensaje de error ("Solo hay X unidad disponibles...") y NO se llama a la API. El formulario no se cierra.
result: pass

### 7. Registro de ingreso exitoso
expected: Seleccionar un recurso → tipo INGRESO → ingresar cantidad válida → registrar. El movimiento se registra, aparece confirmación, y el formulario vuelve al estado inicial.
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
