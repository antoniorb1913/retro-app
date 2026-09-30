# Historial — Mejoras de RETRO_INVENTORY (frontend)

Documento de historial del listado de tareas **"Mejoras de RETRO_INVENTORY"** para el **frontend**
(`retro-app`). El plan completo está en `docs/PLAN.md` (raíz del workspace); las tareas de backend
se documentan en `retro-api/docs/history/`.

Solo se anotan aquí las tareas **verificadas y confirmadas por el humano**.

- **Rama de trabajo:** `mejoras-inventario` (en `retro-app`)
- **Creado:** septiembre de 2026

---

## A2. Verificación del flujo de login de punta a punta

- **¿Qué realiza?:** comprueba, sobre la aplicación en marcha, que el ciclo completo de sesión
  funciona: entrar con email, mantenerse identificado al recargar la página, cerrar sesión y no
  poder volver a las pantallas privadas sin identificarse. Cierra la tarea **A1** (arreglo del login
  en el backend), que por sí sola no garantizaba que el frontend se comportara bien.

- **¿Por qué?:** el arreglo de A1 se hizo en el backend (`'USERNAME_FIELD': 'email'` en
  `SIMPLE_JWT`). Faltaba confirmar que el frontend, que envía `email` y guarda los tokens en
  `localStorage`, completa el ciclo sin fugas: que la sesión sobrevive a un recargado, que el cierre
  de sesión borra los tokens y que el guard de rutas no deja pasar sin sesión.

- **Dónde verlo:**
  - `retro-app/src/app/core/auth.service.ts` (líneas 9-13: claves de `localStorage` y señal
    `isAuthenticated` que se calcula al arrancar; líneas 18-27: `login()`; líneas 39-44: `logout()`
    borra los dos tokens y apaga la señal)
  - `retro-app/src/app/core/auth.guard.ts` (líneas 6-14: si no hay sesión, redirige a `/login`)
  - `retro-app/src/app/core/layout.component.ts` (líneas 15-18: `logout()` y navegación a `/login`)
  - `retro-app/src/app/core/layout.component.html` (líneas 3 y 12: los dos botones "Cerrar sesión")
  - `retro-app/src/app/app.routes.ts` (líneas 12-14: el layout privado protegido por `authGuard`)

- **Cómo verificar (comprobado por el humano el 29/09/2026):**
  1. **Entrar:** abrir `http://localhost:4200`, introducir email y contraseña → entra al dashboard.
  2. **Recargar:** estando dentro, pulsar **F5** → la sesión se mantiene, sigue en la misma pantalla
     (no vuelve al login). Comprobado: correcto.
  3. **Cerrar sesión:** pulsar "Cerrar sesión" → vuelve a la pantalla de login y desaparece el menú
     privado. Comprobado: correcto.
  4. **Volver sin sesión:** escribir a mano `http://localhost:4200/games` con la sesión cerrada →
     redirige al login. Comprobado: correcto.

- **Tests añadidos:** no aplica. Esta tarea es una verificación manual sobre la aplicación en
  marcha; la parte automatizable (login correcto, credenciales inválidas y token válido) ya quedó
  cubierta en `retro-api/inventory/tests/test_a1_login.py` dentro de A1.

- **Rama de trabajo:** `mejoras-inventario` (`retro-app`).

- **Archivos tocados:** ninguno. Esta tarea **no modificó código**: solo verificó el
  comportamiento existente.

- **Hallazgo confirmado por el humano (no corregido, fuera del alcance de A2):** con la sesión
  cerrada, `http://localhost:8000/api/games/` responde con los datos **sin pedir autenticación**.
  Es el problema de permisos que se corrige en la tarea **E4** del plan (ver `AGENTS.md` §11.5).

- **Estado:** ✅ Completada — confirmada por el humano el 29 de septiembre de 2026.

---

## B1. Campos tienda y funda en el frontend

- **¿Qué realiza?:** añade a la aplicación los dos campos que el backend ya guardaba pero que la
  interfaz no mostraba ni permitía editar:
  - **Tienda** (`store`): desplegable con las 13 tiendas y una opción "— No especificado —".
  - **Protección** (`protective`): desplegable con "Sin funda", "Bolsa plástica" y "Funda PET".
  Los dos aparecen en el formulario de alta/edición y en la ficha de detalle, en las tres
  categorías: **consolas, juegos y accesorios**.

