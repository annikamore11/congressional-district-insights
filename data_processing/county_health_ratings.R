library(dplyr)
library(tidyr)
library(readr)
library(plotly)
library(stringr)

# Set working directory to data_processing folder
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
trends_raw <- read.csv("raw_data/chr_trends_csv_2025.csv")

# Clean the data
trends_clean <- trends_raw %>%
  mutate(
    measurename = case_when(
      measurename == "Premature death" ~ "premature_death",
      measurename == "Uninsured adults" ~ "uninsured_adults",
      measurename == "Primary care physicians" ~ "prim_care_physicians",
      measurename == "Preventable hospital stays" ~ "preventable_hospital_stays",
      measurename == "Unemployment rate" ~ "unemployment_rate",
      measurename == "Children in poverty" ~ "children_in_poverty",
      measurename == "Sexually transmitted infections" ~ "sexually_transmitted_infections",
      measurename == "Mammography screening" ~ "mammography_screening",
      measurename == "Uninsured" ~ "uninsured",
      measurename == "Dentists" ~ "dentists",
      measurename == "Uninsured children" ~ "uninsured_children",
      measurename == "Air pollution - particulate matter" ~ "air_pollution_particulate_matter",
      measurename == "Alcohol-impaired driving deaths" ~ "alcohol_impaired_driving_deaths",
      measurename == "Flu vaccinations" ~ "flu_vaccinations",
      measurename == "School funding" ~ "school_funding",
      TRUE ~ NA_character_
    ),
    yearspan = as.character(yearspan),
    rawvalue = as.numeric(str_replace_all(rawvalue, ",","")),
    year_numeric = str_extract(yearspan, "[0-9]{4}") %>% as.numeric(),
    end_year = str_extract(yearspan, "(?<=-)[0-9]{4}") %>% as.numeric(),
    year_numeric = ifelse(!is.na(end_year), end_year, year_numeric)
  ) %>%
  mutate(across(where(is.character), ~na_if(., "NA"))) %>%
  mutate(across(where(is.numeric), ~ifelse(is.na(.), NA_real_, .))) %>%
  filter(!is.na(measurename))  # Remove any unmapped measures

# Convert to wide format
trends_wide <- trends_clean %>%
  select(state, county, statecode, countycode, year_numeric, measurename, rawvalue) %>%
  pivot_wider(
    names_from = measurename,
    values_from = rawvalue,
    values_fn = mean  # In case there are duplicates, take the mean
  )


# Save wide format
write_csv(
  trends_wide,
  "cleaned_data/chr_trends_cleaned.csv",
  na = ""
)
View(trends_wide)
print(nrow(trends_wide))