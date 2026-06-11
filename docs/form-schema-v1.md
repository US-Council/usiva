# USIVA OPT Application — Form Schema v1

Single source of truth for all applicant field names in apply-opt.html and the USIVA_OPT_Intake Logic App.

**Funnel-contract fields (immutable — formfunnel depends on these exact names):**
`test`, `owner`, `website`, `recaptcha_response`, `_gotcha`, `budget`, `campaign`, `pageName`, `token`, `formType`

---

## Section 1 — Identity

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| legal_first_name | first_name | text | Removed "legal_" prefix — context is unambiguous |
| legal_middle_name | middle_name | text | |
| legal_last_name | last_name | text | |
| preferred_first_name | preferred_name | text | Shorter, sufficient |
| email | email | email | Already clean |
| phone | phone | tel | Already clean |
| current_city | city | text | Removed "current_" |
| current_state | state | text | |
| citizenship_country | citizenship_country | text | OK as-is; disambiguates from birth_country |
| country_of_birth | birth_country | text | Symmetric with citizenship_country |
| date_of_birth | birth_date | date | Consistent *_date suffix |
| current_street_address | street_address | text | |
| current_zip | postal_code | text | Industry standard |
| emergency_contact_name | emergency_contact_name | text | Group prefix already clean |
| emergency_contact_relationship | emergency_contact_relationship | text | |
| emergency_contact_phone | emergency_contact_phone | tel | |

## Section 2 — Portfolio

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| resume_url | resume_url | url | Already clean |
| linkedin_url | linkedin_url | url | Already clean |
| github_url | github_url | url | Already clean |
| gitlab_url | gitlab_url | url | Already clean |
| portfolio_url | portfolio_url | url | Already clean |
| scholar_or_orcid_url | scholar_url | url | Shorter; ORCID implied |
| best_work_samples | work_samples | textarea | Dropped "best_" — redundant |

## Section 3 — Education

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| school_name | school_name | text | Already clean |
| school_city_state | school_location | text | Cleaner |
| degree_level | degree_level | select | Already clean |
| degree_name | degree_name | text | Already clean |
| major_field | major | text | Shorter; "field" implied |
| cip_code | cip_code | text | Already clean |
| graduation_date | graduation_date | date | Already clean |
| degree_awarded_date | degree_awarded_date | date | Already clean |
| dso_name | dso_name | text | Already clean |
| dso_email | dso_email | email | Already clean |
| school_sevis_code | sevis_school_code | text | Prefix order matches sevis_id |
| student_sevis_id | sevis_id | text | Dropped "student_" — context clear |
| student_sevis_id_status | sevis_id_status | select | |
| degree_relationship | degree_relationship | textarea | Already clean |

## Section 4 — Work Authorization

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| currently_in_us | currently_in_us | radio | Already clean |
| last_us_entry_date | last_entry_date | date | Dropped "us_" — context clear |
| opt_stage | opt_stage | radio | Already clean |
| ead_status | ead_status | radio | Already clean |
| ead_start_date | ead_start_date | date | Already clean |
| ead_end_date | ead_end_date | date | Already clean |
| requested_start_date | requested_start_date | date | Already clean |
| hours_per_week | hours_per_week | number | Already clean |
| unemployment_days_used | unemployment_days_used | number | Already clean |
| prior_cpt_opt | prior_authorizations | hidden | UI checkboxes join into this hidden field |
| prior_out_of_status | prior_out_of_status | checkbox | Already clean |
| stem_eligibility_belief | stem_eligibility_belief | radio | Already clean |
| future_sponsorship | future_sponsorship | radio | Already clean |
| i983_employer_willing | i983_employer_willing | radio | Already clean |
| employer_everify_enrolled | employer_everify_enrolled | radio | Already clean |
| training_plan_status | training_plan_status | select | Already clean |
| multiple_employers_planned | multiple_employers_planned | radio | Already clean |
| prospective_employer_name | prospective_employer_name | text | Already clean |
| prospective_employer_email | prospective_employer_email | email | Already clean |
| proposed_wage_or_compensation | proposed_compensation | text | Shorter |
| i983_form | i983_notes | textarea | Cleaner; matches intent |
| authorization_notes | authorization_notes | textarea | Already clean |