- **¿Por qué?:** la API ya devolvía `store` y `protective` en cada artículo (están en el modelo
  `ItemBase` y en los tres serializers), e incluso se podían rellenar desde el panel de
  administración de Django. Pero el frontend **no declaraba esos campos en su interfaz TypeScript**
  ni los pintaba, así que el dato viajaba en el JSON y se descartaba. En la práctica: desde la app
  no se podía registrar dónde se compró cada pieza ni con qué protección se guarda.

- **Dónde verlo:**
  - `retro-app/src/app/models/store.enum.ts` (líneas 1-39: las 13 tiendas y `StoreLabels`, con el
    valor `'-'` mapeado a "—" en la línea 38)
  - `retro-app/src/app/models/protective.enum.ts` (líneas 1-11: las 3 opciones y sus etiquetas)
  - `retro-app/src/app/models/item-base.interface.ts` (líneas 20-21: `store` y `protective` en la
    lectura; líneas 39-40: en la escritura)
  - `retro-app/src/app/models/index.ts` (líneas 16-17: exportación de los dos enums)
  - Formularios (mismo patrón en los tres):
    - `consoles/form/form.component.ts` (líneas 46-49: listas de opciones; 60-61: controles del
      formulario; 118-119: se envían al guardar; 134-135: se rellenan al editar)
    - `consoles/form/form.component.html` (líneas 66-83: los dos desplegables)
    - `games/form/form.component.ts` (líneas 46-49, 60-61, 113-114) y
      `games/form/form.component.html` (líneas 41-54)
    - `accessories/form/form.component.ts` (líneas 46-49, 59-60, 111-112) y
      `accessories/form/form.component.html` (líneas 37-50)
  - Detalles (mismo patrón en los tres):
    - `consoles/detail/detail.component.ts` (líneas 26-27: etiquetas; 35-46: `storeLabel()`) y
    - `consoles/detail/detail.component.html` (líneas 88-89: filas "Tienda" y "Protección")
    - `games/detail/detail.component.ts` (líneas 17-18 y 27-32) y
      `games/detail/detail.component.html` (líneas 67-68)
    - `accessories/detail/detail.component.ts` (líneas 18-19 y 27-32) y
      `accessories/detail/detail.component.html` (líneas 66-67)

- **Cómo verificar (comprobado por el humano el 29/09/2026):**
  1. **Reiniciar el frontend** (`Ctrl + C` y `npm start`). Es necesario porque la tarea **crea
     archivos nuevos**: `ng serve` no los detecta en caliente y sin reiniciar los desplegables no
     aparecen. (Aprendido durante la verificación de esta tarea; ver nota al final.)
  2. En `http://localhost:4200`, ir a **Consolas → + Nuevo**: deben verse los desplegables
     **Tienda (dónde se compró)** y **Protección**.
  3. Elegir, por ejemplo, "Vinted" y "Funda PET", y guardar.
  4. Abrir el detalle: debe mostrar **Tienda: Vinted** y **Protección: Funda PET**.
  5. Pulsar Editar: los dos valores deben venir rellenos.
  6. Repetir en **Juegos** y **Accesorios**.
  7. Un artículo antiguo sin tienda asignada debe mostrar **Tienda: —** (no `-` ni un hueco).
  8. Comprobación cruzada en el panel de administración (`http://localhost:8000/admin`): el mismo
     artículo debe mostrar Vinted y Funda PET, porque es el mismo dato.

- **Tests añadidos:** no aplica. El frontend todavía no tiene infraestructura de tests (solo el
  `app.spec.ts` de ejemplo de Angular). Montarla es la tarea **E1** del plan; hasta entonces, esta
  tarea se verifica a mano. El backend no se ha tocado.

- **Rama de trabajo:** `mejoras-inventario` (`retro-app`).

- **Archivos tocados:** 2 nuevos (`models/store.enum.ts`, `models/protective.enum.ts`) y 12
  modificados (interfaz, barrel, los 3 formularios `.ts` + `.html` y los 3 detalles `.ts` + `.html`).
  Total: +142 líneas, -2. **Ningún archivo del backend.**

- **Notas y deuda detectada durante la tarea:**
  - `store` en el backend tiene 13 opciones pero su valor por defecto es `'-'`, que **no está** en
    esa lista. Se ha resuelto **solo en el frontend** (se mapea a "—" al mostrar y se envía `'-'`
    al guardar), **sin tocar la base de datos ni crear migraciones**. Limpiar esa incoherencia en el
    modelo queda como tarea futura si se quiere.
  - **Prettier no pasa en 11 de los archivos tocados**, pero no por esta tarea: ya estaban así
    antes (formato compacto con líneas de más de 100 caracteres). Se probó a formatearlos y
    reformateaba más de 100 líneas por archivo, así que se revirtió para no mezclar dos cambios en
    el mismo commit. Propuesto como tarea aparte: pasar Prettier a todo el proyecto.
  - `npm run build` termina sin errores y el bundle inicial queda en **310 kB** (el aviso está en
    500 kB y el error en 1 MB, según `angular.json`).

