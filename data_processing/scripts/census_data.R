library(tidycensus)
library(dplyr)
library(sf)
library(tigris)
library(tidyr)
library(writexl)
library(readr)

options(tigris_use_cache = TRUE)

# Set Census API key 
census_api_key(Sys.getenv("CENSUS_API_KEY"), install = TRUE, overwrite = TRUE)

# Variable Selection
acs_vars <- load_variables(
  2023,
  dataset = c("acs5"),
  cache = TRUE
)

# Search for variables containing a specific word or search for descriptions based on variable code
pop_vars <- acs_vars %>%
  filter(grepl("B14", name, ignore.case = TRUE))



# Choose variables 
variables_of_interest <- c(
  total_pop = "B01003_001",       # Total population
  female_pop = "B01001_026",      # Total population of females
  male_pop = "B01001_002",        # Total population of males
  
  white_alone = "B02001_002",     # Population White alone
  black_alone = "B02001_003",     # Population Black/African American alone
  am_indian_alone = "B02001_004", # Population American Indian and Alaska Native alone
  asian_alone = "B02001_005",     # Population Asian alone
  pacificI_alone = "B02001_006",  # Population Pacific Islander and Native Hawaiian alone
  other_alone = "B02001_007",     # Population Other alone 
  two_or_more = "B02001_008",     # Population Two or more races
  
  hispanic = "B03003_003",        # Population Hispanic
  not_hispanic = "B03003_002",    # Population not hispanic or latino
  
  pop_15_over = "B12001_001",
  females_divorced = "B12001_019",
  males_divorced = "B12001_010",
  
  pop_25_over = "B15003_001",    # Population 25 and older
  highshool_grad = "B15003_017",  # Graduated highschool
  ged_alt_cred = "B15003_018",    # GED or alternative credential
  some_college_less = "B15003_019", # Some college, less than 1 year
  some_college_more = "B15003_020", # Some college, more than 1 year
  associates = "B15003_021",        # Associates degree
  bachelors = "B15003_022",         # Bachelors degree
  masters = "B15003_023",           # Masters degree
  prof_school = "B15003_024",       # Professional School degree
  doctorate = "B15003_025",          # Doctorate Degree
  
  med_household_income = "B19013_001",   # Median Household Income
    
  total_insur_pop = "B27010_001",
  uninsured_under_19 = "B27010_017",
  uninsured_19_30 = "B27010_033",
  uninsured_35_64 = "B27010_050",
  uninsured_65_over = "B27010_066",
  
  pop_education = "B14007_001",         #Total Education survey
  enrolled = "B14007_002",              # Total enrolled
  female_public_school = "B14003_031",  # Total female enrolled in public school
  female_private_school = "B14003_040",  # Total female enrolled in private school
  male_public_school = "B14003_003",    # Total male enrolled in public school
  male_private_school = "B14003_012"    # Total male enrolled in private school
  
  
  
)

get_clean_acs <- function(geo, year) {
  dat <- get_acs(
    geography = geo,
    variables = variables_of_interest,
    year = year,
    survey = "acs5"
  )
  
  dat <- dat %>%
    mutate(variable = recode(variable, !!!setNames(names(variables_of_interest), variables_of_interest))) %>%
    select(GEOID, NAME, variable, estimate) %>%
    pivot_wider(names_from = variable, values_from = estimate) %>%
    mutate(
      pct_female = female_pop / total_pop * 100,
      pct_male = male_pop / total_pop * 100,
      
      pct_white = white_alone / total_pop * 100,
      pct_black = black_alone / total_pop * 100,
      pct_am_indian = am_indian_alone / total_pop * 100,
      pct_asian = asian_alone / total_pop * 100,
      pct_pacificI = pacificI_alone / total_pop * 100,
      pct_other = other_alone / total_pop * 100,
      pct_two_or_more = two_or_more / total_pop * 100,
      
      pct_hispanic = hispanic / total_pop * 100,
      pct_not_hispanic = not_hispanic / total_pop * 100,
      
      pct_divorced = (females_divorced + males_divorced) / pop_15_over,
      
      pct_hs_or_higher = (highshool_grad + ged_alt_cred + some_college_less + some_college_more +
                            associates + bachelors + masters + prof_school + doctorate) / pop_25_over * 100,
      pct_ba_or_higher = (bachelors + masters + prof_school + doctorate) / pop_25_over * 100,
      pct_doctorate = doctorate / pop_25_over * 100,
      
      pct_uninsured = ((uninsured_under_19 + uninsured_19_30 + uninsured_35_64 + uninsured_65_over) / total_insur_pop),
      
      
      pct_enrolled = (enrolled / pop_education) * 100,
      pct_public_school = ((female_public_school + male_public_school) / pop_education) * 100,
      pct_private_school = ((female_private_school + male_private_school) / pop_education) * 100
      
    ) %>%
    mutate(geography = geo, year = year) %>%   # <- tag geography + year
    select(GEOID, NAME, state_name = NAME, geography, year,
           total_pop, pct_female:pct_private_school, med_household_income)
  
  return(dat)
}

geos <- c("us", "state", "county", "congressional district")
years <- 2013:2023   # last 10 years

all_data <- purrr::map_dfr(years, function(y) {
  purrr::map_dfr(geos, function(g) get_clean_acs(g, y))
})

# Convert any "NA" strings to NA, handling different column types
cleaned_data <- all_data %>%
  mutate(across(where(is.character), ~ifelse(. == "NA", NA_character_, .)))



write_csv(cleaned_data, "cleaned_data/census_data.csv", na = "")