## Section 5 — Community & Culture

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| location_preference | location_preference | radio | Already clean |
| preferred_site | preferred_site | select | Already clean |
| relocation_date | relocation_date | date | Already clean |
| remote_timezone | remote_timezone | text | Already clean |
| housing_needs | housing_needs | textarea | Already clean |
| has_reliable_transportation | reliable_transportation | select | Dropped "has_" — value conveys yes/no |
| has_valid_drivers_license | drivers_license | select | Dropped "has_valid_" |

## Section 6 — On-Site Skills (skill_* group — already clean)

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| skill_hospitality | skill_hospitality | radio | Already clean |
| skill_culinary | skill_culinary | radio | Already clean |
| skill_agriculture | skill_agriculture | radio | Already clean |
| skill_land_management | skill_land_management | radio | Already clean |
| skill_home_restoration | skill_home_restoration | radio | Already clean |
| skill_construction | skill_construction | radio | Already clean |
| skill_carpentry | skill_carpentry | radio | Already clean |
| skill_electrical | skill_electrical | radio | Already clean |
| skill_plumbing | skill_plumbing | radio | Already clean |
| skill_hvac | skill_hvac | radio | Already clean |
| skill_roofing | skill_roofing | radio | Already clean |
| skill_architecture | skill_architecture | radio | Already clean |
| skill_project_management | skill_project_management | radio | Already clean |
| skill_leadership | skill_leadership | radio | Already clean |
| skill_communication | skill_communication | radio | Already clean |
| skill_m365 | skill_m365 | radio | Already clean |
| skill_research | skill_research | radio | Already clean |
| skill_agile | skill_agile | radio | Already clean |
| skill_sales | skill_sales | radio | Already clean |
| certifications | certifications | checkbox | Already clean |
| onsite_requirements | onsite_requirements | checkbox | Already clean |
| onsite_contribution | onsite_contribution | textarea | Already clean |

## Section 7 — Industry

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| learning_areas | learning_areas | checkbox | Already clean |
| spark_interest | spark_interest | textarea | Already clean |
| curiosity_depth | curiosity_depth | textarea | Already clean |
| focus_goal | focus_goal | textarea | Already clean |
| industry_experience | industry_experience | checkbox | Already clean |
| industry_experience_details | industry_experience_details | textarea | Already clean |
| industry_interest | industry_interest | checkbox | Already clean |
| industry_choice_reason | industry_choice_reason | textarea | Already clean |
| industry_degree_alignment | industry_degree_alignment | textarea | Already clean |

## Section 8 — Technical, Research & Professional Skills

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| technical_skills | technical_skills | checkbox | Already clean |
| professional_skills | professional_skills | checkbox | Already clean |
| skills_summary | skills_summary | textarea | Already clean |

## Section 9 — Government Relations

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| government_experience_type | government_experience_type | checkbox | Already clean |
| government_agencies | government_agencies | hidden | Synced from dynamic rows |
| government_experience_details | government_experience_details | textarea | Already clean (hidden/readonly) |
| government_project_roles | government_project_roles | checkbox | Already clean |
| government_project_role_details | government_project_role_details | textarea | Already clean |

## Section 10 — Non-Profit & Volunteering

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| ngo_experience | ngo_experience | checkbox | Already clean |
| volunteer_experience_details | volunteer_experience_details | textarea | Already clean |
| grants_gov_interest | grants_gov_opportunity | textarea | Noun form (opportunity vs. interest) |
| sam_gov_interest | sam_gov_opportunity | textarea | |
| grant_interest_reason | grant_interest_reason | textarea | Already clean |

## Section 11 — Social Clubs & Organizations

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| social_clubs | social_clubs | checkbox | Already clean |
| social_clubs_details | social_clubs_details | textarea | Already clean |