- **Estado:** ✅ Completada — confirmada por el humano el 29 de septiembre de 2026.

---

## C1. Mantener los filtros al volver a la lista

- **¿Qué realiza?:** cuando el usuario filtra una lista (buscador, plataforma u orden), entra en un
  artículo para verlo y vuelve a la lista, **los filtros siguen puestos** y la lista se recarga ya
  filtrada. Funciona en las tres listas: consolas, juegos y accesorios.

- **¿Por qué?:** los filtros vivían en la memoria del componente de la lista. Al entrar en un
  detalle, Angular destruye ese componente, y al volver lo crea de cero: había que filtrar otra vez
  desde el principio **cada vez** que se miraba un artículo. Era la molestia de uso más repetida de
  la aplicación.

- **Dónde verlo:**
  - `retro-app/src/app/core/list-filter-state.service.ts` (líneas 1-60: servicio nuevo; interfaz
    `ListFilterState` en la 12, tipo `ListSection` en la 19, clase en la 22, métodos `get` 35,
    `save` 40, `markVisited` 45 e `isReturning` 53)
  - `retro-app/src/app/features/consoles/list/list.component.ts` (línea 20: servicio inyectado;
    45: `restoreFilters()` en `ngOnInit`; 66-77: `restoreFilters()`; 79-84: `saveFilters()`)
  - `retro-app/src/app/features/games/list/list.component.ts` (19, 41, 54-65 y 67-72)
  - `retro-app/src/app/features/accessories/list/list.component.ts` (19, 38, 50-61 y 63-68)

- **Cómo verificar (comprobado por el humano el 29/09/2026):**
  1. Reiniciar el frontend (`ng serve` no detecta archivos nuevos como el servicio).
  2. En **Consolas**, elegir una plataforma o escribir en el buscador → la lista se filtra.
  3. Entrar en un artículo y pulsar **atrás** en el navegador (o el enlace de volver).
  4. Debe aparecer la lista **ya filtrada**, con la plataforma seleccionada en el desplegable.
  5. Repetir con el orden (por precio, por nombre) y en **Juegos** y **Accesorios**.
  6. Cerrar el navegador y volver a entrar: la lista sale completa (los filtros viven en memoria).

- **Tests añadidos:** no aplica. El frontend no tiene todavía infraestructura de tests (tarea E1 del
  plan); la verificación es manual. El backend no se ha tocado.

- **Rama de trabajo:** `mejoras-inventario` (`retro-app`).

- **Cómo funciona (para quien lo lea en el futuro):** el servicio guarda el último filtro de cada
  lista **en memoria** (no en la URL, no en `localStorage`). Al entrar en una lista, si ya se había
  visitado antes en la misma sesión, se recupera el filtro; si es la primera visita, la lista se
  muestra completa como siempre. El orden de las llamadas en `ngOnInit` es importante: primero
  `restoreFilters()` y después la carga, porque la primera petición ya debe llevar el filtro.

- **Deuda conocida:** al volver, la lista está filtrada **pero el cuadro de búsqueda aparece vacío**
  (la plataforma y el orden sí se ven). Sincronizar el texto del buscador obliga a enlazarlo al
  componente, que es precisamente lo que rompió el intento anterior (ver nota al final), así que se
  dejó fuera a propósito. Ver la tarea futura propuesta al final de este documento.

- **Estado:** ✅ Completada — confirmada por el humano el 29 de septiembre de 2026.

---

## C2. Botón "Borrar filtros"

- **¿Qué realiza?:** añade un botón **"✕ Borrar filtros"** en la barra de filtros de las tres
  listas. Quita todos los filtros de una vez (buscador, plataforma y orden), deja la barra limpia y
  recarga la lista completa. El botón **solo aparece si hay algún filtro puesto**.

- **¿Por qué?:** con los filtros ahora persistente (C1), hacía falta una forma rápida de volver a
  verlo todo sin tener que limpiar campo por campo y sin recargar la página. Además evita la
  situación confusa de "no veo mis artículos" cuando hay un filtro olvidado.

