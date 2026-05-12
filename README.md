# Ninja Camisetas POS

Sistema POS y catálogo online desarrollado para la gestión comercial de una tienda de camisetas de fútbol. El proyecto combina un panel privado de administración con inteligencia de negocio, control de stock, historial de ventas y una tienda pública simple orientada a convertir pedidos por WhatsApp.

El sistema nació como una solución real para un emprendimiento de venta de camisetas y fue pensado con una arquitectura escalable para poder evolucionar hacia una base reutilizable en futuros proyectos comerciales.

## Descripción

Ninja Camisetas POS es una aplicación web fullstack construida con Next.js, Supabase, TypeScript y Tailwind CSS. Su objetivo principal es centralizar la gestión diaria de una tienda: administrar productos, controlar stock por talle, registrar ventas, visualizar métricas comerciales y ofrecer un catálogo público para clientes.

El foco principal está puesto en el dashboard privado, ya que funciona como un sistema POS para uso interno. Además, cuenta con una tienda pública donde los clientes pueden explorar productos, seleccionar talle, armar un carrito y enviar la orden lista por WhatsApp.

## Demo

Tienda pública:

[https://ninjacamisetas.vercel.app/store](https://ninjacamisetas.vercel.app/store)

## Estado del proyecto

Proyecto privado en uso real, desarrollado como solución comercial para una tienda de camisetas de fútbol.

También funciona como experiencia base para la creación de futuros sistemas POS adaptables a distintos rubros, aunque este repositorio está orientado específicamente al caso de Ninja Camisetas.

## Stack técnico

- Next.js 16
- React
- TypeScript
- Supabase Auth
- Supabase Database / PostgreSQL
- Supabase Storage
- Server Actions
- Tailwind CSS
- shadcn/ui
- Zustand
- pnpm
- Vercel

## Funcionalidades principales

### Dashboard privado

El dashboard está orientado al uso interno del administrador de la tienda. Actualmente cuenta con tres rutas principales:

#### `/dashboard`

Panel inicial con inteligencia de negocio y acciones rápidas.

Incluye métricas filtrables por período:

- Este mes
- Últimos 3 meses
- Últimos 6 meses
- Último año
- Todo el historial

Indicadores principales:

- Ingresos totales
- Margen bruto
- Ganancia neta
- Unidades vendidas
- Ticket promedio
- Stock valorizado por costo
- Stock físico total
- Alertas de stock crítico
- Productos con mayor rotación
- Productos con mayor rentabilidad

Acciones rápidas:

- Registrar venta
- Agregar nueva camiseta

#### `/stock`

Módulo de inventario.

Permite:

- Listar productos disponibles
- Crear una nueva camiseta
- Editar productos existentes
- Eliminar productos
- Ver stock por talle
- Visualizar precio de venta y costo
- Controlar publicación en la tienda
- Agregar productos a una venta
- Gestionar variantes por talle

#### `/ventas`

Módulo de historial de ventas.

Permite:

- Ver ventas registradas
- Crear una nueva venta
- Visualizar el detalle de una venta
- Deshacer una venta si es necesario
- Reintegrar stock al deshacer una operación
- Mantener consistencia entre ventas, stock y métricas del dashboard

### Catálogo público

#### `/store`

Listado público de camisetas disponibles.

Los clientes pueden:

- Explorar productos publicados
- Ver precio, imagen y datos principales
- Agregar productos al carrito
- Iniciar el flujo de compra

#### `/store/[id]`

Detalle público de producto.

Permite:

- Ver fotos del producto
- Elegir talle
- Consultar información de la camiseta
- Agregar al carrito

### Carrito público

El carrito está pensado para una experiencia simple y directa.

Permite:

- Agregar productos desde la tienda
- Elegir talle
- Mantener persistencia del carrito
- Preparar una orden de compra
- Redirigir al cliente a WhatsApp con el pedido listo

Actualmente, las órdenes generadas desde la tienda pública no descuentan stock automáticamente. La operación queda orientada a la conversación por WhatsApp y posterior gestión manual.

## Flujo de venta interno

El sistema permite registrar ventas desde el panel privado mediante un flujo POS.

El administrador puede:

- Buscar productos mediante un selector con búsqueda
- Seleccionar variante/talle
- Indicar cantidad
- Agregar múltiples productos a la misma venta
- Validar stock disponible antes de confirmar
- Confirmar la venta final
- Descontar stock automáticamente
- Registrar la venta en el historial
- Impactar la operación en las métricas del dashboard

El flujo de ventas fue mejorado para soportar ventas con múltiples productos, validación de stock y persistencia de carrito interno.

## Autenticación

El dashboard privado está protegido mediante Supabase Auth y middleware de Next.js.

Características:

- Login de administrador
- Protección de rutas privadas
- Persistencia de sesión
- Acceso restringido al panel de gestión

Actualmente, el usuario administrador principal es el dueño de la tienda, encargado de operar el POS y gestionar el catálogo.

## Base de datos

El proyecto utiliza Supabase PostgreSQL como base de datos principal.

### Tabla `productos`

```sql
create table public.productos (
  id uuid not null default gen_random_uuid (),
  nombre text not null,
  temporada text not null,
  tipo text null default 'Local'::text,
  precio numeric not null default 0,
  imagen_url text null,
  creado_en timestamp with time zone not null default timezone ('utc'::text, now()),
  precio_costo numeric not null default 0,
  publicado boolean not null default true,
  slug text null,
  constraint camisetas_pkey primary key (id),
  constraint camisetas_slug_key unique (slug)
) TABLESPACE pg_default;
```

La tabla `productos` almacena la información principal de cada camiseta.

Campos destacados:

- `nombre`: nombre del producto
- `temporada`: temporada de la camiseta
- `tipo`: categoría del producto, como Local, Visitante o Alternativa
- `precio`: precio de venta
- `precio_costo`: costo del producto
- `imagen_url`: imagen principal
- `publicado`: visibilidad en la tienda pública
- `slug`: identificador amigable para rutas públicas

### Tabla `productos_stock`

```sql
create table public.productos_stock (
  id uuid not null default gen_random_uuid (),
  producto_id uuid null,
  variante text not null,
  cantidad integer not null default 0,
  constraint camisetas_stock_pkey primary key (id),
  constraint camisetas_stock_camiseta_id_talle_key unique (producto_id, variante),
  constraint camisetas_stock_producto_id_fkey foreign KEY (producto_id) references productos (id) on delete CASCADE
) TABLESPACE pg_default;
```

La tabla `productos_stock` administra las variantes de stock por producto.

Campos destacados:

- `producto_id`: relación con el producto
- `variante`: talle o variante
- `cantidad`: unidades disponibles

### Tabla `ventas`

```sql
create table public.ventas (
  id uuid not null default gen_random_uuid (),
  producto_id uuid null,
  variante text not null,
  cantidad integer not null default 1,
  precio_unitario numeric not null,
  total numeric GENERATED ALWAYS as (((cantidad)::numeric * precio_unitario)) STORED null,
  fecha_venta timestamp with time zone not null default timezone ('utc'::text, now()),
  precio_costo numeric not null default 0,
  constraint ventas_pkey primary key (id),
  constraint ventas_producto_id_fkey foreign KEY (producto_id) references productos (id) on delete set null
) TABLESPACE pg_default;
```

La tabla `ventas` registra las operaciones realizadas desde el POS.

Campos destacados:

- `producto_id`: producto vendido
- `variante`: talle vendido
- `cantidad`: cantidad vendida
- `precio_unitario`: precio de venta al momento de la operación
- `precio_costo`: costo del producto al momento de la operación
- `total`: total calculado automáticamente
- `fecha_venta`: fecha de la venta

## Arquitectura

El proyecto está organizado siguiendo una estructura inspirada en Feature-Sliced Design.

Estructura principal:

```txt
app/
  (dashboard)/
    stock/
    ventas/
    layout.tsx
    page.tsx
  (public)/
    store/
  auth/
  globals.css
  layout.tsx
  middleware.ts

entities/

features/
  auth/
  dashboard/
  sells/
  stock/
  store/

lib/

public/

shared/
```

### Capas principales

#### `app/`

Contiene las rutas principales de Next.js App Router, separadas entre rutas privadas del dashboard, rutas públicas de la tienda y autenticación.

#### `entities/`

Define entidades de negocio reutilizables, como productos, ventas o carrito.

#### `features/`

Contiene funcionalidades organizadas por dominio:

- `auth`: autenticación y acceso
- `dashboard`: inteligencia de negocio y panel principal
- `sells`: registro y gestión de ventas
- `stock`: inventario y productos
- `store`: catálogo público y experiencia de compra

#### `shared/`

Contiene componentes, utilidades y piezas reutilizables de UI.

#### `lib/`

Contiene helpers, configuración y funciones auxiliares compartidas.

## Imágenes y optimización

El proyecto utiliza Supabase Storage para almacenar imágenes de productos.

Además, incluye un helper para comprimir y optimizar imágenes antes de guardarlas o utilizarlas, reduciendo el peso final y mejorando la carga del catálogo público.

## Variables de entorno

Crear un archivo `.env` o `.env.local` con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

El número de WhatsApp utilizado para generar pedidos desde la tienda pública actualmente se encuentra configurado en:

```txt
app/(public)/store/layout.tsx
```

```ts
const NUMERO_WHATSAPP = "5491137920744";
```

Para una versión más escalable o reutilizable, este valor podría moverse a una variable de entorno.

## Instalación

Clonar el repositorio e instalar dependencias:

```bash
pnpm i
```

Ejecutar el entorno de desarrollo:

```bash
pnpm dev
```

Generar build de producción:

```bash
pnpm build
```

Ejecutar lint:

```bash
pnpm lint
```

Formatear código:

```bash
pnpm format
```

## Deploy

El proyecto está desplegado en Vercel.

Tienda pública:

[https://ninjacamisetas.vercel.app/store](https://ninjacamisetas.vercel.app/store)

## Decisiones de producto

El sistema fue diseñado para resolver una necesidad concreta: permitir que una tienda pequeña pueda vender, controlar stock y entender su rendimiento sin depender de planillas ni procesos manuales.

Algunas decisiones importantes:

- Priorizar el dashboard privado por encima de la tienda pública.
- Mantener la compra pública simple mediante WhatsApp.
- Validar stock en ventas internas para evitar inconsistencias.
- Medir rentabilidad, no solamente ingresos.
- Controlar capital inmovilizado en inventario.
- Diseñar el sistema con una arquitectura replicable para futuros rubros.

## Posibles mejoras futuras

Estas ideas no forman parte necesariamente del alcance actual, pero marcan una posible evolución del sistema:

- Convertir el modal de venta en una pantalla POS dedicada.
- Incorporar un carrito global flotante tipo ticket de venta.
- Preparar soporte para lector de código de barras.
- Crear órdenes de compra desde la tienda pública dentro del dashboard.
- Permitir que el administrador confirme pedidos recibidos por WhatsApp o desde la web.
- Descontar stock automáticamente al confirmar una orden pública.
- Mejorar la trazabilidad entre pedido, venta y stock.
- Agregar reportes avanzados por período, producto, categoría o margen.
- Extraer una versión base neutra para reutilizar en otros comercios.

## Autor

Desarrollado por Ignacio Weppler.

Proyecto privado desarrollado como solución comercial y pieza de portfolio fullstack.