# Historial de Implementación

## 0.1: Setup entorno

- **¿Qué realiza?:** Configura el entorno base del proyecto Angular: variables de entorno (apiUrl), HttpClient provider, angular.json con fileReplacements, y stub del interceptor HTTP.
- **¿Por qué?:** Para establecer la comunicación HTTP con el backend de Django y centralizar la configuración de la URL base.
- **Dónde verlo:**
  - `src/environments/environment.ts` (líneas 1-3)
  - `src/environments/environment.development.ts` (líneas 1-3)
  - `src/app/app.config.ts` (líneas 1-13)
  - `src/app/core/auth.interceptor.ts` (líneas 1-4)
  - `angular.json` (líneas 58-64)
- **Cómo comprobar:** Ejecutar `ng build` y verificar que compila sin errores.

## 0.2: Interfaces TypeScript

- **¿Qué realiza?:** Crea todas las interfaces TypeScript que modelan los datos del backend: ItemBase, Console, Game, Accessory, MissingComponent, ItemImage, Auth y Paginación, más los enums ItemStatus y Platform con sus labels.
- **¿Por qué?:** Para tener tipado estricto en toda la aplicación y garantizar que las respuestas HTTP del backend se mapean correctamente (requisito del AGENTS.md: prohibido el uso de `any`).
- **Dónde verlo:**
  - `src/app/models/item-base.interface.ts` (líneas 1-22)
  - `src/app/models/console.interface.ts` (líneas 1-2)
  - `src/app/models/game.interface.ts` (líneas 1-2)
  - `src/app/models/accessory.interface.ts` (líneas 1-2)
  - `src/app/models/missing-component.interface.ts` (líneas 1-3)
  - `src/app/models/item-image.interface.ts` (líneas 1-10)
  - `src/app/models/auth.interface.ts` (líneas 1-16)
  - `src/app/models/pagination.interface.ts` (líneas 1-5)
  - `src/app/models/item-status.enum.ts` (líneas 1-13)
  - `src/app/models/platform.enum.ts` (líneas 1-70)
  - `src/app/models/index.ts` (líneas 1-16)
- **Cómo comprobar:** Ejecutar `ng build` y verificar que compila sin errores. Revisar que cada campo del backend tenga su equivalente en las interfaces.

## 0.3: Auth Service + Auth Guard

- **¿Qué realiza?:** Crea el servicio de autenticación (`AuthService`) con métodos login, refreshToken, logout y señal `isAuthenticated`. Crea el guard `authGuard` para proteger rutas.
- **¿Por qué?:** Todos los endpoints del backend requieren autenticación JWT. El servicio centraliza la gestión de tokens y el guard protege las rutas del frontend redirigiendo a /login.
- **Dónde verlo:**
  - `src/app/core/auth.service.ts` (líneas 1-56)
  - `src/app/core/auth.guard.ts` (líneas 1-16)
- **Cómo comprobar:** Ejecutar `ng build` y verificar que compila. Revisar que `login()` usa `POST /api/api/token/` y almacena tokens en localStorage.

## 0.4: HTTP Interceptor (JWT + errores)

- **¿Qué realiza?:** Implementa el interceptor funcional `authInterceptor` que añade el token JWT a cada petición y maneja errores 401 con refresh automático.
- **¿Por qué?:** El backend requiere JWT en todas las peticiones. Centralizar la inyección del token y el refresh evita duplicar lógica en cada servicio y cumple con la restricción de no ignorar el ciclo de vida.
- **Dónde verlo:**
  - `src/app/core/auth.interceptor.ts` (líneas 1-37)
  - `src/app/app.config.ts` (línea 8: `withInterceptors([authInterceptor])`)
- **Cómo comprobar:** Ejecutar `ng build` y verificar que compila. En 401, debe intentar refresh y si falla, hacer logout.

## 0.5: API base service

- **¿Qué realiza?:** Crea el servicio genérico `ApiService` con métodos CRUD tipados (getList, getById, create, update, patch, delete, upload) que apuntan a `http://localhost:8000/api/`.
- **¿Por qué?:** Centraliza toda la comunicación HTTP en un solo servicio reutilizable, evitando duplicar lógica de construcción de URLs y parámetros en cada feature.
- **Dónde verlo:**
  - `src/app/core/api.service.ts` (líneas 1-53)
- **Cómo comprobar:** Ejecutar `ng build` y verificar que compila. Revisar que usa `environment.apiUrl` como base.

## 0.6: Estilos globales retro + layout base

- **¿Qué realiza?:** Define la paleta de colores retro, tipografía monospace, estilos base (botones, inputs, cards) y el layout de la aplicación con sidebar de navegación fija y área de contenido principal.
- **¿Por qué?:** Proporciona la identidad visual retro y la estructura base sobre la que se montarán todas las vistas del inventario.
- **Dónde verlo:**
  - `src/styles.scss` (líneas 1-93)
  - `src/app/app.html` (líneas 1-26)
  - `src/app/app.scss` (líneas 1-72)
  - `src/app/app.ts` (líneas 1-17)