- **Dónde verlo:**
  - `retro-app/src/app/features/consoles/list/list.component.html` (línea 8: referencia
    `#searchInput`; líneas 19-21: el botón)
  - `retro-app/src/app/features/games/list/list.component.html` (líneas 7 y 14-16)
  - `retro-app/src/app/features/accessories/list/list.component.html` (líneas 7 y 14-16)
  - `retro-app/src/app/features/consoles/list/list.component.ts` (88-90: `hasActiveFilters()`;
    98-105: `clearFilters()`), y equivalentes en juegos (76-78, 86-93) y accesorios (79-81, 89-96)
  - `retro-app/src/styles.scss` (líneas 705-729: estilo `.btn-clear`, dentro de `.filters-bar`)

- **Cómo verificar (comprobado por el humano el 29/09/2026):**
  1. En cualquier lista, poner un filtro (texto o plataforma).
  2. Debe aparecer el botón **"✕ Borrar filtros"** a la derecha de los desplegables.
  3. Pulsarlo: el cuadro de búsqueda queda vacío, el desplegable vuelve a "Todas las plataformas",
     la lista muestra todos los artículos y **el botón desaparece**.
  4. Sin filtros puestos, el botón no se muestra.
  5. Comprobar que después de borrar, el buscador sigue escribiendo con normalidad.

- **Tests añadidos:** no aplica (misma razón que en C1).

- **Rama de trabajo:** `mejoras-inventario` (`retro-app`).

- **Detalle técnico:** el cuadro de búsqueda se limpia a través de su referencia de plantilla
  (`#searchInput`), **no** enlazándolo al componente. Así el buscador mantiene su comportamiento
  original y el botón no interfiere con lo que el usuario escribe.

- **Estado:** ✅ Completada — confirmada por el humano el 29 de septiembre de 2026.

---

## D1. Precio del artículo y precio total (parte de frontend)

- **¿Qué realiza?:** añade a la aplicación el campo **"Total con gastos"** en los formularios, la
  fila **"Precio total"** en las fichas de detalle y cambia la columna de las listas para mostrar y
  sumar el **total** en lugar del precio del artículo. Todo en las tres secciones: consolas, juegos y
  accesorios. La parte de backend (campo, migración, validación) está en
  `retro-api/docs/history/2026-09-mejoras-inventario.md`.

- **¿Por qué?:** el backend pasó a distinguir entre el precio del artículo y lo que costó con
  gastos, y el frontend tenía que reflejarlo: sin esto, la app seguiría mostrando solo el precio del
  artículo y no habría forma de registrar ni ver lo que se pagó de verdad. Además, la lista debe
  sumar **totales** (lo invertido) y no precios de artículo, que es la cifra que interesa.

- **Dónde verlo:**
  - `retro-app/src/app/models/item-base.interface.ts` (línea 14: `total_price` en la lectura;
    línea 36: en la escritura)
  - Formularios (mismo patrón en los tres):
    - `consoles/form/form.component.ts` (59: control del formulario; 94-100: copia automática del
      precio al total si el total está vacío; 126: se envía; 143: se rellena al editar)
    - `consoles/form/form.component.html` (campo "Total con gastos" y su texto de ayuda)
    - `games/form/form.component.ts` (59, 91-97, 121 y 133) y `games/form/form.component.html`
    - `accessories/form/form.component.ts` (58, 90-96, 119 y 131) y
      `accessories/form/form.component.html`
  - Detalles: `consoles/detail/detail.component.html` (línea 87: fila "Precio total"),
    `games/detail/detail.component.html` (66) y `accessories/detail/detail.component.html` (65)
  - Listas: `consoles/list/list.component.html` (64: columna "Precio total") con su suma en
    `consoles/list/list.component.ts` (30); igual en juegos (58 y 26) y accesorios (58 y 25)
  - `retro-app/src/styles.scss` (líneas 878-883: estilo `.field-hint` para el texto de ayuda)

- **Cómo verificar (comprobado por el humano el 29/09/2026):**
  1. **Reiniciar el frontend** (`Ctrl + C` y `npm start`) y recargar con `Ctrl + Shift + R`.
  2. **Artículo existente:** abrir para editar (ej. "Game Boy") → el campo **Total con gastos** ya
     viene relleno con su precio.
  3. **Alta sencilla:** precio 30 €, sin tocar el total → al guardar, el total queda en 30 €.
  4. **Con gastos:** precio 30 € y total 37 € → se guardan los dos; el detalle muestra
     **Precio artículo: 30 €** y **Precio total: 37 €**.
  5. **Error controlado:** precio 30 € y total 20 € → mensaje *"El total no puede ser menor que el
     precio del artículo"* y no guarda.
  6. **La lista:** la columna se llama **"Precio total"**, muestra los totales y el "Total: X €" de
     la barra suma totales.
  7. **Orden:** pulsar la columna "Precio total" ordena por ese campo.
  8. **El admin** (`http://localhost:8000/admin`): las dos columnas visibles y editables.
  9. Repetir en **Juegos** y **Accesorios**.

