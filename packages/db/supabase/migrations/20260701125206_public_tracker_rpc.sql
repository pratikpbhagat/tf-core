-- Narrow, anon-callable RPC backing the public filing-status tracker
-- (no login required). This is the ONLY path anon ever has to filing data —
-- there are no direct anon grants on filings/documents/etc anywhere in this
-- schema. The return type is fixed at function-definition time, so it's
-- structurally impossible for this endpoint to leak PAN, Aadhaar, or
-- financial figures regardless of future application-code mistakes.

create function public.get_filing_status_by_tracking_code(p_tracking_code text)
returns table (
  tracking_code text,
  status public.filing_status,
  assessment_year text,
  service_name text,
  e_verified boolean,
  created_at timestamptz,
  timeline jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    f.tracking_code,
    f.status,
    f.assessment_year,
    s.name as service_name,
    f.e_verified,
    f.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('status', h.status, 'note', h.note, 'created_at', h.created_at)
          order by h.created_at
        )
        from public.filing_status_history h
        where h.filing_id = f.id and h.is_client_visible = true
      ),
      '[]'::jsonb
    ) as timeline
  from public.filings f
  join public.services s on s.id = f.service_id
  where f.tracking_code = p_tracking_code;
$$;

revoke all on function public.get_filing_status_by_tracking_code(text) from public;
grant execute on function public.get_filing_status_by_tracking_code(text) to anon, authenticated;
