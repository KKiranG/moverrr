create table if not exists public.move_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  status text not null default 'submitted' check (
    status in ('draft', 'submitted', 'matched', 'booking_requested', 'booked', 'expired', 'cancelled')
  ),
  item_description text not null,
  item_category text not null check (
    item_category in ('furniture', 'boxes', 'appliance', 'fragile', 'other')
  ),
  item_size_class text check (item_size_class in ('S', 'M', 'L', 'XL')),
  item_weight_band text check (
    item_weight_band in ('under_20kg', '20_to_50kg', '50_to_100kg', 'over_100kg')
  ),
  item_dimensions text,
  item_weight_kg numeric,
  item_photo_urls text[] not null default '{}',
  pickup_address text not null,
  pickup_suburb text not null,
  pickup_postcode text not null,
  pickup_point geography(point, 4326) not null,
  pickup_access_notes text,
  dropoff_address text not null,
  dropoff_suburb text not null,
  dropoff_postcode text not null,
  dropoff_point geography(point, 4326) not null,
  dropoff_access_notes text,
  preferred_date date,
  preferred_time_window text check (
    preferred_time_window in ('morning', 'afternoon', 'evening', 'flexible')
  ),
  needs_stairs boolean not null default false,
  needs_helper boolean not null default false,
  special_instructions text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  move_request_id uuid not null references public.move_requests(id) on delete cascade,
  listing_id uuid not null references public.capacity_listings(id) on delete cascade,
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  status text not null default 'active' check (
    status in ('active', 'selected', 'expired', 'rejected')
  ),
  match_class text not null check (
    match_class in ('direct', 'near_pickup', 'near_dropoff', 'nearby_date', 'partial_route', 'needs_approval')
  ),
  fit_confidence text not null check (
    fit_confidence in ('likely_fits', 'review_photos', 'needs_approval')
  ),
  match_explanation text not null,
  ranking_score integer not null default 0,
  pickup_distance_km numeric,
  dropoff_distance_km numeric,
  detour_distance_km numeric,
  base_price_cents integer not null check (base_price_cents >= 0),
  stairs_fee_cents integer not null default 0 check (stairs_fee_cents >= 0),
  helper_fee_cents integer not null default 0 check (helper_fee_cents >= 0),
  booking_fee_cents integer not null default 0 check (booking_fee_cents >= 0),
  total_price_cents integer not null check (total_price_cents >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (move_request_id, listing_id)
);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  move_request_id uuid not null references public.move_requests(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  listing_id uuid not null references public.capacity_listings(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  request_group_id uuid,
  status text not null default 'pending' check (
    status in ('pending', 'clarification_requested', 'accepted', 'declined', 'expired', 'revoked', 'cancelled')
  ),
  requested_total_price_cents integer not null check (requested_total_price_cents >= 0),
  response_deadline_at timestamptz not null,
  clarification_reason text check (
    clarification_reason in ('item_details', 'access_details', 'timing', 'photos', 'other')
  ),
  clarification_message text,
  customer_response text,
  responded_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.unmatched_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  move_request_id uuid references public.move_requests(id) on delete set null,
  status text not null default 'active' check (
    status in ('active', 'notified', 'matched', 'expired', 'cancelled')
  ),
  pickup_suburb text not null,
  pickup_postcode text,
  pickup_point geography(point, 4326) not null,
  dropoff_suburb text not null,
  dropoff_postcode text,
  dropoff_point geography(point, 4326) not null,
  item_category text check (
    item_category in ('furniture', 'boxes', 'appliance', 'fragile', 'other')
  ),
  item_description text not null,
  preferred_date date,
  notify_email text,
  last_notified_at timestamptz,
  notification_count integer not null default 0,
  matched_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_move_requests_customer_status
on public.move_requests (customer_id, status, created_at desc);

create index if not exists idx_move_requests_pickup_point
on public.move_requests using gist (pickup_point);

create index if not exists idx_move_requests_dropoff_point
on public.move_requests using gist (dropoff_point);

create index if not exists idx_offers_move_request_status
on public.offers (move_request_id, status, ranking_score desc);

create index if not exists idx_offers_listing_carrier
on public.offers (listing_id, carrier_id, created_at desc);

create index if not exists idx_booking_requests_customer_status
on public.booking_requests (customer_id, status, response_deadline_at asc);

create index if not exists idx_booking_requests_carrier_status
on public.booking_requests (carrier_id, status, response_deadline_at asc);

create index if not exists idx_booking_requests_group
on public.booking_requests (request_group_id)
where request_group_id is not null;

create index if not exists idx_unmatched_requests_customer_status
on public.unmatched_requests (customer_id, status, expires_at desc);

create index if not exists idx_unmatched_requests_pickup_point
on public.unmatched_requests using gist (pickup_point);

create index if not exists idx_unmatched_requests_dropoff_point
on public.unmatched_requests using gist (dropoff_point);

alter table public.move_requests enable row level security;
alter table public.offers enable row level security;
alter table public.booking_requests enable row level security;
alter table public.unmatched_requests enable row level security;

drop trigger if exists move_requests_set_updated_at on public.move_requests;
create trigger move_requests_set_updated_at
before update on public.move_requests
for each row
execute function public.set_updated_at();

drop trigger if exists booking_requests_set_updated_at on public.booking_requests;
create trigger booking_requests_set_updated_at
before update on public.booking_requests
for each row
execute function public.set_updated_at();

drop trigger if exists unmatched_requests_set_updated_at on public.unmatched_requests;
create trigger unmatched_requests_set_updated_at
before update on public.unmatched_requests
for each row
execute function public.set_updated_at();

drop policy if exists "move_requests_manage_own" on public.move_requests;
create policy "move_requests_manage_own"
on public.move_requests
for all
to authenticated
using (
  exists (
    select 1
    from public.customers customer_row
    where customer_row.id = move_requests.customer_id
      and customer_row.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.customers customer_row
    where customer_row.id = move_requests.customer_id
      and customer_row.user_id = auth.uid()
  )
);

drop policy if exists "move_requests_admin_read_all" on public.move_requests;
create policy "move_requests_admin_read_all"
on public.move_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin_user
    where admin_user.user_id = auth.uid()
  )
);