- **Tests añadidos:** no aplica en el frontend (sin infraestructura de tests todavía; tarea E1 del
  plan). La lógica verificable está cubierta por los 6 tests del backend
  (`inventory/tests/test_d1_precio_total.py`). La compilación de plantillas (`npm run build`) valida
  el tipado de los campos nuevos en las tres secciones.

- **Rama de trabajo:** `precio-y-compra` (`retro-app`).

- **Archivos tocados:** 17 — la interfaz, los 3 formularios (`.ts` + `.html`), los 3 detalles
  (`.html`), las 3 listas (`.ts` + `.html`) y `styles.scss`.

- **Detalle de implementación:** si el usuario escribe un precio y deja el total vacío, el formulario
  **copia el precio en el total** automáticamente. No se usa una validación que bloquee el guardado:
  es una comodidad, y la regla de verdad (total ≥ precio) la aplica el backend. Así el frontend no
  puede quedar más restrictivo que la API.

- **Estado:** ✅ Completada — confirmada por el humano el 29 de septiembre de 2026.

---

## Nota importante: intento descartado (filtros en la URL)

Antes de esta versión se intentó resolver lo mismo guardando los filtros **en la URL**
(`/consoles?search=anna&platform=PS2&page=2`), que es el patrón habitual en aplicaciones web. **Se
descartó el 29/09/2026** por decisión del humano, después de comprobarlo en el navegador:

- La lista **no cargaba al entrar** (se quedaba en el esqueleto de carga) y el buscador y el
  desplegable **no filtraban**.
- Escribir generaba **varias peticiones por palabra** (4 peticiones para 3 letras), lo que se
  notaba como lentitud.
- El intento tocaba 7 archivos (incluidas las plantillas, el manejo del buscador y la paginación) y
  arreglar sus dos fallos habría añadido más complejidad todavía.

Los dos fallos se localizaron y se corrigieron en su momento (el `combineLatest` necesitaba una
emisión inicial, y el `debounceTime` estaba antes de juntar los flujos en lugar de después), pero
la decisión fue volver atrás y hacerlo de la forma simple que describe C1. **Se documenta aquí para
no repetir el error**: para filtros de lista en esta aplicación, el estado en memoria es suficiente
y no justifica tocar la URL ni el manejo del buscador.

---

## D2. Enlace de compra y botón "Ver compra" (parte de frontend)

- **¿Qué realiza?:** añade el campo **"Enlace de compra"** a los tres formularios (consolas, juegos
  y accesorios) y un botón **"Ver compra"** en las tres fichas de detalle, junto a "Editar" y
  "Eliminar", que abre el enlace **en pestaña nueva**. El botón **solo aparece si el artículo tiene
  enlace**. La parte de backend (campo, migración, validación) está en
  `retro-api/docs/history/2026-09-mejoras-inventario.md`.

- **¿Por qué?:** el backend pasó a guardar el enlace del anuncio donde se compró cada artículo; sin
  la parte de frontend no habría forma de rellenarlo ni de volver a abrirlo desde la ficha.

- **Dónde verlo:**
  - `retro-app/src/app/models/item-base.interface.ts` (línea 16: `purchase_url` en la lectura;
    línea 39: en la escritura)
  - Formularios (mismo patrón en los tres):
    - `consoles/form/form.component.ts` (60: control del formulario; 128: se envía; 146: se rellena
      al editar) y `consoles/form/form.component.html` (62-63: campo "Enlace de compra")
    - `games/form/form.component.ts` (60, 123 y 135) y `games/form/form.component.html` (38-39)
    - `accessories/form/form.component.ts` (59, 121 y 133) y
      `accessories/form/form.component.html` (34-35)
  - Detalles: `consoles/detail/detail.component.html` (línea 39: botón "Ver compra"),
    `games/detail/detail.component.html` (39) y `accessories/detail/detail.component.html` (39)

