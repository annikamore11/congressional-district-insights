-- All database functions for easy replication and documentation
-- Refer to data processing files to see how raw datasets were cleaned and imported to database

-- Function: Get election results for state
create or replace function fetch_election_state(state_name text)
returns table (
  state_po varchar,
  year int,
  party varchar,
  candidate varchar,
  candidatevotes bigint
)
language sql
as $$
  select state_po, year, party, candidate, sum(candidatevotes) as votes
  from election_results_by_county
  where state_po = state_name
  group by state_po, year, party, candidate
  order by year, votes desc;
$$;

-- Function: Get election results for county
create or replace function fetch_election_county(state_name text, county text)
returns table (
  state_po varchar,
  county_name varchar,
  year int,
  party varchar,
  candidate varchar,
  candidatevotes bigint
)
language sql
as $$
  select state_po, county_name, year, party, candidate, candidatevotes
  from election_results_by_county
  where state_po = state_name
    and UPPER(county_name) = UPPER(
      TRIM(
        REGEXP_REPLACE(county, '\s*County\s*', '', 'gi')
      )
    )
  order by year, candidatevotes desc;
$$;

-- Function: Get demographics results for state
create or replace function fetch_demographics_state(state_param text, county_param text)
returns table (
  state text,
  county text,
  geography text,
  year numeric,
  total_pop numeric,
  pct_female numeric,
  pct_male numeric,
  pct_white numeric,
  pct_black numeric,
  pct_am_indian numeric,
  pct_asian numeric,
  pct_pacificI numeric,
  pct_other numeric,
  pct_two_or_more numeric,
  pct_hispanic numeric,
  pct_not_hispanic numeric,
  pct_divorced numeric,
  pct_hs_or_higher numeric,
  pct_doctorate numeric,
  pct_uninsured numeric,
  med_household_income numeric
)
language sql
as $$
  select 
    state, 
    county, 
    geography, 
    year, 
    total_pop, 
    pct_female, 
    pct_male, 
    pct_white, 
    pct_black, 
    pct_am_indian, 
    pct_asian, 
    "pct_pacificI", 
    pct_other, 
    pct_two_or_more, 
    pct_hispanic, 
    pct_not_hispanic, 
    pct_divorced, 
    pct_hs_or_higher, 
    pct_doctorate, 
    pct_uninsured, 
    med_household_income
  from census_data
  where (state = state_param and county = county_param)
     or (state = 'US' and county = 'United States')
  order by year desc;
$$;

-- Function: Get demographics results for county
create or replace function fetch_demographics_county(state_param text, county_param text)
returns table (
  state text,
  county text,
  geography text,
  year numeric,
  total_pop numeric,
  pct_female numeric,
  pct_male numeric,
  pct_white numeric,
  pct_black numeric,
  pct_am_indian numeric,
  pct_asian numeric,
  pct_pacificI numeric,
  pct_other numeric,
  pct_two_or_more numeric,
  pct_hispanic numeric,
  pct_not_hispanic numeric,
  pct_divorced numeric,
  pct_hs_or_higher numeric,
  pct_doctorate numeric,
  pct_uninsured numeric,
  med_household_income numeric
)
language sql
as $$
  select 
    state, 
    county, 
    geography, 
    year, 
    total_pop, 
    pct_female, 
    pct_male, 
    pct_white, 
    pct_black, 
    pct_am_indian, 
    pct_asian, 
    "pct_pacificI", 
    pct_other, 
    pct_two_or_more, 
    pct_hispanic, 
    pct_not_hispanic, 
    pct_divorced, 
    pct_hs_or_higher, 
    pct_doctorate, 
    pct_uninsured, 
    med_household_income
  from census_data
  where (state = state_param
    and county = case 
      when $2 ilike '%county%' then $2
      else $2 || ' County'
    end)
    or (state = 'US' and county = 'United States')
  order by year desc;
$$;

-- Function: Get health results for state
create or replace function fetch_health_state(state_param text, county_param text)
returns table (
  state text,
  county text,
  year numeric,
  pct_uninsured numeric,
  premature_death float4,
  prim_care_physicians float4,
  dentists float4,
  mammography_screening float4,
  flu_vaccinations float4,
  alcohol_deaths float4,
  sexually_transmitted_infections float4,
  preventable_hospital_stays float4,
  school_funding float4
)
language sql
as $$
  select 
    c.state, 
    c.county,
    c.year, 
    c.pct_uninsured,
    h.premature_death,
    h.prim_care_physicians,
    h.dentists,
    h.mammography_screening,
    h.flu_vaccinations,
    h.alcohol_impaired_driving_deaths,
    h.sexually_transmitted_infections,
    h.preventable_hospital_stays,
    h.school_funding
  from census_data c
  left join county_health_ratings_trends h
    on c.state = h.state 
    and c.county = h.county 
    and c.year = h.year_numeric
  where (c.state = state_param and c.county = county_param)
     or (c.state = 'US' and c.county = 'United States')
  order by c.year desc;
$$;

