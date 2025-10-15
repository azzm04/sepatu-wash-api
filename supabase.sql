create type status_enum as enum ('Menunggu','Proses','Selesai','Diambil');

-- 2) Tabel utama
create table if not exists public.wash_items (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  brand text,
  size text,
  service_type text, -- cuci biasa, deep clean, repaint, dsb.
  status status_enum not null default 'Menunggu',
  drop_off_date date default current_date,
  pick_up_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) Trigger updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_updated_at on public.wash_items;
create trigger trg_set_updated_at
before update on public.wash_items
for each row
execute function set_updated_at();

-- 4) (Opsional) Row Level Security
alter table public.wash_items enable row level security;

create policy "allow read for anon" on public.wash_items
for select to anon using (true);
