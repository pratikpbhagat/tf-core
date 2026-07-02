-- Local-dev-only seed data. Loaded automatically by `supabase db reset`
-- (see supabase/config.toml [db.seed]). Everything here is illustrative
-- portfolio content, not real tax guidance — see design doc §9.

-- ---------------------------------------------------------------------------
-- Demo auth users (client / preparer / admin)
-- Password for all three: "password123" (local dev only, never used anywhere real).
-- The handle_new_auth_user trigger creates the matching public.users row
-- automatically (defaulting to role='client'); we promote two of them below.
-- ---------------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated', 'client@taxflow.test',
    crypt('password123', gen_salt('bf')),
    now(), now(),
    '{"provider":"email","providers":["email"]}', '{"name":"Asha Kulkarni"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated', 'preparer@taxflow.test',
    crypt('password123', gen_salt('bf')),
    now(), now(),
    '{"provider":"email","providers":["email"]}', '{"name":"CA Rohan Mehta"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated', 'authenticated', 'admin@taxflow.test',
    crypt('password123', gen_salt('bf')),
    now(), now(),
    '{"provider":"email","providers":["email"]}', '{"name":"Priya Nair"}',
    now(), now(), '', '', '', ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   '{"sub":"11111111-1111-1111-1111-111111111111","email":"client@taxflow.test"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   '{"sub":"22222222-2222-2222-2222-222222222222","email":"preparer@taxflow.test"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   '{"sub":"33333333-3333-3333-3333-333333333333","email":"admin@taxflow.test"}', 'email', now(), now(), now())
on conflict do nothing;

update public.users set role = 'preparer' where id = '22222222-2222-2222-2222-222222222222';
update public.users set role = 'admin' where id = '33333333-3333-3333-3333-333333333333';

-- ---------------------------------------------------------------------------
-- Demo services (illustrative eligibility/pricing — verify before any real use)
-- ---------------------------------------------------------------------------

insert into public.services (id, name, slug, category, description, eligibility_criteria, required_documents, faq, applicable_deadline_type, price_display, is_active)
values
  (
    'a1111111-0000-0000-0000-000000000001',
    'ITR-1 (Sahaj)', 'itr-1-sahaj', 'itr',
    'For salaried individuals with straightforward income sources.',
    'Illustrative: resident individuals with total income up to ₹50L from salary, one house property, and other sources (interest etc.). Not for individuals with capital gains or foreign assets.',
    '[
      {"document_type": "pan_card", "label": "PAN Card", "required": true},
      {"document_type": "aadhaar_card", "label": "Aadhaar Card", "required": true},
      {"document_type": "form_16", "label": "Form 16 (Salary TDS Certificate)", "required": true},
      {"document_type": "form_26as_ais", "label": "Form 26AS / AIS", "required": true},
      {"document_type": "bank_statement", "label": "Bank Statement / Interest Certificate", "required": true},
      {"document_type": "investment_proof_80c", "label": "80C Investment Proofs (ELSS, PPF, LIC, etc.)", "required": false},
      {"document_type": "investment_proof_80d", "label": "80D Health Insurance Premium Proof", "required": false},
      {"document_type": "home_loan_interest_cert", "label": "Home Loan Interest Certificate (Sec 24)", "required": false}
    ]'::jsonb,
    '[
      {"question": "Can I file ITR-1 if I have capital gains from selling mutual funds?", "answer": "Illustrative answer: no — any capital gains generally mean you need ITR-2 instead. Your preparer will confirm which form applies once they review your documents."},
      {"question": "What is Form 26AS / AIS and where do I get it?", "answer": "Illustrative answer: both are tax credit statements you can download from the income tax e-filing portal. Uploading them lets your preparer reconcile TDS against what your employer/bank reported."}
    ]'::jsonb,
    'individual', 'Starting at ₹999 (illustrative)', true
  ),
  (
    'a1111111-0000-0000-0000-000000000002',
    'ITR-2', 'itr-2', 'itr',
    'For individuals with capital gains, multiple house properties, or foreign income/assets.',
    'Illustrative: individuals/HUFs not having business/professional income, but with capital gains, more than one house property, or foreign assets/income.',
    '[
      {"document_type": "pan_card", "label": "PAN Card", "required": true},
      {"document_type": "aadhaar_card", "label": "Aadhaar Card", "required": true},
      {"document_type": "form_16", "label": "Form 16 (Salary TDS Certificate)", "required": false},
      {"document_type": "form_26as_ais", "label": "Form 26AS / AIS", "required": true},
      {"document_type": "capital_gains_statement", "label": "Capital Gains Statement (Broker/MF)", "required": true},
      {"document_type": "bank_statement", "label": "Bank Statement / Interest Certificate", "required": true},
      {"document_type": "prior_year_itr_v", "label": "Previous Year ITR-V (for carry-forward losses)", "required": false}
    ]'::jsonb,
    '[
      {"question": "I have losses carried forward from last year — do I need anything extra?", "answer": "Illustrative answer: yes, upload last year''s ITR-V/acknowledgment so your preparer can verify and carry forward eligible losses correctly."},
      {"question": "Do I need a separate capital gains statement for every broker?", "answer": "Illustrative answer: yes, upload one consolidated (or per-broker) capital gains statement covering the full financial year for accurate reporting."}
    ]'::jsonb,
    'individual', 'Starting at ₹2499 (illustrative)', true
  ),
  (
    'a1111111-0000-0000-0000-000000000003',
    'ITR-4 (Sugam)', 'itr-4-sugam', 'itr',
    'Presumptive income scheme for small businesses and professionals.',
    'Illustrative: resident individuals/HUFs/firms (other than LLP) with presumptive income under Sec 44AD/44ADA/44AE, total income up to ₹50L.',
    '[
      {"document_type": "pan_card", "label": "PAN Card", "required": true},
      {"document_type": "aadhaar_card", "label": "Aadhaar Card", "required": true},
      {"document_type": "form_26as_ais", "label": "Form 26AS / AIS", "required": true},
      {"document_type": "business_income_records", "label": "Business/Professional Income Summary", "required": true},
      {"document_type": "bank_statement", "label": "Bank Statement", "required": true}
    ]'::jsonb,
    '[
      {"question": "Do I need to maintain detailed books of accounts?", "answer": "Illustrative answer: generally no under the presumptive scheme — a summarized income record is usually enough, but your preparer will confirm based on your turnover."}
    ]'::jsonb,
    'individual', 'Starting at ₹1999 (illustrative)', true
  ),
  (
    'a1111111-0000-0000-0000-000000000004',
    'GST Return Filing', 'gst-return-filing', 'gst',
    'Monthly/quarterly GSTR-1 and GSTR-3B filing for business clients.',
    'Illustrative: businesses registered under GST needing periodic GSTR-1/GSTR-3B filing.',
    '[
      {"document_type": "gst_returns_prior", "label": "Prior GST Returns", "required": false},
      {"document_type": "sales_purchase_register", "label": "Sales/Purchase Register", "required": true},
      {"document_type": "bank_statement", "label": "Bank Statement", "required": true}
    ]'::jsonb,
    '[
      {"question": "How often do I need to file?", "answer": "Illustrative answer: GSTR-1 and GSTR-3B are typically filed monthly or quarterly depending on your registration scheme — your preparer will confirm your filing frequency."}
    ]'::jsonb,
    'individual', 'Starting at ₹1499/month (illustrative)', true
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Demo filing deadlines for AY 2025-26 (illustrative — verify against the
-- current-year CBDT notification before treating as authoritative)
-- ---------------------------------------------------------------------------

