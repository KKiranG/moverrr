alter table public.carriers
  add column if not exists stripe_account_id text,
  add column if not exists stripe_onboarding_complete boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists verification_submitted_at timestamptz,
  add column if not exists verified_at timestamptz,
  add column if not exists verification_notes text;

alter table public.capacity_listings
  drop constraint if exists capacity_listings_status_check;

alter table public.capacity_listings
  add constraint capacity_listings_status_check
  check (status in ('draft', 'active', 'booked_partial', 'booked_full', 'expired', 'cancelled'));

alter table public.bookings
  add column if not exists customer_confirmed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text;

create table if not exists public.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  event_type text not null,
  actor_user_id uuid,
  actor_role text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  user_id uuid,
  session_id text,
  pathname text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  from_location text not null,
  to_location text not null,
  item_category text not null,
  preferred_date date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'account_type', 'customer') = 'customer' then
    insert into public.customers (
      user_id,
      full_name,
      phone,
      email
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
      coalesce(new.raw_user_meta_data ->> 'phone', 'unknown'),
      new.email
    )
    on conflict (user_id) do nothing;
  end if;

  if lower(coalesce(new.email, '')) = any (
    string_to_array(lower(coalesce(current_setting('app.settings.admin_emails', true), '')), ',')
  ) then
    insert into public.admin_users (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.booking_events enable row level security;
alter table public.analytics_events enable row level security;
alter table public.waitlist_entries enable row level security;
alter table public.admin_users enable row level security;

create policy "booking_events_involved_select"
on public.booking_events
for select
using (
  booking_id in (
    select b.id
    from public.bookings b
    left join public.customers cu on cu.id = b.customer_id
    left join public.carriers ca on ca.id = b.carrier_id
    where cu.user_id = auth.uid() or ca.user_id = auth.uid()
  )
);

create policy "booking_events_involved_insert"
on public.booking_events
for insert
with check (
  booking_id in (
    select b.id
    from public.bookings b
    left join public.customers cu on cu.id = b.customer_id
    left join public.carriers ca on ca.id = b.carrier_id
    where cu.user_id = auth.uid() or ca.user_id = auth.uid()
  )
);

create policy "analytics_insert_authenticated"
on public.analytics_events
for insert
with check (true);

create policy "waitlist_insert_public"
on public.waitlist_entries
for insert
with check (true);

create policy "admin_users_select_self"
on public.admin_users
for select
using (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values
  ('carrier-documents', 'carrier-documents', false),
  ('vehicle-photos', 'vehicle-photos', false),
  ('item-photos', 'item-photos', false),
  ('proof-photos', 'proof-photos', false)
on conflict (id) do nothing;

create policy "authenticated_upload_carrier_documents"
on storage.objects
for insert
to authenticated
with check (bucket_id in ('carrier-documents', 'vehicle-photos', 'item-photos', 'proof-photos'));

create policy "authenticated_read_own_private_objects"
on storage.objects
for select
to authenticated
using (bucket_id in ('carrier-documents', 'vehicle-photos', 'item-photos', 'proof-photos'));
