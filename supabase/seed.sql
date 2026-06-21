-- Deal Command Center — seed data (PRD Appendix A), made internally consistent.
-- Derived values (KPIs, progress, "next step") are computed at runtime, never stored.

-- ---- firm ----
insert into firm (id, name, website, address, market_focus, industry_specializations,
  total_transactions, geography, description, advisor_bio, ai_instructions, defaults,
  storage_limit_bytes)
values (
  '00000000-0000-0000-0000-000000000001',
  'Jackim Woods & Co.', 'jackim.com', 'Chicago, IL',
  'Lower middle market · $1M–$25M transactions',
  'Manufacturing, Healthcare, Business Services, Distribution',
  '70+', 'Midwest / National',
  'Jackim Woods & Co. is a Chicago-based M&A advisory firm specializing in lower middle-market transactions. The firm provides sell-side and buy-side advisory services to owners, executives, and investors across the Midwest and nationally.',
  'Rich Jackim is the Managing Director of Jackim Woods & Co. with more than 30 years of M&A experience and over 70 closed transactions. He works exclusively with lower middle-market companies in the $1M–$25M range.',
  'Always write in a professional, confident tone appropriate for lower middle-market M&A. Use Jackim Woods & Co. as the advisor firm name. Avoid jargon. Keep executive summaries to one page. Present financial figures in thousands (000s).',
  '{"success_fee":"5%","retainer":"$5,000","exclusivity":"12 months","deal_size_range":"$1M – $25M","default_type":"sell","default_status":"prospect"}'::jsonb,
  10737418240
) on conflict (id) do nothing;

-- ---- user ----
insert into app_user (id, firm_id, email, first_name, last_name, phone, title, years_experience)
values ('00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-000000000001',
  'rich@jackim.com', 'Rich', 'Jackim', '847-555-0141', 'Managing Director', '30+')
on conflict (id) do nothing;

-- ---- projects ----
insert into project (id, firm_id, company_name, website, industry, location, type, track,
  status, est_value, ebitda, multiple, structure, contact_name, contact_title, contact_phone,
  engagement_start)
values
 ('00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000001','Midwest HVAC Services, LLC','midwesthvac.com','Manufacturing / HVAC','Dayton, OH','sell','sell','active','$4.2M','$840K','5.0x','Asset sale','Tom Kowalski','Owner','937-555-0182','2026-05-12'),
 ('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000001','Apex Distribution Partners',null,'Distribution / Logistics',null,'buy','buy','active','$8–15M target',null,null,null,'Sandra Cho','CFO',null,null),
 ('00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000001','Lakeview Dental Group',null,'Healthcare',null,'sell','sell','prospect','$2.8M',null,null,null,'Dr. Karen Wu','Owner',null,null),
 ('00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000001','Summit Tech Solutions',null,'Technology',null,'sell','sell','active',null,null,null,null,'Brian Foster',null,null,null),
 ('00000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000001','Prairie Winds Energy',null,'Energy',null,'sell','sell','onhold',null,null,null,null,'Diane Reyes',null,null,null),
 ('00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000001','Greenfield Landscaping',null,'Services',null,'sell','sell','prospect',null,null,null,null,'Mark Ellis',null,null,null),
 ('00000000-0000-0000-0000-000000000016','00000000-0000-0000-0000-000000000001','NovaCare Home Health',null,'Healthcare',null,'buy','buy','active',null,null,null,null,'Lisa Tran',null,null,null)
on conflict (id) do nothing;