## Section 12 — Publications

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| publication_count | publication_count | number | Already clean |
| publication_types | publication_types | checkbox | Already clean |
| publication_list | publication_list | textarea | Already clean |

## Section 13 — Project Management Readiness

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| focus_hive_readiness | focus_hive_readiness | checkbox | Already clean |
| pm_methodologies | pm_methodologies | checkbox | Already clean |
| pm_certifications | pm_certifications | checkbox | Already clean |
| team_process_experience | team_process_experience | textarea | Already clean |

## Section 14 — GitOps Readiness

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| assessment_evidence | assessment_evidence | checkbox | Already clean |
| gitops_tools | gitops_tools | checkbox | Already clean |
| gitops_experience | gitops_experience | textarea | Already clean |

## Section 15 — Security Readiness

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| security_certifications | security_certifications | checkbox | Already clean |
| soc2_experience | soc2_experience | radio | Already clean |
| cmmc_experience | cmmc_experience | radio | Already clean |
| security_audit_experience | security_audit_experience | radio | Already clean |
| security_clearance | security_clearance | select | Already clean |
| military_experience | military_experience | radio | Already clean |
| dod_experience | dod_experience | radio | Already clean |
| security_experience_details | security_experience_details | textarea | Already clean |

## Section 16 — Documents & Evidence

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| documents_status | documents_status | checkbox | Already clean |
| academic_documents | academic_documents | checkbox | Already clean |
| passport_expiration_date | passport_expiration_date | date | Already clean |
| f1_visa_expiration_date | f1_visa_expiration_date | date | Already clean |
| missing_documents | missing_documents | textarea | Already clean |

## Section 17 — Compliance Review Flags

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| review_flags | review_flags | checkbox | Already clean |
| review_owners | review_owners | checkbox | Already clean |
| review_notes | review_notes | textarea | Already clean |

## Section 18 — Applicant Statements

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| why_apply | why_apply | textarea | Already clean |
| career_goal | career_goal | textarea | Already clean |
| long_term_goal | long_term_goal | textarea | Already clean |
| preferred_contact_method | preferred_contact_method | select | Already clean |
| best_contact_time | best_contact_time | text | Already clean |
| acknowledgments | acknowledgments | checkbox | Already clean |

## Section 19 — Internal Routing

| v0 name | v1 name | Type | Notes |
|---------|---------|------|-------|
| recommended_case_system | recommended_case_system | select | Already clean |
| recommended_case_path | recommended_case_path | text | Already clean |
| program_tags | program_tags | text | Already clean |
| source_form_name | source_form_name | text | Already clean |
| routing_notes | routing_notes | textarea | Already clean |

---

## Summary of renames (v0 → v1)

| v0 | v1 |
|----|----|
| legal_first_name | first_name |
| legal_middle_name | middle_name |
| legal_last_name | last_name |
| preferred_first_name | preferred_name |
| current_city | city |
| current_state | state |
| country_of_birth | birth_country |
| date_of_birth | birth_date |
| current_street_address | street_address |
| current_zip | postal_code |
| scholar_or_orcid_url | scholar_url |
| best_work_samples | work_samples |
| major_field | major |
| school_city_state | school_location |
| school_sevis_code | sevis_school_code |
| student_sevis_id | sevis_id |
| student_sevis_id_status | sevis_id_status |
| last_us_entry_date | last_entry_date |
| prior_cpt_opt | prior_authorizations |
| proposed_wage_or_compensation | proposed_compensation |
| i983_form | i983_notes |
| has_reliable_transportation | reliable_transportation |
| has_valid_drivers_license | drivers_license |
| grants_gov_interest | grants_gov_opportunity |
| sam_gov_interest | sam_gov_opportunity |

**Total renames: 25 fields**
**Total unchanged applicant fields: ~141**
**Funnel-contract fields (immutable): 10**
**Draft localStorage key: usiva_opt_draft_v1 → usiva_opt_draft_v2**
