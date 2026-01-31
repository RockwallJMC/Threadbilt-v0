-- Seed Data for Phase 1.5: Dashboard Analytics
-- Creates realistic data distribution for testing dashboard aggregations
-- Target: ~50 deals, ~30 contacts, ~100 activities, ~15 companies

DO $$
DECLARE
  v_test_user_id UUID;
  v_test_org_id UUID;
  v_company_ids UUID[];
  v_contact_ids UUID[];
  v_deal_ids UUID[];
  v_current_date TIMESTAMPTZ := NOW();
BEGIN
  -- Get test user and organization
  SELECT id INTO v_test_user_id
  FROM auth.users
  WHERE email = 'alice.owner@seedtest.com'
  LIMIT 1;

  IF v_test_user_id IS NULL THEN
    RAISE EXCEPTION 'Test user not found: alice.owner@seedtest.com';
  END IF;

  SELECT organization_id INTO v_test_org_id
  FROM organization_members
  WHERE user_id = v_test_user_id
  LIMIT 1;

  IF v_test_org_id IS NULL THEN
    RAISE EXCEPTION 'Test organization not found for user';
  END IF;

  RAISE NOTICE 'Using test user: % in organization: %', v_test_user_id, v_test_org_id;

  -- ===========================================================================
  -- COMPANIES (15 total)
  -- ===========================================================================
  RAISE NOTICE 'Creating 15 companies...';

  WITH new_companies AS (
    INSERT INTO companies (
      id,
      organization_id,
      name,
      industry,
      website,
      created_at
    )
    VALUES
      -- Technology (5 companies)
      (gen_random_uuid(), v_test_org_id, 'TechNova Solutions', 'Technology', 'https://technova.example.com', v_current_date - interval '120 days'),
      (gen_random_uuid(), v_test_org_id, 'CloudSync Systems', 'Technology', 'https://cloudsync.example.com', v_current_date - interval '105 days'),
      (gen_random_uuid(), v_test_org_id, 'DataFlow Analytics', 'Technology', 'https://dataflow.example.com', v_current_date - interval '90 days'),
      (gen_random_uuid(), v_test_org_id, 'NexGen Software', 'Technology', 'https://nexgen.example.com', v_current_date - interval '75 days'),
      (gen_random_uuid(), v_test_org_id, 'InnovateTech Labs', 'Technology', 'https://innovatetech.example.com', v_current_date - interval '60 days'),

      -- Healthcare (3 companies)
      (gen_random_uuid(), v_test_org_id, 'MediCare Plus', 'Healthcare', 'https://medicareplus.example.com', v_current_date - interval '110 days'),
      (gen_random_uuid(), v_test_org_id, 'HealthBridge Systems', 'Healthcare', 'https://healthbridge.example.com', v_current_date - interval '85 days'),
      (gen_random_uuid(), v_test_org_id, 'WellPath Solutions', 'Healthcare', 'https://wellpath.example.com', v_current_date - interval '50 days'),

      -- Finance (3 companies)
      (gen_random_uuid(), v_test_org_id, 'FinanceFirst Group', 'Finance', 'https://financefirst.example.com', v_current_date - interval '100 days'),
      (gen_random_uuid(), v_test_org_id, 'Capital Ventures LLC', 'Finance', 'https://capitalventures.example.com', v_current_date - interval '70 days'),
      (gen_random_uuid(), v_test_org_id, 'SecureBank Corp', 'Finance', 'https://securebank.example.com', v_current_date - interval '40 days'),

      -- Manufacturing (2 companies)
      (gen_random_uuid(), v_test_org_id, 'PrecisionMfg Industries', 'Manufacturing', 'https://precisionmfg.example.com', v_current_date - interval '95 days'),
      (gen_random_uuid(), v_test_org_id, 'GlobalParts Co', 'Manufacturing', 'https://globalparts.example.com', v_current_date - interval '55 days'),

      -- Retail (2 companies)
      (gen_random_uuid(), v_test_org_id, 'RetailMax Solutions', 'Retail', 'https://retailmax.example.com', v_current_date - interval '80 days'),
      (gen_random_uuid(), v_test_org_id, 'ShopSmart Systems', 'Retail', 'https://shopsmart.example.com', v_current_date - interval '45 days')
    RETURNING id
  )
  SELECT array_agg(id) INTO v_company_ids FROM new_companies;

  RAISE NOTICE 'Created % companies', array_length(v_company_ids, 1);

  -- ===========================================================================
  -- CONTACTS (30 total, ~2 per company)
  -- ===========================================================================
  RAISE NOTICE 'Creating 30 contacts...';

  WITH new_contacts AS (
    INSERT INTO crm_contacts (
      id,
      user_id,
      company_id,
      first_name,
      last_name,
      email,
      phone,
      title,
      lead_status,
      created_by,
      created_at
    )
    SELECT
      gen_random_uuid(),
      v_test_user_id,
      v_company_ids[(row_num - 1) / 2 + 1],
      first_names.name,
      last_names.name,
      lower(first_names.name || '.' || last_names.name || '@' || companies.domain),
      CASE WHEN random() > 0.3 THEN '+1-555-' || lpad(floor(random() * 10000)::text, 4, '0') ELSE NULL END,
      job_titles.title,
      statuses.status,
      v_test_user_id,
      v_current_date - (random() * interval '90 days')
    FROM
      generate_series(1, 30) AS row_num,
      LATERAL (SELECT v_company_ids[(row_num - 1) / 2 + 1] as company_id) AS comp,
      LATERAL (SELECT split_part((SELECT name FROM companies WHERE id = comp.company_id), ' ', 1) as domain) AS companies,
      LATERAL (
        SELECT name FROM (VALUES
          ('John'), ('Jane'), ('Michael'), ('Sarah'), ('David'),
          ('Emma'), ('Robert'), ('Lisa'), ('James'), ('Maria'),
          ('William'), ('Jennifer'), ('Richard'), ('Patricia'), ('Thomas')
        ) AS t(name)
        ORDER BY random()
        LIMIT 1
      ) AS first_names,
      LATERAL (
        SELECT name FROM (VALUES
          ('Smith'), ('Johnson'), ('Williams'), ('Brown'), ('Jones'),
          ('Garcia'), ('Miller'), ('Davis'), ('Rodriguez'), ('Martinez'),
          ('Anderson'), ('Taylor'), ('Thomas'), ('Moore'), ('Jackson')
        ) AS t(name)
        ORDER BY random()
        LIMIT 1
      ) AS last_names,
      LATERAL (
        SELECT title FROM (VALUES
          ('CEO'), ('CTO'), ('VP Sales'), ('VP Marketing'), ('CFO'),
          ('Director of Operations'), ('Head of Product'), ('Sales Manager'),
          ('Marketing Director'), ('Account Executive'), ('Senior Engineer'),
          ('Product Manager'), ('Business Development Manager'), ('Customer Success Manager'),
          ('Chief Revenue Officer')
        ) AS t(title)
        ORDER BY random()
        LIMIT 1
      ) AS job_titles,
      LATERAL (
        SELECT status FROM (VALUES
          ('lead'), ('lead'), ('lead'),
          ('qualified'), ('qualified'), ('qualified'),
          ('customer'), ('customer')
        ) AS t(status)
        ORDER BY random()
        LIMIT 1
      ) AS statuses
    RETURNING id
  )
  SELECT array_agg(id) INTO v_contact_ids FROM new_contacts;

  RAISE NOTICE 'Created % contacts', array_length(v_contact_ids, 1);

  -- ===========================================================================
  -- DEALS (50 total)
  -- Stage Distribution: Awareness(10), Research(8), Intent(7), Evaluation(6), Negotiation(5), Won(8), Lost(6)
  -- ===========================================================================
  RAISE NOTICE 'Creating 50 deals...';

  WITH deal_specs AS (
    SELECT
      row_number,
      stage,
      is_closed,
      -- Values range: $5,000 - $150,000
      (5000 + (random() * 145000))::DECIMAL(10,2) AS amount,
      -- CAC range: $500 - $5,000
      (500 + (random() * 4500))::DECIMAL(10,2) AS cac,
      -- Created dates: last 120 days, weighted toward recent
      v_current_date - (random() * random() * interval '120 days') AS create_date
    FROM (
      -- Awareness (10)
      SELECT generate_series AS row_number, 'awareness' AS stage, FALSE AS is_closed
      FROM generate_series(1, 10)

      UNION ALL

      -- Research (8)
      SELECT generate_series + 10, 'research', FALSE
      FROM generate_series(1, 8)

      UNION ALL

      -- Intent (7)
      SELECT generate_series + 18, 'intent', FALSE
      FROM generate_series(1, 7)

      UNION ALL

      -- Evaluation (6)
      SELECT generate_series + 25, 'evaluation', FALSE
      FROM generate_series(1, 6)

      UNION ALL

      -- Negotiation (5)
      SELECT generate_series + 31, 'negotiation', FALSE
      FROM generate_series(1, 5)

      UNION ALL

      -- Won (8)
      SELECT generate_series + 36, 'won', TRUE
      FROM generate_series(1, 8)

      UNION ALL

      -- Lost (6)
      SELECT generate_series + 44, 'lost', TRUE
      FROM generate_series(1, 6)
    ) AS stages
  ),
  new_deals AS (
    INSERT INTO deals (
      id,
      user_id,
      organization_id,
      contact_id,
      company_id,
      name,
      stage,
      amount,
      close_date,
      acquisition_cost,
      lifetime_value,
      created_by,
      create_date
    )
    SELECT
      gen_random_uuid(),
      v_test_user_id,
      v_test_org_id,
      v_contact_ids[1 + floor(random() * array_length(v_contact_ids, 1))::int],
      v_company_ids[1 + floor(random() * array_length(v_company_ids, 1))::int],
      'Deal ' || row_number || ' - ' || companies.name,
      stage,
      amount,
      CASE
        WHEN is_closed THEN create_date + (random() * interval '30 days')
        ELSE NULL
      END,
      cac,
      CASE
        WHEN stage = 'won' THEN cac * (3.0 + random() * 2.5)  -- LTV = 3x-5.5x CAC for won deals
        WHEN stage = 'lost' THEN NULL  -- NULL LTV for lost deals
        ELSE NULL  -- NULL for in-progress deals
      END,
      v_test_user_id,
      create_date
    FROM deal_specs
    CROSS JOIN LATERAL (
      SELECT name FROM (VALUES
        ('Enterprise License'), ('Professional Services'), ('Annual Subscription'),
        ('Consulting Package'), ('Software Implementation'), ('Support Contract'),
        ('Training Program'), ('Custom Integration'), ('Platform Migration'),
        ('Security Audit'), ('Data Analytics Solution'), ('Cloud Infrastructure')
      ) AS t(name)
      ORDER BY random()
      LIMIT 1
    ) AS companies
    RETURNING id, stage
  )
  SELECT array_agg(id) INTO v_deal_ids FROM new_deals;

  RAISE NOTICE 'Created % deals', array_length(v_deal_ids, 1);

  -- ===========================================================================
  -- ACTIVITIES (100 total)
  -- Type Distribution: Calls(25), Emails(30), Meetings(20), Notes(15), Tasks(10)
  -- Date Distribution: Last 30 days, weekdays only
  -- ===========================================================================
  RAISE NOTICE 'Creating 100 activities...';

  WITH activity_dates AS (
    -- Generate weekday dates for last 30 days
    SELECT date
    FROM generate_series(
      v_current_date - interval '30 days',
      v_current_date,
      interval '1 day'
    ) AS date
    WHERE EXTRACT(DOW FROM date) BETWEEN 1 AND 5  -- Monday=1, Friday=5
  ),
  activity_specs AS (
    SELECT
      row_number,
      activity_type,
      -- Cycle through available weekday dates
      (SELECT date FROM activity_dates ORDER BY random() LIMIT 1) AS activity_date,
      -- Alternate between deal and contact entities
      CASE WHEN row_number % 2 = 0 THEN 'opportunity' ELSE 'contact' END AS entity_type
    FROM (
      -- Calls (25)
      SELECT generate_series AS row_number, 'call' AS activity_type
      FROM generate_series(1, 25)

      UNION ALL

      -- Emails (30)
      SELECT generate_series + 25, 'email'
      FROM generate_series(1, 30)

      UNION ALL

      -- Meetings (20)
      SELECT generate_series + 55, 'meeting'
      FROM generate_series(1, 20)

      UNION ALL

      -- Notes (15)
      SELECT generate_series + 75, 'note'
      FROM generate_series(1, 15)

      UNION ALL

      -- Tasks (10)
      SELECT generate_series + 90, 'task'
      FROM generate_series(1, 10)
    ) AS types
  )
  INSERT INTO activities (
    id,
    organization_id,
    entity_type,
    entity_id,
    activity_type,
    subject,
    description,
    activity_date,
    duration_minutes,
    outcome,
    created_by,
    created_at
  )
  SELECT
    gen_random_uuid(),
    v_test_org_id,
    entity_type,
    CASE
      WHEN entity_type = 'opportunity' THEN v_deal_ids[1 + floor(random() * array_length(v_deal_ids, 1))::int]
      ELSE v_contact_ids[1 + floor(random() * array_length(v_contact_ids, 1))::int]
    END,
    activity_type,
    subjects.subject,
    descriptions.description,
    activity_date,
    CASE
      WHEN activity_type IN ('call', 'meeting') THEN (ARRAY[15, 30, 45, 60])[1 + floor(random() * 4)::int]
      ELSE NULL
    END,
    outcomes.outcome,
    v_test_user_id,
    activity_date
  FROM activity_specs
  CROSS JOIN LATERAL (
    SELECT subject FROM (VALUES
      ('Follow-up call'), ('Introduction meeting'), ('Product demo'),
      ('Contract discussion'), ('Technical review'), ('Pricing negotiation'),
      ('Quarterly check-in'), ('Support ticket'), ('Feature request'),
      ('Status update'), ('Onboarding session'), ('Training workshop')
    ) AS t(subject)
    ORDER BY random()
    LIMIT 1
  ) AS subjects
  CROSS JOIN LATERAL (
    SELECT description FROM (VALUES
      ('Discussed project requirements and timeline'),
      ('Reviewed proposal and addressed questions'),
      ('Demonstrated platform capabilities'),
      ('Clarified pricing and contract terms'),
      ('Walked through technical implementation'),
      ('Negotiated service level agreements'),
      ('Provided product update and roadmap'),
      ('Resolved technical support issue'),
      ('Gathered feedback on new features'),
      ('Updated stakeholders on progress'),
      ('Conducted user training session'),
      ('Facilitated workshop on best practices')
    ) AS t(description)
    ORDER BY random()
    LIMIT 1
  ) AS descriptions
  CROSS JOIN LATERAL (
    SELECT outcome FROM (VALUES
      ('successful'), ('successful'), ('successful'),
      ('follow_up_needed'), ('follow_up_needed'),
      ('no_answer')
    ) AS t(outcome)
    ORDER BY random()
    LIMIT 1
  ) AS outcomes;

  RAISE NOTICE 'Created 100 activities';

  -- ===========================================================================
  -- VERIFICATION
  -- ===========================================================================
  RAISE NOTICE 'Verifying seed data counts...';

  DECLARE
    v_company_count INT;
    v_contact_count INT;
    v_deal_count INT;
    v_activity_count INT;
  BEGIN
    SELECT COUNT(*) INTO v_company_count FROM companies WHERE organization_id = v_test_org_id;
    SELECT COUNT(*) INTO v_contact_count FROM crm_contacts WHERE user_id = v_test_user_id;
    SELECT COUNT(*) INTO v_deal_count FROM deals WHERE organization_id = v_test_org_id;
    SELECT COUNT(*) INTO v_activity_count FROM activities WHERE organization_id = v_test_org_id;

    RAISE NOTICE '===== SEED DATA SUMMARY =====';
    RAISE NOTICE 'Companies: %', v_company_count;
    RAISE NOTICE 'Contacts: %', v_contact_count;
    RAISE NOTICE 'Deals: %', v_deal_count;
    RAISE NOTICE 'Activities: %', v_activity_count;
    RAISE NOTICE '=============================';

    IF v_deal_count < 50 THEN
      RAISE WARNING 'Expected at least 50 deals, got %', v_deal_count;
    END IF;

    IF v_contact_count < 30 THEN
      RAISE WARNING 'Expected at least 30 contacts, got %', v_contact_count;
    END IF;

    IF v_activity_count < 100 THEN
      RAISE WARNING 'Expected at least 100 activities, got %', v_activity_count;
    END IF;
  END;

END $$;
