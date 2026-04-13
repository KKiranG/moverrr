alter table public.customers
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_default_payment_method_id text,
  add column if not exists stripe_default_payment_method_brand text,
  add column if not exists stripe_default_payment_method_last4 text,
  add column if not exists stripe_payment_method_updated_at timestamptz;

create table if not exists public.operator_tasks (
  id uuid primary key default gen_random_uuid(),
  task_type text not null
    check (
      task_type in (
        'unmatched_sla_breach',
        'stale_trip_followup',
        'concierge_followup',
        'dispute_review',
        'verification_review',
        'payout_blocker'
      )
    ),
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'resolved', 'cancelled')),
  priority text not null default 'normal'
    check (priority in ('urgent', 'high', 'normal', 'low')),
  unmatched_request_id uuid references public.unmatched_requests (id) on delete cascade,
  listing_id uuid references public.capacity_listings (id) on delete cascade,
  booking_id uuid references public.bookings (id) on delete cascade,
  dispute_id uuid references public.disputes (id) on delete cascade,
  carrier_id uuid references public.carriers (id) on delete cascade,
  assigned_admin_user_id uuid references public.admin_users (id) on delete set null,
  corridor_key text,
  title text not null,
  blocker text,
  next_action text,
  due_at timestamptz,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_operator_tasks_status_priority
on public.operator_tasks (status, priority, created_at desc);

create index if not exists idx_operator_tasks_unmatched_request
on public.operator_tasks (unmatched_request_id);

create index if not exists idx_operator_tasks_listing
on public.operator_tasks (listing_id);

create table if not exists public.concierge_offers (
  id uuid primary key default gen_random_uuid(),
  unmatched_request_id uuid not null references public.unmatched_requests (id) on delete cascade,
  carrier_id uuid not null references public.carriers (id) on delete cascade,
  operator_task_id uuid references public.operator_tasks (id) on delete set null,
  created_by_admin_user_id uuid not null references public.admin_users (id) on delete restrict,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'declined', 'cancelled')),
  quoted_total_price_cents integer not null check (quoted_total_price_cents > 0),
  note text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_concierge_offers_unmatched_request
on public.concierge_offers (unmatched_request_id, created_at desc);

create table if not exists public.admin_action_events (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.admin_users (id) on delete restrict,
  entity_type text not null
    check (entity_type in ('unmatched_request', 'listing', 'booking', 'dispute', 'carrier', 'concierge_offer', 'operator_task')),
  entity_id uuid not null,
  action_type text not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_admin_action_events_entity
on public.admin_action_events (entity_type, entity_id, created_at desc);

create table if not exists public.matched_alert_notifications (
  id uuid primary key default gen_random_uuid(),
  unmatched_request_id uuid not null references public.unmatched_requests (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete cascade,
  carrier_id uuid references public.carriers (id) on delete cascade,
  channel text not null default 'email'
    check (channel in ('email')),
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'skipped')),
  dedupe_key text not null,
  sent_at timestamptz,
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create unique index if not exists idx_matched_alert_notifications_dedupe
on public.matched_alert_notifications (dedupe_key);

alter table public.operator_tasks enable row level security;
alter table public.concierge_offers enable row level security;
alter table public.admin_action_events enable row level security;
alter table public.matched_alert_notifications enable row level security;

drop trigger if exists operator_tasks_set_updated_at on public.operator_tasks;
create trigger operator_tasks_set_updated_at
before update on public.operator_tasks
for each row
execute function public.set_updated_at();

drop trigger if exists concierge_offers_set_updated_at on public.concierge_offers;
create trigger concierge_offers_set_updated_at
before update on public.concierge_offers
for each row
execute function public.set_updated_at();

drop policy if exists "operator_tasks_admin_read_all" on public.operator_tasks;
create policy "operator_tasks_admin_read_all"
on public.operator_tasks
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin_user
    where admin_user.user_id = auth.uid()
  )
);

drop policy if exists "operator_tasks_service_role_all" on public.operator_tasks;
create policy "operator_tasks_service_role_all"
on public.operator_tasks
for all
to service_role
using (true)
with check (true);

drop policy if exists "concierge_offers_admin_read_all" on public.concierge_offers;
create policy "concierge_offers_admin_read_all"
on public.concierge_offers
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin_user
    where admin_user.user_id = auth.uid()
  )
);

drop policy if exists "concierge_offers_service_role_all" on public.concierge_offers;
create policy "concierge_offers_service_role_all"
on public.concierge_offers
for all
to service_role
using (true)
with check (true);

drop policy if exists "admin_action_events_admin_read_all" on public.admin_action_events;
create policy "admin_action_events_admin_read_all"
on public.admin_action_events
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin_user
    where admin_user.user_id = auth.uid()
  )
);

drop policy if exists "admin_action_events_service_role_all" on public.admin_action_events;
create policy "admin_action_events_service_role_all"
on public.admin_action_events
for all
to service_role
using (true)
with check (true);

drop policy if exists "matched_alert_notifications_admin_read_all" on public.matched_alert_notifications;
create policy "matched_alert_notifications_admin_read_all"
on public.matched_alert_notifications
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin_user
    where admin_user.user_id = auth.uid()
  )
);

drop policy if exists "matched_alert_notifications_service_role_all" on public.matched_alert_notifications;
create policy "matched_alert_notifications_service_role_all"
on public.matched_alert_notifications
for all
to service_role
using (true)
with check (true);
