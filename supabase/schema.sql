-- =========================================================
-- PropPilot Take-Home
-- Supabase Database Schema + Seed Data + RLS Policies
-- =========================================================

-- This file includes:
-- 1. Database tables
-- 2. Demo agency seed records
-- 3. Demo agency-member associations
-- 4. Row Level Security policies


-- =========================================================
-- 1. Tables
-- =========================================================

create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamp with time zone default now()
);

create table public.agency_members (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (agency_id, user_id)
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'discarded')),
  created_at timestamp with time zone default now()
);


-- =========================================================
-- 2. Enable Row Level Security
-- =========================================================

alter table public.agencies enable row level security;
alter table public.agency_members enable row level security;
alter table public.contacts enable row level security;


-- =========================================================
-- 3. Seed Demo Agencies
-- =========================================================

insert into public.agencies (id, name, slug)
values
  ('fd65d341-dafc-4ec4-9d6c-e1386cee68eb', 'Dubai Homes', 'dubai-homes'),
  ('fbaf84d1-9c04-4f52-9718-e304baa4df1a', 'Luxury Estates', 'luxury-estates');


-- =========================================================
-- 4. Demo Agency Member Associations
-- =========================================================

insert into public.agency_members (agency_id, user_id)
values
  (
    'fd65d341-dafc-4ec4-9d6c-e1386cee68eb',
    '993fc7e0-2c6e-4003-a35c-66a7e4e32a8c'
  ),
  (
    'fbaf84d1-9c04-4f52-9718-e304baa4df1a',
    '549c32ee-6464-4459-acec-132f00118cd4'
  );


-- =========================================================
-- 5. RLS Policies
-- =========================================================

-- Public users need to read agencies by slug
-- so the public contact form can link submissions
-- to the correct agency.
create policy "Anyone can read agencies"
on public.agencies
for select
to anon, authenticated
using (true);


-- Authenticated agents can only read their own
-- agency membership records.
create policy "Authenticated users can read their own memberships"
on public.agency_members
for select
to authenticated
using (user_id = auth.uid());


-- Anonymous users can submit contacts through the public form.
-- They can insert contacts, but they cannot read or update contacts.
create policy "Anyone can submit contacts"
on public.contacts
for insert
to anon, authenticated
with check (true);


-- Authenticated agents can only read contacts
-- that belong to their own agency.
create policy "Agents can read contacts for their agency"
on public.contacts
for select
to authenticated
using (
  agency_id in (
    select agency_id
    from public.agency_members
    where user_id = auth.uid()
  )
);


-- Authenticated agents can only update contacts
-- that belong to their own agency.
create policy "Agents can update contacts for their agency"
on public.contacts
for update
to authenticated
using (
  agency_id in (
    select agency_id
    from public.agency_members
    where user_id = auth.uid()
  )
)
with check (
  agency_id in (
    select agency_id
    from public.agency_members
    where user_id = auth.uid()
  )
);
