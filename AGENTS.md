# Desarrollo Frontend (`retro-app`)

Este documento define el contexto, las reglas, las restricciones y el flujo de trabajo para el **Frontend**. Tu objetivo es construir la interfaz de usuario en **Angular** interactuando con el backend de Django ya existente.

---

# RETRO_INVENTORY

Es una plataforma web diseñada para coleccionistas y entusiastas de los videojuegos clásicos, orientada a la gestión, catalogación e inventario detallado de consolas, juegos y accesorios retro. El sistema permite realizar un seguimiento exhaustivo del estado físico de los artículos, almacenar sus imágenes de forma dinámica y registrar los componentes faltantes (como manuales o cajas) de cada pieza de la colección.

---

## 🛠️ Stack Tecnológico Autorizado

* **Framework:** Angular 22.0.3 (Arquitectura basada en Componentes, Servicios y Modules/Standalone según convenga).
* **Estilos:** SCSS (Sass) estructurado (Uso de variables para colores retro, mixins y flexbox/grid). **No usar librerías de estilos pesadas (como Tailwind o Bootstrap) a menos que se solicite explícitamente.**
* **Lenguaje:** TypeScript estricto.
* **Comunicación:** `HttpClientModule` para consumir la API REST del backend de Docker (`http://localhost:8000/api/`).

---

## 💻 Comandos del Frontend

* **`ng serve`** — Levanta el servidor local de desarrollo en `http://localhost:4200/`.
* **`ng generate component/service/interface path/name`** — Utiliza siempre el CLI de Angular para mantener las estructuras limpias.
* **`ng test`** — Ejecuta la suite de pruebas unitarias con Jasmine/Karma.
* **`ng lint`** — Valida el cumplimiento de las guías de estilo de TypeScript.

---

## 📁 Estructura del Proyecto Esperada

Cualquier componente o lógica nueva debe encajar en esta estructura limpia dentro de `retro-app/src/app/`:

* **`core/`** — Servicios globales que solo se instancian una vez (Ej: `api.service.ts`, autenticación).
* **`shared/`** — Componentes, directivas o pipes reutilizables (Ej: botones con estética retro, barras de carga).
* **`features/`** o **`modules/`** — Secciones principales de la app divididas por lógica:
  * `consoles/` — Lista de consolas, detalle, formulario de añadir/editar.
  * `games/` — Lista de cartuchos/discos, filtros por plataforma, detalle del juego.
  * `accessories/` — Gestión de mandos, cables y periféricos.
* **`models/`** o **`interfaces/`** — Interfaces TypeScript que replican exactamente los campos del backend.

---

## 🤝 Convenciones de Código Frontend

* **Estilo de Nombres:**
  * Archivos: `kebab-case` con sufijo descriptivo (`game-list.component.ts`, `console.service.ts`).
  * Variables y Funciones: `camelCase` (`getRetroGames()`, `selectedConsole`).
  * Clases/Componentes/Interfaces: `PascalCase` (`ConsoleListComponent`, `GameInterface`).
* **Tipado Estricto:** Toda petición HTTP debe mapearse a una interfaz TypeScript. Queda prohibido el uso de `any`.
* **Manejo de Errores:** Centralizar los fallos de red o errores `400/404/500` de la API mediante un `HttpInterceptor` o mediante catchError en los observables de RxJS, mostrando mensajes limpios al usuario en la UI.
* **Gestión de Estado:** Uso limpio de RxJS (`BehaviorSubject` o `Signals` si es Angular moderno) para manejar el estado de las listas y los artículos seleccionados.

---

## 🚫 Restricciones Críticas (No Hagas)

1. **No inventes los nombres de los endpoints:** El backend ya está escrito y cerrado. Las rutas de la API son estrictamente:
   * `/api/consoles/`
   * `/api/games/`
   * `/api/accessories/`
   * `/api/images/`
   * `/api/components/`
2. **No codifiques la URL base en los servicios:** Usa siempre el archivo `environment.ts` para configurar la URL del backend (`http://localhost:8000`).
3. **No dupliques peticiones HTTP:** Utiliza tuberías de RxJS adecuadamente (evita el "Callback Hell" de subscribes anidados; usa `switchMap`, `forkJoin`, etc., cuando sea necesario).
4. **No ignores el ciclo de vida:** Asegúrate de desuscribirte de los Observables en el `ngOnDestroy` (o usar el pipe `async` en el HTML) para evitar fugas de memoria.

---

## 🔄 Flujo de Trabajo

1. **Fase de Reconocimiento:** Antes de escribir código, pide ver la interfaz de TypeScript o el JSON que devuelve el backend para el modelo que vas a picar.
2. **Primero la Infraestructura (Servicios):** Antes de diseñar una pantalla visual, genera el servicio de Angular con sus peticiones HTTP correspondientes.
3. **Paso a Paso:** Diseña una vista a la vez (Ej: primero la lista de juegos, luego la ficha de detalle, luego el formulario). No intentes generar toda la app de un solo golpe.
4. **Validación:** Al terminar un componente, asegúrate de que compila limpiamente sin errores en la terminal antes de dar la tarea por finalizada.


## Cosas a tener encuenta siempre.

1. **Al realizar una tarea:** Siempre que termines una tarea: 
   - Me dices que tengo que realizar para comprobar que esa tearea funciona y "Todo OK?"
   - Una vez te diga que todo esta correcto, completa esa tarea y la añade en el archivo HISTORIAL.md (si no esta creado el archivo lo creas en la raiz de retro-app) con el nombre de la tarea, ¿Que realiza?, ¿Porque?, Donde verlo en el archivo (numero de lineas) y como comprobar que funciona. 
