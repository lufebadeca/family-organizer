-- Family Organizer · schema completo
-- Ejecuta este archivo en el SQL editor de Supabase.
-- Sin auth: RLS deshabilitada en todas las tablas.

create extension if not exists "pgcrypto";

-- =====================
-- TABLAS
-- =====================

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#0ea5e9',
  emoji text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'Folder',
  color text not null default '#0ea5e9',
  estimated_budget_cop bigint,
  monthly_savings_quota_cop bigint,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text,
  priority smallint not null default 2 check (priority between 1 and 3),
  status text not null default 'pending' check (status in ('pending', 'done')),
  due_date date,
  assignee_id uuid references public.members(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_due_idx on public.tasks (due_date);
create index if not exists tasks_category_idx on public.tasks (category_id);

create table if not exists public.fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount_cop bigint not null check (amount_cop >= 0),
  payment_day smallint not null check (payment_day between 1 and 31),
  payment_link text,
  category_id uuid references public.categories(id) on delete set null,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists fixed_expenses_active_idx on public.fixed_expenses (active);

create table if not exists public.fixed_expense_payments (
  id uuid primary key default gen_random_uuid(),
  fixed_expense_id uuid not null references public.fixed_expenses(id) on delete cascade,
  year int not null,
  month smallint not null check (month between 1 and 12),
  paid boolean not null default false,
  paid_at timestamptz,
  paid_amount_cop bigint,
  created_at timestamptz not null default now(),
  unique (fixed_expense_id, year, month)
);

create index if not exists fixed_expense_payments_period_idx
  on public.fixed_expense_payments (year, month);

create table if not exists public.one_time_expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  amount_cop bigint not null check (amount_cop >= 0),
  expense_date date not null default current_date,
  status text not null default 'planned' check (status in ('planned', 'purchased')),
  purchase_link text,
  location text,
  assignee_id uuid references public.members(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  include_in_monthly boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists one_time_expenses_category_idx
  on public.one_time_expenses (category_id);
create index if not exists one_time_expenses_date_idx
  on public.one_time_expenses (expense_date);

create table if not exists public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month smallint not null check (month between 1 and 12),
  income_cop bigint not null check (income_cop >= 0),
  notes text,
  created_at timestamptz not null default now(),
  unique (year, month)
);

-- =====================
-- VISTAS
-- =====================

create or replace view public.v_month_summary as
with periods as (
  select distinct year, month from public.monthly_budgets
  union
  select extract(year from current_date)::int, extract(month from current_date)::int
  union
  select year, month from public.fixed_expense_payments
  union
  select extract(year from expense_date)::int,
         extract(month from expense_date)::int
    from public.one_time_expenses
),
income as (
  select year, month, income_cop from public.monthly_budgets
),
fixed_totals as (
  select p.year,
         p.month,
         coalesce(sum(fe.amount_cop) filter (where fe.active), 0)::bigint as fixed_total_cop
  from periods p
  left join public.fixed_expenses fe on fe.active = true
  group by p.year, p.month
),
fixed_paid as (
  select fp.year,
         fp.month,
         coalesce(
           sum(coalesce(fp.paid_amount_cop, fe.amount_cop)) filter (where fp.paid),
           0
         )::bigint as fixed_paid_cop
  from public.fixed_expense_payments fp
  join public.fixed_expenses fe on fe.id = fp.fixed_expense_id
  group by fp.year, fp.month
),
one_time as (
  select extract(year from expense_date)::int as year,
         extract(month from expense_date)::int as month,
         coalesce(sum(amount_cop) filter (where include_in_monthly), 0)::bigint as one_time_total_cop
  from public.one_time_expenses
  group by 1, 2
)
select p.year,
       p.month,
       coalesce(i.income_cop, 0)::bigint as income_cop,
       coalesce(ft.fixed_total_cop, 0)::bigint as fixed_total_cop,
       coalesce(fp.fixed_paid_cop, 0)::bigint as fixed_paid_cop,
       (coalesce(ft.fixed_total_cop, 0) - coalesce(fp.fixed_paid_cop, 0))::bigint as fixed_pending_cop,
       coalesce(ot.one_time_total_cop, 0)::bigint as one_time_total_cop,
       (coalesce(i.income_cop, 0)
        - coalesce(ft.fixed_total_cop, 0)
        - coalesce(ot.one_time_total_cop, 0))::bigint as balance_cop
from periods p
left join income i on i.year = p.year and i.month = p.month
left join fixed_totals ft on ft.year = p.year and ft.month = p.month
left join fixed_paid fp on fp.year = p.year and fp.month = p.month
left join one_time ot on ot.year = p.year and ot.month = p.month;

create or replace view public.v_category_summary as
with one_time_per_cat as (
  select category_id, coalesce(sum(amount_cop), 0)::bigint as one_time_cop
  from public.one_time_expenses
  where category_id is not null
  group by category_id
),
fixed_per_cat as (
  select category_id, coalesce(sum(amount_cop) filter (where active), 0)::bigint as fixed_cop
  from public.fixed_expenses
  where category_id is not null
  group by category_id
),
tasks_per_cat as (
  select category_id,
         count(*) filter (where status = 'pending')::int as task_pending_count,
         count(*) filter (where status = 'done')::int as task_done_count
  from public.tasks
  where category_id is not null
  group by category_id
)
select c.id as category_id,
       c.name,
       c.color,
       c.icon,
       c.estimated_budget_cop,
       c.monthly_savings_quota_cop,
       (coalesce(ot.one_time_cop, 0) + coalesce(fc.fixed_cop, 0))::bigint as spent_cop,
       coalesce(tp.task_pending_count, 0) as task_pending_count,
       coalesce(tp.task_done_count, 0) as task_done_count
from public.categories c
left join one_time_per_cat ot on ot.category_id = c.id
left join fixed_per_cat fc on fc.category_id = c.id
left join tasks_per_cat tp on tp.category_id = c.id
where c.archived = false;

-- =====================
-- RLS (deshabilitado, uso personal con anon key)
-- =====================

alter table public.members disable row level security;
alter table public.categories disable row level security;
alter table public.tasks disable row level security;
alter table public.fixed_expenses disable row level security;
alter table public.fixed_expense_payments disable row level security;
alter table public.one_time_expenses disable row level security;
alter table public.monthly_budgets disable row level security;

-- =====================
-- SEEDS opcionales (descomenta si quieres categorías base)
-- =====================

-- insert into public.categories (name, icon, color) values
--   ('Hogar',   'Home',       '#0ea5e9'),
--   ('Comida',  'UtensilsCrossed', '#22c55e'),
--   ('Ahorros', 'PiggyBank',  '#a855f7');