insert into public.filing_deadlines (assessment_year, filer_category, due_date, is_extended, source_notification_ref)
values
  ('2025-26', 'individual', '2025-07-31', false, 'Illustrative placeholder — verify against official CBDT notification'),
  ('2025-26', 'audit', '2025-10-31', false, 'Illustrative placeholder — verify against official CBDT notification'),
  ('2025-26', 'transfer_pricing', '2025-11-30', false, 'Illustrative placeholder — verify against official CBDT notification')
on conflict (assessment_year, filer_category) do nothing;

-- ---------------------------------------------------------------------------
-- One demo filing so the client/preparer/admin dashboards have something to show
-- ---------------------------------------------------------------------------

insert into public.filings (id, client_id, service_id, assessment_year, status, assigned_preparer_id, regime_selected)
values (
  'b2222222-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'a1111111-0000-0000-0000-000000000001',
  '2025-26',
  'submitted',
  '22222222-2222-2222-2222-222222222222',
  'new'
)
on conflict (id) do nothing;

-- Progress the demo filing through a few statuses so the client dashboard's
-- status timeline and computation summary have realistic content to show.
-- Each UPDATE fires log_filing_status_change (functions_triggers.sql),
-- appending a filing_status_history row per transition.
update public.filings
set status = 'documents_under_review'
where id = 'b2222222-0000-0000-0000-000000000001' and status = 'submitted';

update public.filings
set status = 'tax_computation_in_progress'
where id = 'b2222222-0000-0000-0000-000000000001' and status = 'documents_under_review';

update public.filings
set status = 'computation_shared_for_approval',
    tax_computed = 42500,
    refund_or_demand = 3200,
    regime_comparison_note = 'Illustrative: the new regime works out about ₹1,800 cheaper for this income profile, mainly because the higher basic exemption outweighs your smaller 80C claim.'
where id = 'b2222222-0000-0000-0000-000000000001' and status = 'tax_computation_in_progress';

insert into public.messages (id, filing_id, sender_id, message, is_internal)
values
  (
    'c3333333-0000-0000-0000-000000000001',
    'b2222222-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Hi, just uploaded my Form 16 — let me know if anything else is needed.',
    false
  ),
  (
    'c3333333-0000-0000-0000-000000000002',
    'b2222222-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'Thanks Asha, got it. Reviewing now and I''ll share the computation shortly.',
    false
  )
on conflict (id) do nothing;
