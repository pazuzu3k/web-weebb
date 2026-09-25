alter table diario_entradas add column if not exists titulo text not null default '';

create table if not exists diario_preliminar (
  id integer primary key,
  mime text not null,
  nombre text not null,
  bytes bytea not null
);
