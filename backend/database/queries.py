from .supabase_client import supabase
from typing import List, Dict, Any

#### Supabase functions can be found in ./database_sql_functions.sql

def _safe_rpc_call(function_name: str, params: Dict[str, Any]) -> List[Dict]:
    """
    Generic helper to safely execute Supabase RPC calls with error handling.
    
    Args:
        function_name: Name of the Supabase RPC function
        params: Parameters dictionary
    
    Returns:
        List of results, or empty list if error/no data
    """
    try:
        response = supabase.rpc(function_name, params).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error in {function_name}: {e}")
        return []


## Supabase queries for Civics Data
def fetch_election_state(state_abbr: str) -> List[Dict]:
    """Fetch state-level election results"""
    return _safe_rpc_call("fetch_election_state", {"state_name": state_abbr})

def fetch_election_county(state_abbr: str, county: str) -> List[Dict]:
    """Fetch county-level election results"""
    return _safe_rpc_call("fetch_election_county", {
        "state_name": state_abbr,
        "county": county
    })


## Supabase queries for Demographics Data
def fetch_demographics_state(state_abbr: str, state_full_name: str) -> List[Dict]:
    """
    Fetch state-level demographics data.
    
    NOTE: Database structure quirk - state-level rows store the full state name 
    in the 'county' column (e.g., state=ME, county=Maine)
    
    Args:
        state_abbr: State abbreviation (e.g., "ME")
        state_full_name: Full state name (e.g., "Maine") - stored in county column
    """
    return _safe_rpc_call("fetch_demographics_state", {
        "state_param": state_abbr,
        "county_param": state_full_name  # Full state name goes to county_param
    })

def fetch_demographics_county(state_abbr: str, county: str) -> List[Dict]:
    """Fetch county-level demographics data"""
    return _safe_rpc_call("fetch_demographics_county", {
        "state_param": state_abbr,
        "county_param": county
    })


## Supabase queries for Health Data
def fetch_health_state(state_abbr: str, state_full_name: str) -> List[Dict]:
    """
    Fetch state-level health data.
    
    NOTE: Database structure quirk - state-level rows store the full state name 
    in the 'county' column (e.g., state=ME, county=Maine)
    
    Args:
        state_abbr: State abbreviation (e.g., "ME")
        state_full_name: Full state name (e.g., "Maine") - stored in county column
    """
    return _safe_rpc_call("fetch_health_state", {
        "state_param": state_abbr,
        "county_param": state_full_name  # Full state name goes to county_param
    })

def fetch_health_county(state_abbr: str, county: str) -> List[Dict]:
    """Fetch county-level health data"""
    return _safe_rpc_call("fetch_health_county", {
        "state_param": state_abbr,
        "county_param": county
    })


## Supabase queries for Education Data
def fetch_education_state(state_abbr: str, state_full_name: str) -> List[Dict]:
    """
    Fetch state-level education data.
    
    NOTE: Database structure quirk - state-level rows store the full state name 
    in the 'county' column (e.g., state=ME, county=Maine)
    
    Args:
        state_abbr: State abbreviation (e.g., "ME")
        state_full_name: Full state name (e.g., "Maine") - stored in county column
    """
    return _safe_rpc_call("fetch_education_state", {
        "state_param": state_abbr,
        "county_param": state_full_name  # Full state name goes to county_param
    })

def fetch_education_county(state_abbr: str, county: str) -> List[Dict]:
    """Fetch county-level education data"""
    return _safe_rpc_call("fetch_education_county", {
        "state_param": state_abbr,
        "county_param": county
    })


## Supabase queries for Economic Data
def fetch_economy_state(state_abbr: str, state_full_name: str) -> List[Dict]:
    """
    Fetch state-level economy data.
    
    NOTE: Database structure quirk - state-level rows store the full state name 
    in the 'county' column (e.g., state=ME, county=Maine)
    
    Args:
        state_abbr: State abbreviation (e.g., "ME")
        state_full_name: Full state name (e.g., "Maine") - stored in county column
    """
    return _safe_rpc_call("fetch_economy_state", {
        "state_param": state_abbr,
        "county_param": state_full_name  # Full state name goes to county_param
    })

def fetch_economy_county(state_abbr: str, county: str) -> List[Dict]:
    """Fetch county-level economy data"""
    return _safe_rpc_call("fetch_economy_county", {
        "state_param": state_abbr,
        "county_param": county
    })