- **Cómo comprobar:** Ejecutar `ng build` y verificar que compila. Ejecutar `ng serve` para ver el layout con sidebar.

## 1.1-1.2: Login component + ruta

- **¿Qué realiza?:** Crea el componente de login con formulario (email+password), la ruta `/login` sin sidebar, y reestructura las rutas con un LayoutComponent que contiene la sidebar y las rutas protegidas por `authGuard`. Añade rutas placeholder para consoles, games, accessories y un wildcard catch-all.
- **¿Por qué?:** El login es la puerta de entrada a la app. Al estar todas las rutas del backend protegidas con JWT, el frontend necesita autenticarse primero. El LayoutComponent separa la vista pública (login) de las vistas protegidas (sidebar + contenido).
- **Dónde verlo:**
  - `src/app/features/auth/login.component.ts` (líneas 1-106)
  - `src/app/core/layout.component.ts` (líneas 1-51)
  - `src/app/app.routes.ts` (líneas 1-29)
  - `src/app/app.ts` (líneas 1-10)
- **Cómo comprobar:** Ejecutar `ng serve`. Ir a `/login` sin sidebar. Ir a `/consoles` sin autenticar debe redirigir a `/login`.

## 2.1: Console service + list component

- **¿Qué realiza?:** Crea el servicio `ConsoleService` con CRUD completo contra `/api/consoles/` y el componente `ConsoleListComponent` con tabla de consolas, búsqueda con debounce, ordenación por columnas, badges de estado y acciones (ver, editar, eliminar con confirmación). Actualiza las rutas hijas de consolas.
- **¿Por qué?:** La lista de consolas es la vista principal del inventario. El servicio abstrae las peticiones HTTP y el componente ofrece una interfaz completa de gestión.
- **Dónde verlo:**
  - `src/app/features/consoles/console.service.ts` (líneas 1-33)
  - `src/app/features/consoles/console-list.component.ts` (líneas 1-198)
  - `src/app/features/consoles/consoles.routes.ts` (líneas 1-26)
- **Cómo comprobar:** Autenticarse en `/login`, navegar a `/consoles`. Ver la tabla con datos del backend. Probar búsqueda y ordenación.

## Fixes en backend

- **¿Qué realiza?:** Corrige la configuración CORS en Django (añade `CorsMiddleware` al MIDDLEWARE y `CORS_ALLOWED_ORIGINS` incluyendo `localhost:4200`). Corrige `prefetch_related('image')` → `'images'` en `view_accessory.py`.
- **¿Por qué?:** Sin CORS el navegador bloquea las peticiones del frontend Angular al backend Django. El typo en `prefetch_related` causaba error 500 al listar accesorios.
- **Dónde verlo:**
  - `retro-api/core/settings.py` (líneas 74, 186-190)
  - `retro-api/inventory/api/views/view_accessory.py` (línea 7)
- **Cómo comprobar:** `curl -X OPTIONS http://localhost:8000/api/api/token/ -H "Origin: http://localhost:4200"` debe devolver `access-control-allow-origin: http://localhost:4200`.

## 2.2: Console detail component (carrusel + lightbox)

- **¿Qué realiza?:** Crea el componente de detalle de consola con toda la información del artículo, lista de componentes faltantes, carrusel de imágenes con navegación ‹› y lightbox a pantalla completa al pinchar una imagen.
- **¿Por qué?:** El detalle es la ficha completa del artículo. El carrusel permite navegar imágenes y el lightbox verlas a tamaño completo sin recargar.
- **Dónde verlo:**
  - `src/app/features/consoles/console-detail.component.ts` (líneas 1-200)
- **Cómo comprobar:** Ir a `/consoles/:id`, navegar imágenes con ‹›, pinchar para abrir lightbox.

## 2.3: Console form component (create/edit)

- **¿Qué realiza?:** Crea el componente de formulario para crear y editar consolas con ReactiveForms, campos: nombre, modelo, plataforma (select), región, estado (select), precio, fecha, descripción, completo (checkbox), y multi-select de componentes faltantes.
- **¿Por qué?:** Permite al usuario añadir y modificar artículos en el inventario mediante POST/PUT a la API.
- **Dónde verlo:**
  - `src/app/features/consoles/console-form.component.ts` (líneas 1-175)
  - `src/app/core/missing-component.service.ts` (líneas 1-13)
- **Cómo comprobar:** `/consoles/new` crea, `/consoles/:id/edit` edita con datos precargados.

## Fix serializers backend (platform_display / status_display)

