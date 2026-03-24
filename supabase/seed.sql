do $$
declare
  carrier_user_id uuid;
  customer_user_id uuid;
  seeded_carrier_id uuid;
  seeded_vehicle_id uuid;
  seeded_customer_id uuid;
  seeded_listing_id uuid;
begin
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'carrier@example.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"account_type":"carrier","full_name":"Seed Carrier","phone":"+61 400 000 001"}'::jsonb,
    now(),
    now()
  )
  on conflict (email) do update
    set raw_user_meta_data = excluded.raw_user_meta_data,
        updated_at = now()
  returning id into carrier_user_id;

  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'customer@example.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"account_type":"customer","full_name":"Seed Customer","phone":"+61 400 000 002"}'::jsonb,
    now(),
    now()
  )
  on conflict (email) do update
    set raw_user_meta_data = excluded.raw_user_meta_data,
        updated_at = now()
  returning id into customer_user_id;

  insert into public.carriers (
    user_id,
    business_name,
    contact_name,
    phone,
    email,
    is_verified,
    verification_status,
    verification_submitted_at,
    verified_at,
    stripe_onboarding_complete,
    onboarding_completed_at,
    bio,
    service_suburbs
  )
  values (
    carrier_user_id,
    'Seeded Sydney Backloads',
    'Seed Carrier',
    '+61 400 000 001',
    'carrier@example.com',
    true,
    'verified',
    now(),
    now(),
    true,
    now(),
    'Seed carrier for local MVP demos.',
    array['Penrith', 'Parramatta', 'Bondi']
  )
  on conflict (user_id) do update
    set business_name = excluded.business_name,
        contact_name = excluded.contact_name,
        phone = excluded.phone,
        email = excluded.email,
        is_verified = excluded.is_verified,
        verification_status = excluded.verification_status,
        verification_submitted_at = excluded.verification_submitted_at,
        verified_at = excluded.verified_at,
        stripe_onboarding_complete = excluded.stripe_onboarding_complete,
        onboarding_completed_at = excluded.onboarding_completed_at,
        bio = excluded.bio,
        service_suburbs = excluded.service_suburbs
  returning id into seeded_carrier_id;

  select id
  into seeded_vehicle_id
  from public.vehicles
  where carrier_id = seeded_carrier_id
    and is_active = true
  order by created_at
  limit 1;

  if seeded_vehicle_id is null then
    insert into public.vehicles (
      carrier_id,
      type,
      make,
      model,
      rego_plate,
      max_volume_m3,
      max_weight_kg,
      has_blankets,
      has_straps,
      is_active
    )
    values (
      seeded_carrier_id,
      'small_truck',
      'Isuzu',
      'NLR',
      'SEED-001',
      8,
      1200,
      true,
      true,
      true
    )
    returning id into seeded_vehicle_id;
  else
    update public.vehicles
    set type = 'small_truck',
        make = 'Isuzu',
        model = 'NLR',
        rego_plate = 'SEED-001',
        max_volume_m3 = 8,
        max_weight_kg = 1200,
        has_blankets = true,
        has_straps = true,
        is_active = true
    where id = seeded_vehicle_id;
  end if;

  insert into public.customers (
    user_id,
    full_name,
    phone,
    email
  )
  values (
    customer_user_id,
    'Seed Customer',
    '+61 400 000 002',
    'customer@example.com'
  )
  on conflict (user_id) do update
    set full_name = excluded.full_name,
        phone = excluded.phone,
        email = excluded.email
  returning id into seeded_customer_id;

  insert into public.capacity_listings (
    id,
    carrier_id,
    vehicle_id,
    origin_suburb,
    origin_postcode,
    origin_point,
    destination_suburb,
    destination_postcode,
    destination_point,
    route_distance_km,
    detour_radius_km,
    trip_date,
    time_window,
    space_size,
    available_volume_m3,
    available_weight_kg,
    price_cents,
    suggested_price_cents,
    accepts_furniture,
    accepts_boxes,
    accepts_appliances,
    accepts_fragile,
    stairs_ok,
    helper_available,
    special_notes,
    remaining_capacity_pct,
    status
  )
  values (
    '33333333-3333-3333-3333-333333333333',
    seeded_carrier_id,
    seeded_vehicle_id,
    'Penrith',
    '2750',
    st_setsrid(st_makepoint(150.6942, -33.7511), 4326)::geography,
    'Bondi',
    '2026',
    st_setsrid(st_makepoint(151.2743, -33.8915), 4326)::geography,
    42,
    15,
    current_date + 2,
    'afternoon',
    'L',
    2.5,
    250,
    8500,
    9800,
    true,
    true,
    true,
    false,
    true,
    true,
    'Best for marketplace pickups and single bulky items.',
    60,
    'active'
  )
  on conflict (id) do update
    set carrier_id = excluded.carrier_id,
        vehicle_id = excluded.vehicle_id,
        origin_suburb = excluded.origin_suburb,
        origin_postcode = excluded.origin_postcode,
        origin_point = excluded.origin_point,
        destination_suburb = excluded.destination_suburb,
        destination_postcode = excluded.destination_postcode,
        destination_point = excluded.destination_point,
        route_distance_km = excluded.route_distance_km,
        detour_radius_km = excluded.detour_radius_km,
        trip_date = excluded.trip_date,
        time_window = excluded.time_window,
        space_size = excluded.space_size,
        available_volume_m3 = excluded.available_volume_m3,
        available_weight_kg = excluded.available_weight_kg,
        price_cents = excluded.price_cents,
        suggested_price_cents = excluded.suggested_price_cents,
        accepts_furniture = excluded.accepts_furniture,
        accepts_boxes = excluded.accepts_boxes,
        accepts_appliances = excluded.accepts_appliances,
        accepts_fragile = excluded.accepts_fragile,
        stairs_ok = excluded.stairs_ok,
        helper_available = excluded.helper_available,
        special_notes = excluded.special_notes,
        remaining_capacity_pct = excluded.remaining_capacity_pct,
        status = excluded.status
  returning id into seeded_listing_id;

  insert into public.bookings (
    id,
    listing_id,
    customer_id,
    carrier_id,
    item_description,
    item_category,
    item_photo_urls,
    needs_stairs,
    needs_helper,
    pickup_address,
    pickup_suburb,
    pickup_postcode,
    pickup_point,
    dropoff_address,
    dropoff_suburb,
    dropoff_postcode,
    dropoff_point,
    base_price_cents,
    stairs_fee_cents,
    helper_fee_cents,
    booking_fee_cents,
    total_price_cents,
    carrier_payout_cents,
    platform_commission_cents,
    payment_status,
    status
  )
  values (
    '44444444-4444-4444-4444-444444444444',
    seeded_listing_id,
    seeded_customer_id,
    seeded_carrier_id,
    'Three-seat sofa',
    'furniture',
    '{}',
    false,
    false,
    'Penrith NSW 2750',
    'Penrith',
    '2750',
    st_setsrid(st_makepoint(150.6942, -33.7511), 4326)::geography,
    'Bondi NSW 2026',
    'Bondi',
    '2026',
    st_setsrid(st_makepoint(151.2743, -33.8915), 4326)::geography,
    8500,
    0,
    0,
    500,
    9000,
    7225,
    1275,
    'authorized',
    'confirmed'
  )
  on conflict (id) do update
    set listing_id = excluded.listing_id,
        customer_id = excluded.customer_id,
        carrier_id = excluded.carrier_id,
        item_description = excluded.item_description,
        item_category = excluded.item_category,
        item_photo_urls = excluded.item_photo_urls,
        needs_stairs = excluded.needs_stairs,
        needs_helper = excluded.needs_helper,
        pickup_address = excluded.pickup_address,
        pickup_suburb = excluded.pickup_suburb,
        pickup_postcode = excluded.pickup_postcode,
        pickup_point = excluded.pickup_point,
        dropoff_address = excluded.dropoff_address,
        dropoff_suburb = excluded.dropoff_suburb,
        dropoff_postcode = excluded.dropoff_postcode,
        dropoff_point = excluded.dropoff_point,
        base_price_cents = excluded.base_price_cents,
        stairs_fee_cents = excluded.stairs_fee_cents,
        helper_fee_cents = excluded.helper_fee_cents,
        booking_fee_cents = excluded.booking_fee_cents,
        total_price_cents = excluded.total_price_cents,
        carrier_payout_cents = excluded.carrier_payout_cents,
        platform_commission_cents = excluded.platform_commission_cents,
        payment_status = excluded.payment_status,
        status = excluded.status;
end;
$$;