-- Function: Get health results for county
create or replace function fetch_health_county(state_param text, county_param text)
returns table (
  state text,
  county text,
  year numeric,
  pct_uninsured numeric,
  premature_death float4,
  prim_care_physicians float4,
  dentists float4,
  mammography_screening float4,
  flu_vaccinations float4,
  alcohol_deaths float4,
  sexually_transmitted_infections float4,
  preventable_hospital_stays float4,
  school_funding float4
)
language sql
as $$
  select 
    c.state, 
    c.county,
    c.year, 
    c.pct_uninsured,
    h.premature_death,
    h.prim_care_physicians,
    h.dentists,
    h.mammography_screening,
    h.flu_vaccinations,
    h.alcohol_impaired_driving_deaths,
    h.sexually_transmitted_infections,
    h.preventable_hospital_stays,
    h.school_funding
  from census_data c
  left join county_health_ratings_trends h
    on c.state = h.state 
    and c.county = h.county 
    and c.year = h.year_numeric
  where (c.state = state_param
    and c.county = case 
      when county_param ilike '%county%' then county_param
      else county_param || ' County'
    end)
    or (c.state = 'US' and c.county = 'United States')
  order by c.year desc;
$$;

-- Function: Get Education results for state
create or replace function fetch_education_state(state_param text, county_param text)
returns table (
  state text,
  county text,
  year numeric,
  pct_hs_or_higher numeric,
  pct_ba_or_higher numeric,
  pct_doctorate numeric,
  pct_enrolled numeric,
  pct_public_school numeric,
  pct_private_school numeric,
  school_funding float4
)
language sql
as $$
  select 
    c.state, 
    c.county,
    c.year, 
    c.pct_hs_or_higher numeric,
    c.pct_ba_or_higher numeric,
    c.pct_doctorate numeric,
    c.pct_enrolled numeric,
    c.pct_public_school numeric,
    c.pct_private_school numeric,
    h.school_funding float4
  from census_data c
  left join county_health_ratings_trends h
    on c.state = h.state 
    and c.county = h.county 
    and c.year = h.year_numeric
  where (c.state = state_param and c.county = county_param)
     or (c.state = 'US' and c.county = 'United States')
  order by c.year asc;
$$;

-- Function: Get Education results for county
create or replace function fetch_education_county(state_param text, county_param text)
returns table (
  state text,
  county text,
  year numeric,
  pct_hs_or_higher numeric,
  pct_ba_or_higher numeric,
  pct_doctorate numeric,
  pct_enrolled numeric,
  pct_public_school numeric,
  pct_private_school numeric,
  school_funding float4
)
language sql
as $$
  select 
    c.state, 
    c.county,
    c.year, 
    c.pct_hs_or_higher numeric,
    c.pct_ba_or_higher numeric,
    c.pct_doctorate numeric,
    c.pct_enrolled numeric,
    c.pct_public_school numeric,
    c.pct_private_school numeric,
    h.school_funding float4
  from census_data c
  left join county_health_ratings_trends h
    on c.state = h.state 
    and c.county = h.county 
    and c.year = h.year_numeric
  where (c.state = state_param
    and c.county = case 
      when county_param ilike '%county%' then county_param
      else county_param || ' County'
    end)
    or (c.state = 'US' and c.county = 'United States')
  order by c.year desc;
$$;

-- Function: Get Economy results for state
create or replace function fetch_economy_state(state_param text, county_param text)
returns table (
  state text,
  county text,
  geography text,
  year numeric,
  poverty_pop numeric,
  med_household_income numeric,
  gini_index numeric,
  labor_force_rate numeric,
  unemployment_rate numeric,
  med_gross_rent numeric,
  med_home_value numeric,
  pct_renters numeric,
  pct_homeowners numeric,
  pct_renters_cost_burdened numeric,
  pct_homeowners_cost_burdened numeric
)
language sql
as $$
  select 
    state, 
    county, 
    geography, 
    year, 
    poverty_pop,
    med_household_income,
    gini_index,
    labor_force_rate,
    unemployment_rate,
    med_gross_rent,
    med_home_value,
    pct_renters,
    pct_homeowners,
    pct_renters_cost_burdened,
    pct_homeowners_cost_burdened
  from census_economic_data
  where (state = state_param and county = county_param)
     or (state = 'US' and county = 'United States')
  order by year desc;
$$;

-- Function: Get Economy results for county
create or replace function fetch_economy_county(state_param text, county_param text)
returns table (
  state text,
  county text,
  geography text,
  year numeric,
  poverty_pop numeric,
  med_household_income numeric,
  gini_index numeric,
  labor_force_rate numeric,
  unemployment_rate numeric,
  med_gross_rent numeric,
  med_home_value numeric,
  pct_renters numeric,
  pct_homeowners numeric,
  pct_renters_cost_burdened numeric,
  pct_homeowners_cost_burdened numeric
)
language sql
as $$
  select 
    state, 
    county, 
    geography, 
    year, 
    poverty_pop,
    med_household_income,
    gini_index,
    labor_force_rate,
    unemployment_rate,
    med_gross_rent,
    med_home_value,
    pct_renters,
    pct_homeowners,
    pct_renters_cost_burdened,
    pct_homeowners_cost_burdened
  from census_economic_data
  where (state = state_param
    and county = case 
      when $2 ilike '%county%' then $2
      else $2 || ' County'
    end)
    or (state = 'US' and county = 'United States')
  order by year desc;
$$;