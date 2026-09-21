-- Category master data used to organize products.
--
-- Categories support a hierarchical structure through parent_id.

create table if not exists public.categories (

  id integer generated always as identity primary key,

  name varchar(100) not null,

  description varchar(500),

  parent_id integer,

  is_active boolean not null default true,

  created_by integer not null,

  created_on timestamptz not null default now(),

  modified_by integer,

  modified_on timestamptz,

  constraint categories_parent_id_fkey
    foreign key (parent_id)
    references public.categories(id)
    on update restrict
    on delete restrict,

  constraint categories_name_required_chk
    check (char_length(trim(name)) > 0)

);

comment on table public.categories is
  'Category master data used to organize products. Categories support a hierarchical structure through parent_id.';

comment on column public.categories.parent_id is
  'References the parent category for hierarchical category structure.';

comment on column public.categories.is_active is
  'Indicates whether the category is currently active.';

comment on column public.categories.created_by is
  'User ID of the user who created the category.';

comment on column public.categories.modified_by is
  'User ID of the user who last modified the category.';