- **Cómo verificar (comprobado por el humano el 29/09/2026):**
  1. **Reiniciar el frontend** (`Ctrl + C` y `npm start`) y recargar con `Ctrl + Shift + R`.
  2. **Editar** un artículo → al final del formulario aparece **"Enlace de compra"** con su texto de
     ayuda.
  3. Pegar un enlace real de un anuncio (Wallapop, Vinted, eBay...) y guardar.
  4. **En la ficha** aparece el botón **"Ver compra"** → se abre en **pestaña nueva**.
  5. **Un artículo sin enlace** → el botón **no se muestra** (ni deja hueco).
  6. **Escribir basura** (`lo compre en la tienda`) → la API lo rechaza con un error visible.
  7. **El enlace se puede borrar** volviendo a dejar el campo vacío.

- **Tests añadidos:** no aplica en el frontend (sin infraestructura de tests todavía; tarea E1 del
  plan). La lógica verificable está cubierta por los tests del backend
  (`inventory/tests/test_d2_enlace_compra.py`).

- **Seguridad:** el enlace se pinta con `[href]` (Angular escapa el valor; no se usa `innerHTML`) y
  con **`target="_blank"` junto a `rel="noopener noreferrer"`**, para que la página destino no pueda
  manipular la aplicación a través de `window.opener`. El esquema del enlace lo valida el backend
  (solo `http`/`https`), así que el frontend nunca recibe un `javascript:`.

- **Rama de trabajo:** `enlace-compra` (`retro-app`).

- **Archivos tocados:** 10 — la interfaz, los 3 formularios (`.ts` + `.html`) y los 3 detalles
  (`.html`).

- **Estado:** ✅ Completada — confirmada por el humano el 29 de septiembre de 2026.

---

## E7. Manejo de la sesión en el frontend (token caducado y renovación compartida)

- **¿Qué realiza?:** arregla los dos fallos que tenía la sesión en el frontend:
  1. **El guard ya mira si el token ha caducado.** Antes solo comprobaba que *existiera* algo en
     `localStorage`, así que un token caducado —o incluso un texto inventado— contaba como sesión
     válida y te dejaba entrar. Ahora, si el token no sirve pero hay refresh, **lo renueva y te deja
     entrar**; si no hay arreglo posible, **te manda al login**.
  2. **La renovación del token se pide una sola vez.** Antes, cada respuesta 401 lanzaba su propio
     `refresh`. Ahora todas las peticiones que reciben un 401 a la vez **comparten una única
     petición** de renovación y esperan a ella. Además, si la renovación falla, **se limpia la sesión
     y se navega al login** (antes solo se borraban los tokens y te quedabas en una pantalla que
     fallaba sin explicación).

- **¿Por qué?:** dos problemas reales detectados en la lectura del código (apuntados como §11.13 y
  §11.14 de `AGENTS.md`):
  - El `authGuard` daba por buena cualquier cosa escrita en `localStorage`.
  - El interceptor no agrupaba las renovaciones. Ejemplo real: al entrar en Inicio con el token
    caducado, el dashboard pide consolas, juegos y accesorios **en paralelo**; las tres peticiones
    reciben 401 y lanzaban **tres renovaciones**. Esto se agrava con el freno de intentos de la tarea
    E6 (el refresh está limitado a **10/minuto**): una pantalla que dispare muchas peticiones a la vez
    podía agotar el límite y **expulsar al usuario sin motivo**.

- **Dónde verlo:**
  - `retro-app/src/app/core/auth.service.ts` (líneas 17-38: función `tokenCaducado()`, que lee el
    campo `exp` del propio token; línea 43: el estado inicial de la sesión ya usa esa comprobación;
    líneas 52-95: la renovación compartida `#renovacion$` con `shareReplay`, que se olvida al
    terminar para que la próxima renovación sea una petición nueva; líneas 112-122:
    `tieneRefreshToken()`, `actualizarEstadoSesion()` y `haySesionUtilizable()`)
  - `retro-app/src/app/core/auth.guard.ts` (líneas 22-41: entra si la sesión sirve; si no, renueva y
    entra; si no puede renovar, al login)
  - `retro-app/src/app/core/auth.interceptor.ts` (líneas 24-26: las rutas de token no se reintentan;
    líneas 41-53: usa la renovación compartida y, si falla, `logout()` + navegación a `/login`)
  - `retro-app/src/app/core/auth.service.ts` (líneas 119-123: `haySesionUtilizable()`, el cálculo que
    cierra el agujero)

