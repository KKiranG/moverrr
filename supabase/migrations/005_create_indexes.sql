create index if not exists idx_carriers_user_id
on public.carriers (user_id);

create index if not exists idx_vehicles_carrier_id
on public.vehicles (carrier_id);

create index if not exists idx_capacity_listings_origin
on public.capacity_listings using gist (origin_point);

create index if not exists idx_capacity_listings_destination
on public.capacity_listings using gist (destination_point);

create index if not exists idx_capacity_listings_route_line
on public.capacity_listings using gist (route_line);

create index if not exists idx_capacity_listings_trip_date
on public.capacity_listings (trip_date);

create index if not exists idx_capacity_listings_status
on public.capacity_listings (status);

create index if not exists idx_capacity_listings_active
on public.capacity_listings (status, trip_date)
where status in ('active', 'booked_partial');

create index if not exists idx_bookings_listing_id
on public.bookings (listing_id);

create index if not exists idx_bookings_customer_id
on public.bookings (customer_id);

create index if not exists idx_bookings_carrier_id
on public.bookings (carrier_id);

create index if not exists idx_bookings_status
on public.bookings (status);

create index if not exists idx_reviews_booking_id
on public.reviews (booking_id);

create index if not exists idx_disputes_booking_id
on public.disputes (booking_id);

create index if not exists idx_disputes_status
on public.disputes (status);
