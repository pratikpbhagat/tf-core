-- FAQ content for the public service detail page (design doc §2.1).
-- Data-driven for the same reason required_documents is: admin can edit it
-- (Phase 6) without a code deploy.
alter table public.services
  add column faq jsonb not null default '[]'::jsonb;

comment on column public.services.faq is 'Array of { question, answer } objects rendered on the service detail page.';