- **Cómo verificar (comprobado por el humano el 30/09/2026):**
  1. **Recargar** la app con `Ctrl + Shift + R` y entrar con tu cuenta → funciona igual que siempre.
  2. **Navegar** por Inicio, Consolas, Juegos, Accesorios y una ficha → todo normal.
  3. **Token estropeado, con refresh bueno** *(el caso que antes fallaba en silencio)*: en
     **DevTools → Application → Local Storage → `http://localhost:4200`**, pon `access_token` =
     `basura` y recarga. **Resultado comprobado: la app renueva sola el token y te deja entrar**; al
     mirar otra vez el `Local Storage`, `access_token` vuelve a ser un token largo y válido.
     *(Antes entraba con la basura y las peticiones fallaban una detrás de otra.)*
  4. **Token y refresh estropeados** *(sesión terminada de verdad)*: pon también `refresh_token` =
     `basura` y recarga. **Resultado comprobado: te manda al login** y en la consola se ve
     `POST /api/api/token/refresh/ 401 (Unauthorized)`. *(Antes te quedabas en la pantalla con
     errores y sin saber por qué.)*
  5. Volver a entrar con la cuenta: la sesión se arregla sola.

- **Tests añadidos:** **no** (ver "Deuda pendiente" abajo). La infraestructura de tests del frontend
  está rota (tarea E1 del plan), así que la verificación se hizo con:
  - **Prueba del fallo antes del arreglo**, con tokens JWT reales: el guard antiguo dejaba entrar con
    un token caducado **y con la cadena `esto.no.es.un.jwt`**; el nuevo rechaza los dos.
  - **8 casos de caducidad** sobre la función real extraída del archivo: token válido, de 7 días,
    que caduca en 1 segundo, caducado hace 10 minutos, caducado hace 8 días, sin fecha `exp`, texto
    que no es un JWT y cadena vacía → **todos correctos**.
  - **Simulación del interceptor con RxJS**: con 4 peticiones recibiendo 401 a la vez, antes se
    lanzaban **4** renovaciones al servidor y ahora **1**, recibiendo las 4 su token.
  - **Prueba contra la API real**: un token caducado firmado por el servidor devuelve **401**
    (`"Token is expired"`), y su refresh vivo devuelve **200** con un token nuevo que la función de
    caducidad reconoce como válido.
  - `npm run build` en verde (313,26 kB, dentro del presupuesto).

- **Rama de trabajo:** `sesion-frontend` (`retro-app`).

- **Archivos tocados:** 3 — `core/auth.service.ts`, `core/auth.guard.ts` y
  `core/auth.interceptor.ts`. **No se tocó el backend ni el contrato de la API.**

- **Deuda pendiente (anotada, no resuelta aquí):** esta tarea **no lleva tests automáticos** porque
  `npm test` no arranca: `src/app/app.spec.ts` es un resto de la plantilla de Angular que importa
  `./app` (el archivo real es `app.component.ts`). Mientras eso no se arregle, ningún cambio de
  frontend se puede cubrir con tests. Es la tarea **E1** del plan y conviene hacerla antes de seguir
  con más lógica de frontend.

- **Estado:** ✅ Completada — confirmada por el humano el 30 de septiembre de 2026.

---

## E1 (parte de frontend). Arreglar la infraestructura de tests y los primeros tests de verdad

- **¿Qué realiza?:** deja **funcionando `npm test`** en el frontend y añade los primeros tests
  automáticos de verdad (20 en total). Antes, la suite **no arrancaba**: `src/app/app.spec.ts` venía
  de la plantilla de Angular, importaba `./app` (el archivo real es `app.component.ts`) y esperaba
  un `<h1>Hello, retro-app</h1>` que ya no existe. Ese único archivo roto impedía ejecutar
  **cualquier** test del proyecto.

- **¿Por qué?:** sin tests no se puede verificar nada del frontend de forma automática. E7 se cerró
  sin ellos y hubo que comprobarlo todo a mano (simulaciones, tokens reales y dos pruebas manuales
  en el navegador). Esta tarea cierra ese punto ciego: a partir de ahora cada cambio de frontend
  puede llevar su test, igual que ya pasa en el backend.