drop policy if exists "move_requests_service_role_all" on public.move_requests;
create policy "move_requests_service_role_all"
on public.move_requests
for all
to service_role
using (true)
with check (true);

drop policy if exists "offers_customer_select_own" on public.offers;
create policy "offers_customer_select_own"
on public.offers
for select
to authenticated
using (
  exists (
    select 1
    from public.move_requests move_request
    join public.customers customer_row
      on customer_row.id = move_request.customer_id
    where move_request.id = offers.move_request_id
      and customer_row.user_id = auth.uid()
  )
);

drop policy if exists "offers_carrier_select_own" on public.offers;
create policy "offers_carrier_select_own"
on public.offers
for select
to authenticated
using (
  exists (
    select 1
    from public.carriers carrier_row
    where carrier_row.id = offers.carrier_id
      and carrier_row.user_id = auth.uid()
  )
);

drop policy if exists "offers_admin_read_all" on public.offers;
create policy "offers_admin_read_all"
on public.offers
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin_user
    where admin_user.user_id = auth.uid()
  )
);

drop policy if exists "offers_service_role_all" on public.offers;
create policy "offers_service_role_all"
on public.offers
for all
to service_role
using (true)
with check (true);

drop policy if exists "booking_requests_customer_select_own" on public.booking_requests;
create policy "booking_requests_customer_select_own"
on public.booking_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.customers customer_row
    where customer_row.id = booking_requests.customer_id
      and customer_row.user_id = auth.uid()
  )
);

drop policy if exists "booking_requests_customer_insert_own" on public.booking_requests;
create policy "booking_requests_customer_insert_own"
on public.booking_requests
for insert
to authenticated
with check (
  exists (
    select 1
    from public.customers customer_row
    where customer_row.id = booking_requests.customer_id
      and customer_row.user_id = auth.uid()
  )
);

drop policy if exists "booking_requests_carrier_select_own" on public.booking_requests;
create policy "booking_requests_carrier_select_own"
on public.booking_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.carriers carrier_row
    where carrier_row.id = booking_requests.carrier_id
      and carrier_row.user_id = auth.uid()
  )
);

drop policy if exists "booking_requests_carrier_update_own" on public.booking_requests;
create policy "booking_requests_carrier_update_own"
on public.booking_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.carriers carrier_row
    where carrier_row.id = booking_requests.carrier_id
      and carrier_row.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.carriers carrier_row
    where carrier_row.id = booking_requests.carrier_id
      and carrier_row.user_id = auth.uid()
  )
);

drop policy if exists "booking_requests_admin_read_all" on public.booking_requests;
create policy "booking_requests_admin_read_all"
on public.booking_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin_user
    where admin_user.user_id = auth.uid()
  )
);

drop policy if exists "booking_requests_service_role_all" on public.booking_requests;
create policy "booking_requests_service_role_all"
on public.booking_requests
for all
to service_role
using (true)
with check (true);

drop policy if exists "unmatched_requests_manage_own" on public.unmatched_requests;
create policy "unmatched_requests_manage_own"
on public.unmatched_requests
for all
to authenticated
using (
  exists (
    select 1
    from public.customers customer_row
    where customer_row.id = unmatched_requests.customer_id
      and customer_row.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.customers customer_row
    where customer_row.id = unmatched_requests.customer_id
      and customer_row.user_id = auth.uid()
  )
);

drop policy if exists "unmatched_requests_admin_read_all" on public.unmatched_requests;
create policy "unmatched_requests_admin_read_all"
on public.unmatched_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin_user
    where admin_user.user_id = auth.uid()
  )
);

drop policy if exists "unmatched_requests_service_role_all" on public.unmatched_requests;
create policy "unmatched_requests_service_role_all"
on public.unmatched_requests
for all
to service_role
using (true)
with check (true);
