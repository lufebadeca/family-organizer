# Family Organizer

App PWA mobile-first para gestionar tareas, gastos fijos mensuales, gastos únicos y categorías-proyecto en una familia de 2 personas. Sin autenticación, persistencia en Supabase (Postgres), deploy en Vercel.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + componentes estilo shadcn/ui (Radix)
- TanStack Query (cache + optimistic updates)
- React Router
- Supabase JS (publishable key)
- `vite-plugin-pwa` (instalable en celular)
- dayjs + lucide-react

## Configuración paso a paso

### 1. Crear el proyecto en Supabase

1. Crea un proyecto en https://supabase.com.
2. Abre **SQL Editor → New query** y pega el contenido de [`supabase/schema.sql`](supabase/schema.sql). Ejecuta. Esto crea las tablas, índices y vistas.
3. (Opcional) Descomenta la sección de SEEDS al final del archivo si quieres categorías base.
4. En **Project Settings → API**, copia `URL` y la **publishable key** (o `anon` legacy en proyectos antiguos).
5. En **Authentication → Settings**, desactiva email signup (no se usa).
6. En **Database → Replication / RLS**: el script ya deja RLS deshabilitada en todas las tablas (uso personal, instancia única).

### 2. Variables de entorno

Crea `.env.local` (no commitear):

```bash
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

### 3. Instalar y correr

```bash
npm install
npm run dev
```

Abre http://localhost:5173. La primera vez:

1. Ve a **Más → Miembros** y agrega tu nombre + el de tu pareja.
2. Define el **ingreso mensual** del mes en curso.
3. (Opcional) Crea **categorías** base con el botón `+` (Hogar, Comida, Viajes, etc.).
4. Empieza a agregar gastos fijos, tareas y compras.

### 4. Build y deploy en Vercel

```bash
npm run build
```

Para deploy:

1. Crea un repositorio en GitHub con este código.
2. En Vercel, **New Project → Import**.
3. Framework preset: `Vite` (autodetectado).
4. Variables de entorno: agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Deploy.

El archivo `vercel.json` ya configura el rewrite para SPA routing.

### 5. Instalar como PWA en el celular

1. Abre la URL de Vercel en Chrome/Safari del celular.
2. **Chrome**: menú → "Agregar a pantalla de inicio".
3. **Safari**: botón compartir → "Añadir a inicio".

## Modelo de datos

```
members              tabla mínima para asignados (nombre + color + emoji)
categories           proyectos/agrupadores (con presupuesto opcional y cuota de ahorro)
tasks                tareas/quehaceres (estado, prioridad, asignado, categoría, due_date)
fixed_expenses       plantillas de gastos fijos mensuales (día de pago, link)
fixed_expense_payments   estado pagado/no pagado por (fixed_expense, year, month)
one_time_expenses    compras y gastos únicos (estado, lugar, link)
monthly_budgets      ingreso del mes (year, month)
```

Vistas:

- `v_month_summary(year, month)`: ingreso, total fijos, pagados, pendientes, únicos, balance.
- `v_category_summary`: por categoría, suma de gastos + conteo de tareas.

## Rutas

- `/` Inicio — balance del mes, próximos pagos, tareas urgentes
- `/tareas` Lista densa con filtros (estado, categoría, asignado)
- `/gastos` Tabs Fijos | Únicos | Resumen
- `/categorias` Grid de categorías con barra de presupuesto
- `/categorias/:id` Detalle con gastos y tareas de esa categoría
- `/ajustes` Miembros, ingreso mensual

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run preview` — preview del build
- `npm run typecheck` — verificación de tipos

## Notas

- La PWA cachea assets para abrir offline, pero los datos requieren conexión a Supabase.
- Todo va contra la **publishable key** con RLS deshabilitada. Si compartes la URL, comparte también el acceso a los datos. **No subir esta app a un dominio público** salvo que estés cómodo con que cualquiera con la URL pueda leer/escribir.
- Para escenarios públicos, activa RLS y agrega magic link auth con lista blanca de emails.