- **Dónde verlo:**
  - `retro-app/src/app/app.spec.ts` (líneas 1-44): reescrito. Importa `./app.component`, provee
    `provideRouter([])` y comprueba que el componente raíz arranca, que deja el `<router-outlet />`
    y que **no** pinta menús ni cabeceras (eso es cosa de `layout.component`).
  - `retro-app/src/app/core/auth.service.spec.ts` (nuevo, 17 tests):
    - líneas 7-17: dos ayudantes que **construyen JWT de prueba** con `btoa`, sin librerías y sin
      depender de la fecha real ni de la red.
    - líneas 19-52: los **9 casos de `tokenCaducado()`** (válido, caduca en 1 s, caducado hace
      10 min, caducado hace 8 días, sin `exp`, `exp` que no es número, texto que no es un JWT,
      cadena vacía y nulo).
    - líneas 63-107: si hay sesión aprovechable (sin token, token vivo, token caducado, basura) y
      si hay refresh con el que renovar.
    - líneas 109-147: la renovación del token, con el test clave
      **"pide la renovación una sola vez aunque se le llame varias veces a la vez"** (4 llamadas →
      **1** petición al servidor, y las 4 reciben su token), más el guardado del token nuevo y que
      la siguiente renovación sí vuelve a pedirse.
    - líneas 149-162: cerrar sesión borra los dos tokens y apaga la sesión.
  - `retro-app/AGENTS.md` (§6.4): se sustituyó el aviso de "`npm test` NO arranca" por las reglas
    que se derivan de esta tarea (dónde van los `.spec.ts`, limpiar `localStorage`, construir los
    JWT en el test, `provideHttpClientTesting`, nombres de test en español).

- **Cómo verificar:**
  1. `cd retro-app && npm test` → deben salir **2 archivos y 20 tests, todos en verde**.
  2. `npx prettier --check "src/app/app.spec.ts" "src/app/core/auth.service.spec.ts"` → en verde.
  3. `npm run build` → compila y el bundle inicial sigue en ~313 kB (dentro del presupuesto).
  4. **Comprobar que los tests sirven de verdad** (esto es lo importante, y se hizo):
     - Quitar `if (this.#renovacion$) return this.#renovacion$;` de `auth.service.ts` → falla **1**
       test con `Expected one matching request ... found 4 requests`.
     - Cambiar `haySesionUtilizable()` por `return !!localStorage.getItem(...)` (el comportamiento
       viejo) → fallan **exactamente 2** tests: el del token caducado y el del texto basura.
     Restaurar el código después: los 20 tests vuelven a verde.

- **Tests añadidos:** `src/app/core/auth.service.spec.ts` (17 tests) y `src/app/app.spec.ts`
  (3 tests). Cubren la lógica de E7, que se había quedado sin cobertura.

- **Rama de trabajo:** `main` (`retro-app`) — excepción justificada: es la reparación de la
  herramienta de trabajo, no una funcionalidad nueva, y va junto con el `AGENTS.md` corregido.

- **Archivos tocados:** 4 — `src/app/app.spec.ts` (reescrito),
  `src/app/core/auth.service.spec.ts` (nuevo), `AGENTS.md` (las 3 copias) y `docs/PLAN.md`.
  **No se tocó código de producción**: `git diff src/app/core/auth.service.ts` queda vacío.

- **Deuda pendiente:** sigue sin decidirse si el backend adopta además `pytest` + `pytest-django`
  (la parte de backend de E1). Y queda como tarea futura cubrir con tests el **interceptor** y el
  **guard**, que necesitan `TestBed` + `HttpTestingController` y hoy no están probados.

- **Estado:** ✅ Completada — confirmada por el humano el 30 de septiembre de 2026.

---

## Tareas futuras propuestas (sin aprobar)

- **Mostrar el texto del buscador al volver a la lista.** Hoy la lista vuelve filtrada pero el
  cuadro de texto se ve vacío. Se puede resolver guardando el término en el servicio y aplicándolo
  al cuadro mediante una **referencia de plantilla o una directiva** (el mismo patrón imperativo que
  usa el botón de borrar), sin volver a enlazar el buscador a un valor que dependa de una respuesta
  del backend: eso fue lo que dio problemas en el intento descartado. Requiere aviso previo y
  verificación en navegador.
- **Botón de borrar filtros también en la vista de tabla vacía**: si el filtro no devuelve
  resultados, hoy el usuario ve el mensaje de "no hay artículos" pero el botón ya está visible en la
  barra, así que puede que no haga falta. Se deja apuntado por si el humano lo pide.

---

## Notas de entorno aprendidas (útiles para las próximas tareas)

- **`ng serve` no detecta archivos nuevos.** Si una tarea crea archivos (componentes, servicios,
  enums, interfaces), hay que **reiniciar el frontend** para que aparezcan. Si solo se modifican
  archivos existentes, la recarga es automática.
- **El backend sí recarga solo** (el contenedor monta el código como volumen), pero si se toca
  `settings.py` conviene reiniciarlo con `docker compose restart api` para asegurar.
- **Recarga forzada del navegador** (`Ctrl + Shift + R`) cuando se cambian plantillas o estilos, para
  no ver una versión en caché.