- **¿Qué realiza?:** Corrige los serializers de Console, Game y Accessory añadiendo los campos `platform_display` y `status_display` como `CharField(source='get_..._display')`. Arregla self-import en `item_base.py`.
- **¿Por qué?:** Los serializers listaban esos campos en Meta.fields pero no los declaraban, causando ImproperlyConfigured al acceder a cualquier endpoint de inventario.
- **Dónde verlo:**
  - `retro-api/inventory/api/serializers/console.py` (líneas 1-22)
  - `retro-api/inventory/api/serializers/game.py` (líneas 1-22)
  - `retro-api/inventory/api/serializers/accessory.py` (líneas 1-22)
  - `retro-api/inventory/api/serializers/item_base.py` (línea 7)
- **Cómo comprobar:** `curl /api/consoles/` debe devolver JSON con `platform_display` y `status_display`.

## 3.1-3.5: Juegos CRUD completo

- **¿Qué realiza?:** Crea el servicio GameService y los componentes list, detail (con carrusel+lightbox), form (create/edit) y rutas para juegos, replicando la misma funcionalidad que consolas pero contra `/api/games/`.
- **¿Por qué?:** Los juegos son la segunda categoría del inventario con los mismos campos (ItemBase).
- **Dónde verlo:**
  - `src/app/features/games/game.service.ts`
  - `src/app/features/games/game-list.component.ts`
  - `src/app/features/games/game-detail.component.ts`
  - `src/app/features/games/game-form.component.ts`
  - `src/app/features/games/games.routes.ts`
- **Cómo comprobar:** Sidebar > Juegos. CRUD completo funcional.

## 4.1-4.5: Accesorios CRUD completo

- **¿Qué realiza?:** Crea el servicio AccessoryService y los componentes list, detail (con carrusel+lightbox), form (create/edit) y rutas para accesorios contra `/api/accessories/`.
- **¿Por qué?:** Los accesorios son la tercera categoría del inventario.
- **Dónde verlo:**
  - `src/app/features/accessories/accessory.service.ts`
  - `src/app/features/accessories/accessory-list.component.ts`
  - `src/app/features/accessories/accessory-detail.component.ts`
  - `src/app/features/accessories/accessory-form.component.ts`
  - `src/app/features/accessories/accessories.routes.ts`
- **Cómo comprobar:** Sidebar > Accesorios. CRUD completo funcional.

## Fix MEDIA_URL backend + HEIC support

- **¿Qué realiza?:** Añade `MEDIA_URL = '/media/'` y `MEDIA_ROOT` en settings.py, sirve archivos media en urls.py. Instala `pillow-heif` y registra el opener HEIF para convertir imágenes HEIC a WebP automáticamente.
- **¿Por qué?:** Sin MEDIA_URL las imágenes no tenían ruta correcta (faltaba /media/). Sin pillow-heif no se podían subir fotos en formato HEIC desde el panel admin.
- **Dónde verlo:**
  - `retro-api/core/settings.py` (líneas 186-189)
  - `retro-api/core/urls.py` (líneas 15-18, 34)
  - `retro-api/inventory/models/Image.py` (líneas 10-12)
  - `retro-api/requirements.txt` (línea 24)
- **Cómo comprobar:** Subir un .heic desde el admin → se convierte a .webp automáticamente.

## 5.1: Image upload desde frontend

- **¿Qué realiza?:** Crea el componente compartido `ImageUploadComponent` que permite subir imágenes desde el frontend mediante `POST /api/images/` con multipart/form-data (image + content_type_model + object_id). Integrado en los detalles de Consolas, Juegos y Accesorios.
- **¿Por qué?:** Para poder añadir imágenes a los artículos directamente desde la interfaz Angular sin necesidad del panel admin de Django.
- **Dónde verlo:**
  - `src/app/shared/image-upload/image-upload.component.ts` (líneas 1-90)
  - `src/app/features/consoles/console-detail.component.ts` (líneas 9, 97-100, 222-225)
  - `src/app/features/games/game-detail.component.ts` (líneas 9, 55-56, 113)
  - `src/app/features/accessories/accessory-detail.component.ts` (líneas 9, 55-56, 112)
- **Cómo comprobar:** Ir al detalle de un artículo, hacer click en "+ Añadir imagen", seleccionar un archivo. La imagen aparece en el carrusel tras la subida.

## 7.1: Dashboard

- **¿Qué realiza?:** Crea el componente Dashboard como página principal con tarjetas de totales (consolas, juegos, accesorios, total general) y lista de últimos 10 artículos añadidos. Actualiza la ruta por defecto de `/` para mostrar el dashboard.
- **¿Por qué?:** Proporciona una vista general del inventario al entrar en la aplicación, mostrando estadísticas y actividad reciente.
- **Dónde verlo:**
  - `src/app/features/dashboard/dashboard.component.ts` (líneas 1-170)
  - `src/app/app.routes.ts` (líneas 1-32)
- **Cómo comprobar:** Ir a `http://localhost:4200/`. Deben verse las tarjetas con totales y la lista de últimos añadidos.
