-- diario del peldaño 55. unowned: presencia, no identidades.
create table if not exists diario_entradas (
  id serial primary key,
  texto text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists diario_archivos (
  id serial primary key,
  entrada_id integer not null references diario_entradas(id) on delete cascade,
  kind text not null,
  mime text not null,
  nombre text not null,
  bytes bytea not null
);

create index if not exists diario_archivos_entrada_idx
  on diario_archivos (entrada_id);