-- ---- Midwest HVAC documents (AI + client-provided) ----
insert into document (id, firm_id, project_id, source, skill_key, filename, format, storage_path, size_bytes, created_at)
values
 ('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','ai','sell.client_profile','Client_Profile_HVAC.docx','docx','seed/client_profile_hvac.docx',48000,'2026-05-13'),
 ('00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','ai','sell.valuation','Valuation_HVAC.xlsx','xlsx','seed/valuation_hvac.xlsx',64000,'2026-05-15'),
 ('00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','ai','sell.market_assessment','Market_Assessment_HVAC.pptx','pptx','seed/market_assessment_hvac.pptx',512000,'2026-05-17'),
 ('00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','ai','sell.engagement','Engagement_Agreement_HVAC.docx','docx','seed/engagement_hvac.docx',52000,'2026-05-18'),
 ('00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','ai','sell.data_room_checklist','Data_Room_Checklist_HVAC.xlsx','xlsx','seed/data_room_hvac.xlsx',40000,'2026-05-20'),
 ('00000000-0000-0000-0000-000000000111','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','uploaded',null,'HVAC_Financials_3yr.xlsx','xlsx','seed/uploads/hvac_financials.xlsx',88000,'2026-05-14'),
 ('00000000-0000-0000-0000-000000000112','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','uploaded',null,'Tax_Returns_2023_2024.pdf','pdf','seed/uploads/hvac_tax.pdf',120000,'2026-05-14'),
 ('00000000-0000-0000-0000-000000000113','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000012','uploaded',null,'Lakeview_Dental_Financials.pdf','pdf','seed/uploads/lakeview_financials.pdf',96000,'2026-05-28')
on conflict (id) do nothing;

-- ---- Midwest HVAC steps (sell-side track: 1-5 completed, 6 in progress, 7-9 not started) ----
insert into project_step (project_id, skill_key, ordinal, status, linked_document_id, completed_at)
values
 ('00000000-0000-0000-0000-000000000010','sell.client_profile',1,'completed','00000000-0000-0000-0000-000000000101','2026-05-13'),
 ('00000000-0000-0000-0000-000000000010','sell.valuation',2,'completed','00000000-0000-0000-0000-000000000102','2026-05-15'),
 ('00000000-0000-0000-0000-000000000010','sell.market_assessment',3,'completed','00000000-0000-0000-0000-000000000103','2026-05-17'),
 ('00000000-0000-0000-0000-000000000010','sell.engagement',4,'completed','00000000-0000-0000-0000-000000000104','2026-05-18'),
 ('00000000-0000-0000-0000-000000000010','sell.data_room_checklist',5,'completed','00000000-0000-0000-0000-000000000105','2026-05-20'),
 ('00000000-0000-0000-0000-000000000010','sell.cim',6,'inprogress',null,null),
 ('00000000-0000-0000-0000-000000000010','sell.teaser',7,'notstarted',null,null),
 ('00000000-0000-0000-0000-000000000010','sell.buyer_research',8,'notstarted',null,null),
 ('00000000-0000-0000-0000-000000000010','sell.loi',9,'notstarted',null,null)
on conflict (project_id, skill_key) do nothing;

-- ---- activity (consistent with step states above) ----
insert into activity_event (firm_id, project_id, type, text, created_at)
values
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','step','Data room checklist completed — Midwest HVAC Services', now() - interval '2 hours'),
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','upload','3 files uploaded to Apex Distribution data room', now() - interval '5 hours'),
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000012','status','Lakeview Dental moved to Prospect', now() - interval '1 day'),
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','step','Engagement agreement completed — Midwest HVAC Services', now() - interval '2 days'),
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000012','step','Market assessment completed — Lakeview Dental Group', now() - interval '3 days'),
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','nda','NDA executed — Apex Distribution, buyer #3', now() - interval '4 days'),
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','status','Midwest HVAC status changed to Active', now() - interval '7 days');

-- ---- notification prefs ----
insert into notification_pref (firm_id, key, enabled) values
 ('00000000-0000-0000-0000-000000000001','skill_run_completion',true),
 ('00000000-0000-0000-0000-000000000001','new_updated_skills',true),
 ('00000000-0000-0000-0000-000000000001','storage_warnings',true),
 ('00000000-0000-0000-0000-000000000001','api_key_issues',true)
on conflict (firm_id, key) do nothing;
