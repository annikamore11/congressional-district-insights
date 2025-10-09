from .supabase_client import supabase

## Supabase queries for Civics Data
def aggregate_state_results(state_name: str):
    response = supabase.rpc("aggregate_state_results", { "state_name": state_name }).execute()
    return response.data

def fetch_county_results(state_name: str, county: str):
    response = supabase.rpc("fetch_county_results", {"state_name": state_name, "county": county}).execute()
    return response.data

## Supabase queries for Health Data
def fetch_health_state(state_full: str, state_name: str):
    response = supabase.rpc("fetch_health_state", {"state_name": state_name, "county_name": state_full}).execute()
    return response.data

def fetch_health_county(state_name: str, county: str):
    response = supabase.rpc("fetch_health_county", {"state_name": state_name, "county": county}).execute()
    return response.data

## Supabase queries for Demographics Data
def fetch_demographics_state(state_full: str, state_name: str):
    response = supabase.rpc("fetch_demographics_state", {"state_param": state_name, "county_param": state_full}).execute()
    return response.data

def fetch_demographics_county(state_name: str, county: str):
    response = supabase.rpc("fetch_demographics_county", {"state_param": state_name, "county_param": county}).execute()
    return response.data