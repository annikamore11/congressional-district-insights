library(dplyr)
library(tidyr)
library(readr)
library(plotly)
library(stringr)

# Set working directory to data_processing folder
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
raw_data <- read.csv("raw_data/countypres_2000-2024.csv")

raw_data <- raw_data %>%
  group_by(year, state_po, county_name, party) %>%
  filter(!(state_po == "TX" & party == "OTHER" &
             candidatevotes == max(candidatevotes))) %>%
  ungroup()

############ CHECK FOR UNIQUE MODES (DUPLICATE VOTES) ##########
election_00 <- raw_data %>% filter(year == 2000)
unique(election_00$mode)
# Completed check, only TOTAL mode value

election_04 <- raw_data %>% filter(year == 2004)
unique(election_04$mode)
# Completed check, only TOTAL mode value

election_08 <- raw_data %>% filter(year == 2008)
unique(election_08$mode)
# Completed check, only TOTAL mode value

election_12 <- raw_data %>% filter(year == 2012)
unique(election_12$mode)
# Completed check, only TOTAL mode value

election_16 <- raw_data %>% filter(year == 2016)
unique(election_16$mode)
# Completed check, only TOTAL mode value

election_20 <- raw_data %>% filter(year == 2020)
unique(election_20$mode)
# 16 modes found, inspect

election_24 <- raw_data %>% filter(year == 2024)
unique(election_24$mode)
# 10 modes found, inspect

################################# CLEAN 2020 ELECTION DATA ###############################
############## Step 1 ###############
# Check which counties don't have total for a mode
counties_without_total<- election_20 %>%
  group_by(state_po, county_name) %>%
  filter(!any(mode %in% c("TOTAL"))) %>%
  distinct(state_po, county_name)

# Aggregate votes by party for those counties 
summed_totals <- election_20 %>%
  semi_join(counties_without_total, by = c("state_po", "county_name")) %>%
  group_by(state_po, county_name, party) %>%
  summarise(
    candidatevotes = sum(candidatevotes, na.rm = TRUE),
    across(-candidatevotes, ~ first(.x)),
    .groups = "drop"
  ) %>%
  mutate(mode = "TOTAL")

# Remove the old rows for those counties
election_20_clean <- election_20 %>%
  anti_join(counties_without_total, by = c("state_po", "county_name"))

# Add the new "TOTAL" rows back in
election_20 <- bind_rows(election_20_clean, summed_totals)

############## Step 2 ###############
# A couple counties in UT had TOTAL and also other modes so just filter to rows with TOTAL for mode
election_20 <- election_20 %>%
  filter(mode == "TOTAL")


################################# CLEAN 2024 ELECTION DATA ###############################
############## Step 1 ###############
# For counties with no "" mode or "TOTAL VOTES" mode, add up candidatevotes by party so there are only 4 values, and rename modes to TOTAL VOTES
# Find problem counties
counties_without_blank_or_total <- election_24 %>%
  group_by(state_po, county_name) %>%
  filter(!any(mode %in% c("", "TOTAL VOTES"))) %>%
  distinct(state_po, county_name)

## Fix NM and SD mode mixups
election_fixed <- election_24 %>%
  # Standardize SD naming
  mutate(mode = ifelse(mode == "VOTE CENTER", "TOTAL VOTES", mode)) %>%
  
  # Flag counties that already have TOTAL/blank modes
  group_by(state_po, county_name) %>%
  mutate(has_total = any(mode %in% c("", "TOTAL VOTES"))) %>%
  ungroup()

# Split into those with totals and those without
have_total <- election_fixed %>% filter(has_total)
no_total   <- election_fixed %>% filter(!has_total)

# Aggregate only counties missing totals
no_total_fixed <- no_total %>%
  group_by(state_po, county_name, party) %>%
  summarise(
    candidatevotes = sum(candidatevotes, na.rm = TRUE),
    across(-candidatevotes, ~ first(.x)),
    .groups = "drop"
  ) %>%
  mutate(mode = "TOTAL VOTES")


# Combine everything back — both fixed and untouched counties
election_24 <- bind_rows(have_total, no_total_fixed) %>%
  select(-has_total)
######################################
############## Step 2 #################
# Get rid of any rows with modes that aren't "" or TOTAL VOTES
election_24 <- election_24 %>%
  filter(mode %in% c("", "TOTAL VOTES"))

########################################
############### Step 3 ################
# Filter out TOTAL VOTES CAST, UNDERVOTES, OVERVOTES from candidate
election_24 <- election_24 %>%
  filter(
    !candidate %in% c("TOTAL VOTES CAST", "UNDERVOTES", "OVERVOTES")
  )

#########################################
################ Step 4 #################
# for remaining counties that have more than 4 "", group values by party so there are only 4 rows
# Check which counties have more than 4 "" rows
counties_with_extra_blank_modes <- election_24 %>%
  filter(mode == "") %>%                                 
  group_by(state_po, county_name) %>%                     
  summarise(blank_count = n(), .groups = "drop") %>%      
  filter(blank_count > 4)  

fixed_blank_totals <- election_24 %>%
  semi_join(counties_with_extra_blank_modes, by = c("state_po", "county_name")) %>%
  filter(mode == "") %>%
  group_by(state_po, county_name, party) %>%
  summarise(
    candidatevotes = sum(candidatevotes, na.rm = TRUE),
    across(-candidatevotes, ~ first(.x)),
    .groups = "drop"
  ) %>%
  mutate(mode = "TOTAL VOTES")

election_24 <- election_24 %>%
  anti_join(counties_with_extra_blank_modes, by = c("state_po", "county_name")) %>%
  bind_rows(fixed_blank_totals)

#########################################
################ Step 5 #################
# rename all "" modes to TOTAL_VOTES
election_24 <- election_24 %>%
  mutate(
    mode = ifelse(mode == "", "TOTAL VOTES", mode)
  )

#########################################
################ Step 6 #################
# rename all modes to TOTAL
election_24 <- election_24 %>%
  mutate(
    mode = ifelse(mode == "TOTAL VOTES", "TOTAL", mode)
  )

#########################################
################ Step 7 #################
# Verify how many counties have more than 4 rows for 2024
counties_with_too_many_rows <- election_24 %>%
  group_by(state_po, county_name) %>%
  summarise(row_count = n(), .groups = "drop") %>%
  filter(row_count > 4)

# Combine duplicate OTHER party rows
election_24 <- election_24 %>%
  group_by(state_po, county_name, party) %>%
  summarise(
    candidatevotes = sum(candidatevotes, na.rm = TRUE),
    across(-candidatevotes, ~ first(.x)),
    .groups = "drop"
  )


################################## MERGE AND WRITE TO CLEANED DATASET ####################
# Step 1: remove old 2020 + 2024 rows
raw_data_cleaned <- raw_data %>%
  filter(!year %in% c(2020, 2024))

# Step 2: add cleaned 2020 + 2024 data back in
raw_data_cleaned <- bind_rows(raw_data_cleaned, election_20, election_24)

# Step 3: sort by year, state, county, party
raw_data_cleaned <- raw_data_cleaned %>%
  arrange(year, state_po, county_name, party)

# Step 4: write to CSV
write_csv(raw_data_cleaned, "cleaned_data/cleaned_countypres_2000-2024.csv")

