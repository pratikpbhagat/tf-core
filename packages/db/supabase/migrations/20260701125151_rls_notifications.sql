-- RLS policies for public.notifications_log. Rows are written exclusively by
-- server-side code (cron routes, server actions) using the service role,
-- which bypasses RLS entirely — so no INSERT policy exists for authenticated
-- users. Only admins can read the log (e.g. for delivery auditing).

create policy "notifications_log_admin_select" on public.notifications_log
  for select using (public.is_admin());
