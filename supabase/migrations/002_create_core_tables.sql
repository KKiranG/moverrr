create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.carriers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  contact_name text not null,
  phone text not null,
  email text not null,
  abn text,
  is_verified boolean not null default false,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'submitted', 'verified', 'rejected')),
  licence_photo_url text,
  insurance_photo_url text,
  bio text,
  profile_photo_url text,
  service_suburbs text[] default '{}',
  total_trips integer not null default 0,
  total_bookings_completed integer not null default 0,
  average_rating numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  type text not null
    check (type in ('van', 'ute', 'small_truck', 'large_truck', 'trailer')),
  make text,
  model text,
  year integer,
  rego_plate text,
  rego_state text default 'NSW',
  max_volume_m3 numeric(5,2),
  max_weight_kg numeric(7,2),
  has_tailgate boolean not null default false,
  has_blankets boolean not null default false,
  has_straps boolean not null default false,
  photo_urls text[] default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.capacity_listings (
  id uuid primary key default gen_random_uuid(),
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  origin_suburb text not null,
  origin_postcode text not null,
  origin_point geography(point, 4326) not null,
  destination_suburb text not null,
  destination_postcode text not null,
  destination_point geography(point, 4326) not null,
  route_line geography(linestring, 4326),
  route_distance_km numeric(7,2),
  detour_radius_km numeric(5,2) not null default 10,
  trip_date date not null,
  time_window text not null
    check (time_window in ('morning', 'afternoon', 'evening', 'flexible')),
  departure_earliest time,
  departure_latest time,
  space_size text not null check (space_size in ('S', 'M', 'L', 'XL')),
  available_volume_m3 numeric(5,2),
  available_weight_kg numeric(7,2),
  price_cents integer not null,
  suggested_price_cents integer,
  accepts_furniture boolean not null default true,
  accepts_boxes boolean not null default true,
  accepts_appliances boolean not null default true,
  accepts_fragile boolean not null default false,
  stairs_ok boolean not null default false,
  stairs_extra_cents integer not null default 0,
  helper_available boolean not null default false,
  helper_extra_cents integer not null default 0,
  special_notes text,
  status text not null default 'active'
    check (status in ('active', 'booked_partial', 'booked_full', 'expired', 'cancelled')),
  remaining_capacity_pct integer not null default 100
    check (remaining_capacity_pct between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text not null,
  total_bookings integer not null default 0,
  average_rating numeric(3,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.capacity_listings(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  item_description text not null,
  item_category text not null
    check (item_category in ('furniture', 'boxes', 'appliance', 'fragile', 'other')),
  item_dimensions text,
  item_weight_kg numeric(7,2),
  item_photo_urls text[] default '{}',
  needs_stairs boolean not null default false,
  needs_helper boolean not null default false,
  special_instructions text,
  pickup_address text not null,
  pickup_suburb text not null,
  pickup_postcode text not null,
  pickup_point geography(point, 4326) not null,
  pickup_access_notes text,
  pickup_contact_name text,
  pickup_contact_phone text,
  dropoff_address text not null,
  dropoff_suburb text not null,
  dropoff_postcode text not null,
  dropoff_point geography(point, 4326) not null,
  dropoff_access_notes text,
  dropoff_contact_name text,
  dropoff_contact_phone text,
  base_price_cents integer not null,
  stairs_fee_cents integer not null default 0,
  helper_fee_cents integer not null default 0,
  booking_fee_cents integer not null default 500,
  total_price_cents integer not null,
  carrier_payout_cents integer not null,
  platform_commission_cents integer not null,
  stripe_payment_intent_id text,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'authorized', 'captured', 'refunded', 'failed')),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled', 'disputed')),
  pickup_proof_photo_url text,
  delivery_proof_photo_url text,
  pickup_at timestamptz,
  delivered_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reviewer_type text not null check (reviewer_type in ('customer', 'carrier')),
  reviewer_id uuid not null,
  reviewee_id uuid not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (booking_id, reviewer_type)
);

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  raised_by text not null check (raised_by in ('customer', 'carrier')),
  raiser_id uuid not null,
  category text not null
    check (category in ('damage', 'no_show', 'late', 'wrong_item', 'overcharge', 'other')),
  description text not null,
  photo_urls text[] default '{}',
  status text not null default 'open'
    check (status in ('open', 'investigating', 'resolved', 'closed')),
  resolution_notes text,
  resolved_by uuid,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

drop trigger if exists carriers_set_updated_at on public.carriers;
create trigger carriers_set_updated_at
before update on public.carriers
for each row
execute function public.set_updated_at();

drop trigger if exists capacity_listings_set_updated_at on public.capacity_listings;
create trigger capacity_listings_set_updated_at
before update on public.capacity_listings
for each row
execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();
