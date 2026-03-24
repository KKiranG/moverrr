alter table public.carriers enable row level security;
alter table public.vehicles enable row level security;
alter table public.capacity_listings enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.disputes enable row level security;

create policy "carriers_select_own"
on public.carriers
for select
using (user_id = auth.uid());

create policy "carriers_insert_own"
on public.carriers
for insert
with check (user_id = auth.uid());

create policy "carriers_update_own"
on public.carriers
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "vehicles_manage_own"
on public.vehicles
for all
using (
  carrier_id in (
    select id from public.carriers where user_id = auth.uid()
  )
)
with check (
  carrier_id in (
    select id from public.carriers where user_id = auth.uid()
  )
);

create policy "listings_public_read_active"
on public.capacity_listings
for select
using (status in ('active', 'booked_partial'));

create policy "listings_manage_own"
on public.capacity_listings
for all
using (
  carrier_id in (
    select id from public.carriers where user_id = auth.uid()
  )
)
with check (
  carrier_id in (
    select id from public.carriers where user_id = auth.uid()
  )
);

create policy "customers_select_own"
on public.customers
for select
using (user_id = auth.uid());

create policy "customers_insert_own"
on public.customers
for insert
with check (user_id = auth.uid());

create policy "customers_update_own"
on public.customers
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "bookings_customer_select_own"
on public.bookings
for select
using (
  customer_id in (
    select id from public.customers where user_id = auth.uid()
  )
);

create policy "bookings_customer_insert_own"
on public.bookings
for insert
with check (
  customer_id in (
    select id from public.customers where user_id = auth.uid()
  )
);

create policy "bookings_carrier_select_own"
on public.bookings
for select
using (
  carrier_id in (
    select id from public.carriers where user_id = auth.uid()
  )
);

create policy "bookings_carrier_update_own"
on public.bookings
for update
using (
  carrier_id in (
    select id from public.carriers where user_id = auth.uid()
  )
);

create policy "reviews_public_read"
on public.reviews
for select
using (true);

create policy "reviews_insert_completed_booking"
on public.reviews
for insert
with check (
  booking_id in (
    select b.id
    from public.bookings b
    left join public.customers cu on cu.id = b.customer_id
    left join public.carriers ca on ca.id = b.carrier_id
    where b.status = 'completed'
      and (
        cu.user_id = auth.uid()
        or ca.user_id = auth.uid()
      )
  )
);

create policy "disputes_involved_select"
on public.disputes
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

create policy "disputes_involved_insert"
on public.disputes
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
