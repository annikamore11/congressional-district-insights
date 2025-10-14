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

v <- load_variables(2023, "acs5/subject", cache = TRUE)
View(v %>% filter(str_detect(name, "DP04")))

# Search for variables containing a specific word or search for descriptions based on variable code
pop_vars <- acs_vars %>%
  filter(grepl("B25091", name, ignore.case = TRUE))



# Choose variables 
variables_of_interest <- c(
  poverty_pop = "S1701_C03_001",        # Total population for which poverty is determined
  med_household_income = "B19013_001",   # Median Household Income
  gini_index = "B19083_001",             # income inequality
  
  labor_force_rate = "S2301_C02_001",    # Labor force rate
  unemployment_rate = "S2301_C04_001",   #Unemployment Rate
  
  med_gross_rent = "B25064_001",         # median gross rent
  med_home_value = "B25077_001",         # Median home value
  
  total_renters = "B25070_001",
  renters1 = "B25070_007",
  renters2 = "B25070_008",
  renters3 = "B25070_009",
  renters4 = "B25070_010",
  
  total_home_with_mortgage = "B25091_002",
  home1 = "B25091_008",
  home2 = "B25091_009",
  home3 = "B25091_010",
  home4 = "B25091_011",
  home5 = "B25091_012",
  
  total_home_without_mortgage = "B25091_013",
  home7 = "B25091_014",
  home8 = "B25091_015",
  home9 = "B25091_016",
  home10 = "B25091_017",
  home11 = "B25091_018",
  home12 = "B25091_019",
  home13 = "B25091_020",
  home14 = "B25091_021",
  home15 = "B25091_022"
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
      pct_renters = (total_renters/(total_renters + total_home_with_mortgage + total_home_without_mortgage)) * 100,
      pct_homeowners = ((total_home_with_mortgage + total_home_without_mortgage)/ (total_renters + total_home_with_mortgage + total_home_without_mortgage)) * 100,
      
      pct_renters_cost_burdened = ((renters1 + renters2 + renters3 + renters4) / total_renters)* 100,
      pct_homeowners_cost_burdened = ((home1 + home2 + home3 +home4 + home5 + home7 + home8 + home9 + home10 + home11 + home12 + home13 + home14 + home15)/
        (total_home_with_mortgage + total_home_without_mortgage)) * 100
      
    ) %>%
    
    mutate(geography = geo, year = year) %>%   # <- tag geography + year
    select(GEOID, NAME, state_name = NAME, geography, year, poverty_pop, med_household_income, gini_index, labor_force_rate, unemployment_rate,
           med_gross_rent, med_home_value, pct_renters, pct_homeowners, pct_renters_cost_burdened, pct_homeowners_cost_burdened)
  
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



write_csv(cleaned_data, "cleaned_data/census_economic_data.csv", na = "")