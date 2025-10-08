from .supabase_client import supabase

def aggregate_state_results(state_name: str):
    response = supabase.rpc("aggregate_state_results", { "state_name": state_name }).execute()
    return response.data

def fetch_county_results(state_name: str, county: str):
    response = supabase.rpc("fetch_county_results", {"state_name": state_name, "county": county}).execute()
    return response.data

def fetch_health_state(state_full: str, state_name: str):
    print(state_full, state_name)
    response = supabase.rpc("fetch_health_state", {"state_name": state_name, "county_name": state_full}).execute()
    return response.data

def fetch_health_county(state_name: str, county: str):
    response = supabase.rpc("fetch_health_county", {"state_name": state_name, "county": county}).execute()
    return response.data

