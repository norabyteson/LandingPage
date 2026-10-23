# Demos funcionales

Demos que se abren desde la sección **Servicios** de la landing (visor `components/ui/DemoViewer.tsx`).
Funcionan de verdad pero **sin backend**: los datos son ficticios, se generan en el navegador y se
guardan en `localStorage`. Cada demo tiene un botón **Restablecer demo** que vuelve a los datos iniciales.

## Organización

```
app/(demos)/                 Rutas de los demos (solo el punto de entrada)
  layout.tsx                 Layout raíz propio: sin AdSense, Analytics, Lenis ni navbar; noindex
  demos.css                  Tailwind + base de los demos (no comparte tokens con la landing)
  demos/<demo>/page.tsx      → URL /demos/<demo>

demos/                       Código de los demos (esta carpeta)
  shared/                    Utilidades comunes: almacén persistente, avisos, diálogos, formato/fechas, aleatorio
  arquitectos/               ArquitectOS: personal y proyectos de un despacho (misma estructura que fluxpos)
  nexuserp/                  NexusERP: ventas, compras, inventario y finanzas de una distribuidora
  fluxpos/                   Punto de venta
    FluxPosClient.tsx        Carga la app solo en el navegador (sin SSR)
    FluxPosApp.tsx           Raíz: proveedor de estado, marco y vistas
    types.ts                 Modelo de datos
    data/seed.ts             Datos ficticios iniciales (deterministas, relativos a "hoy")
    store.tsx / actions.ts   Estado y operaciones (cada acción valida y lanza errores legibles)
    calc.ts                  Cálculos: totales, corte de caja, reportes
    components/              Piezas de interfaz del demo
    views/                   Pantallas (Caja, Ventas, Inventario, Clientes, Reportes, Corte)
```

La landing (`app/(site)`) no importa nada de `demos/`, y los demos no importan nada de la landing.

## Reglas

- **Sin SSR**: los datos dependen de la fecha y de `localStorage`, así que cada demo se monta solo en
  el cliente (`dynamic(..., { ssr: false })`) para no provocar errores de hidratación.
- **Datos ficticios realistas** (nombres, precios en MXN, folios) y generados con semilla fija
  (`shared/random.ts`), para que la demo se vea igual cada vez que se restablece.
- **Versionar la semilla**: si cambia la forma de los datos, sube `SEED_VERSION` del demo; el estado
  guardado con otra versión se descarta.
- Cada acción del estado recibe una copia (`run(draft => ...)`) y lanza `Error` con un mensaje para la
  persona usuaria si no se puede hacer; el aviso lo muestra el almacén.

## Agregar un demo

1. Crea `demos/<demo>/` siguiendo la estructura de `fluxpos/`.
2. Crea `app/(demos)/demos/<demo>/page.tsx` que renderice su `*Client`.
3. Apunta su entrada en `DEMOS` de `components/ui/DemoViewer.tsx` a `/demos/<demo>`.
