create or replace function public.set_listing_expiry()
returns trigger
language plpgsql
as $$
begin
  new.expires_at = (new.trip_date::timestamp + interval '1 day' - interval '1 second');
  return new;
end;
$$;

drop trigger if exists capacity_listings_set_expiry on public.capacity_listings;
create trigger capacity_listings_set_expiry
before insert or update of trip_date on public.capacity_listings
for each row
execute function public.set_listing_expiry();

create or replace function public.find_matching_listings(
  p_pickup_lat float,
  p_pickup_lng float,
  p_dropoff_lat float,
  p_dropoff_lng float,
  p_date date default null,
  p_category text default null,
  p_limit integer default 20
)
returns table (
  listing_id uuid,
  carrier_id uuid,
  carrier_name text,
  carrier_rating numeric,
  vehicle_type text,
  origin_suburb text,
  destination_suburb text,
  trip_date date,
  time_window text,
  space_size text,
  price_cents integer,
  detour_radius_km numeric,
  pickup_distance_km float,
  dropoff_distance_km float,
  match_score float
)
language plpgsql
as $$
begin
  return query
  select
    cl.id as listing_id,
    c.id as carrier_id,
    c.business_name as carrier_name,
    c.average_rating as carrier_rating,
    v.type as vehicle_type,
    cl.origin_suburb,
    cl.destination_suburb,
    cl.trip_date,
    cl.time_window,
    cl.space_size,
    cl.price_cents,
    cl.detour_radius_km,
    st_distance(
      cl.origin_point,
      st_setsrid(st_makepoint(p_pickup_lng, p_pickup_lat), 4326)::geography
    ) / 1000.0 as pickup_distance_km,
    st_distance(
      cl.destination_point,
      st_setsrid(st_makepoint(p_dropoff_lng, p_dropoff_lat), 4326)::geography
    ) / 1000.0 as dropoff_distance_km,
    (
      (100.0 - least(
        st_distance(
          cl.origin_point,
          st_setsrid(st_makepoint(p_pickup_lng, p_pickup_lat), 4326)::geography
        ) / 1000.0,
        50.0
      )) * 0.35
      +
      (100.0 - least(
        st_distance(
          cl.destination_point,
          st_setsrid(st_makepoint(p_dropoff_lng, p_dropoff_lat), 4326)::geography
        ) / 1000.0,
        50.0
      )) * 0.35
      +
      (c.average_rating * 4.0) * 0.20
      +
      (100.0 - least(cl.price_cents / 100.0, 100.0)) * 0.10
    ) as match_score
  from public.capacity_listings cl
  join public.carriers c on c.id = cl.carrier_id
  join public.vehicles v on v.id = cl.vehicle_id
  where
    cl.status in ('active', 'booked_partial')
    and c.is_verified = true
    and cl.trip_date >= current_date
    and st_dwithin(
      cl.origin_point,
      st_setsrid(st_makepoint(p_pickup_lng, p_pickup_lat), 4326)::geography,
      cl.detour_radius_km * 1000
    )
    and st_dwithin(
      cl.destination_point,
      st_setsrid(st_makepoint(p_dropoff_lng, p_dropoff_lat), 4326)::geography,
      cl.detour_radius_km * 1000
    )
    and (p_date is null or cl.trip_date = p_date)
    and (
      p_category is null
      or (p_category = 'furniture' and cl.accepts_furniture)
      or (p_category = 'boxes' and cl.accepts_boxes)
      or (p_category = 'appliance' and cl.accepts_appliances)
      or (p_category = 'fragile' and cl.accepts_fragile)
      or (p_category = 'other')
    )
  order by match_score desc
  limit p_limit;
end;
$$;
