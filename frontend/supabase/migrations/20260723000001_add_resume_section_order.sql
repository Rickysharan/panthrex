alter table public.resumes
add column if not exists section_order jsonb
not null
default '[
  "professional-summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications"
]'::jsonb;

update public.resumes
set section_order = '[
  "professional-summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications"
]'::jsonb
where section_order is null;
