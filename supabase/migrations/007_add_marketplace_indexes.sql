create index if not exists idx_booking_events_booking_id
on public.booking_events (booking_id);

create index if not exists idx_booking_events_event_type
on public.booking_events (event_type);

create index if not exists idx_analytics_events_event_name
on public.analytics_events (event_name);

create index if not exists idx_analytics_events_created_at
on public.analytics_events (created_at desc);

create index if not exists idx_waitlist_entries_created_at
on public.waitlist_entries (created_at desc);

create index if not exists idx_admin_users_user_id
on public.admin_users (user_id);
