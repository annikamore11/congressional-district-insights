import os
import requests
from flask import Flask, jsonify, request 
from flask_cors import CORS
from dotenv import load_dotenv
from constants import STATE_FULL
from database.queries import (
    fetch_election_state, fetch_election_county, 
    fetch_health_state, fetch_health_county, 
    fetch_demographics_state, fetch_demographics_county,
    fetch_education_state, fetch_education_county,
    fetch_economy_state, fetch_economy_county
)
from functions.fec_finance import (
    group_by_state, fetch_fec_totals,
    fetch_fec_state_totals, fetch_member_primary_committee,
    fetch_fec_top_contributors
)

# Load environment variables from .env
load_dotenv()
GEOCODIO_KEY = os.getenv("GEOCODIO_KEY")

app = Flask(__name__)
CORS(app)

# Mapping of category names to fetch functions
STATE_FETCHERS = {
    "civics": fetch_election_state,  
    "health": fetch_health_state,
    "demographics": fetch_demographics_state,
    "education": fetch_education_state,
    "economy": fetch_economy_state
}

COUNTY_FETCHERS = {
    "civics": fetch_election_county,  
    "health": fetch_health_county,
    "demographics": fetch_demographics_county,
    "education": fetch_education_county,
    "economy": fetch_economy_county
}

VALID_CATEGORIES = ["civics", "health", "demographics", "education", "economy"]


def get_state_full_name(state_abbr: str) -> str:
    """Get full state name from abbreviation"""
    return STATE_FULL.get(state_abbr, state_abbr)


def fetch_category_data(category: str, geography_type: str, state_abbr: str, county: str = None):
    """
    Fetch data for a specific category and geography.
    
    NOTE: Database structure quirk - state-level rows use the 'county' column 
    to store the full state name (e.g., state=ME, county=Maine).
    County-level rows use it normally (e.g., state=ME, county=Cumberland).
    
    Args:
        category: Data category (health, demographics, etc.)
        geography_type: "state" or "county"
        state_abbr: State abbreviation (e.g., "ME")
        county: County name (for county requests) or full state name (for state requests)
    
    Returns:
        List of results or empty list on error
    """
    fetchers = STATE_FETCHERS if geography_type == "state" else COUNTY_FETCHERS
    fetch_func = fetchers.get(category)
    
    if not fetch_func:
        return []
    
    try:
        state_full = get_state_full_name(state_abbr)
        
        if geography_type == "state":
            # State-level queries need different params based on category
            if category in ["civics"]:
                results = fetch_func(state_abbr)
            else:
                results = fetch_func(state_abbr, state_full)
        else:
            # County-level queries
            results = fetch_func(state_abbr, county)
        
        return results
    
    except Exception as e:
        print(f"Error fetching {category} data: {e}")
        return []


# ============================================
# RESTFUL ENDPOINTS
# ============================================

@app.route("/api/state/<state_abbr>")
def get_state_data(state_abbr):
    """
    Get state-level data for one or more categories.
    
    Query params:
        category: Specific category (health, demographics, etc.) or "all"
        categories: Comma-separated list (health,demographics,economy)
    
    Examples:
        /api/state/ME?category=health
        /api/state/ME?category=all
        /api/state/ME?categories=health,demographics
    """
    state_abbr = state_abbr.upper()
    
    # Get requested category/categories
    single_category = request.args.get("category")
    multiple_categories = request.args.get("categories")
    
    # Default to all categories if none specified
    if not single_category and not multiple_categories:
        categories_to_fetch = VALID_CATEGORIES
    elif single_category == "all":
        categories_to_fetch = VALID_CATEGORIES
    elif multiple_categories:
        categories_to_fetch = [c.strip() for c in multiple_categories.split(",")]
    else:
        categories_to_fetch = [single_category]
    
    # Validate categories
    invalid = [c for c in categories_to_fetch if c not in VALID_CATEGORIES]
    if invalid:
        return jsonify({
            "error": f"Invalid categories: {', '.join(invalid)}",
            "valid_categories": VALID_CATEGORIES
        }), 400
    
    # Fetch data for each category
    data = {}
    for category in categories_to_fetch:
        result = fetch_category_data(category, "state", state_abbr)
        data[category] = result
    
    return jsonify({
        "state": state_abbr,
        "state_full": get_state_full_name(state_abbr),
        "data": data
    })


@app.route("/api/county/<state_abbr>/<county>")
def get_county_data(state_abbr, county):
    """
    Get county-level data for one or more categories.
    
    Query params:
        category: Specific category or "all"
        categories: Comma-separated list
    
    Examples:
        /api/county/ME/York?category=health
        /api/county/ME/York?category=all
        /api/county/ME/York?categories=health,demographics
    """
    state_abbr = state_abbr.upper()
    
    # Get requested category/categories
    single_category = request.args.get("category")
    multiple_categories = request.args.get("categories")
    
    # Default to all categories if none specified
    if not single_category and not multiple_categories:
        categories_to_fetch = VALID_CATEGORIES
    elif single_category == "all":
        categories_to_fetch = VALID_CATEGORIES
    elif multiple_categories:
        categories_to_fetch = [c.strip() for c in multiple_categories.split(",")]
    else:
        categories_to_fetch = [single_category]
    
    # Validate categories
    invalid = [c for c in categories_to_fetch if c not in VALID_CATEGORIES]
    if invalid:
        return jsonify({
            "error": f"Invalid categories: {', '.join(invalid)}",
            "valid_categories": VALID_CATEGORIES
        }), 400
    
    # Fetch data for each category
    data = {}
    for category in categories_to_fetch:
        result = fetch_category_data(category, "county", state_abbr, county)
        data[category] = result
    
    return jsonify({
        "state": state_abbr,
        "state_full": get_state_full_name(state_abbr),
        "county": county,
        "data": data
    })




# Endpoint to list states
@app.route("/api/states")
def api_states():
    states = group_by_state()
    return jsonify(sorted(list(states.keys())))

# Endpoint to list members for selected state
@app.route("/api/member/<state>")
def api_members(state):
    states = group_by_state()
    members = states.get(state.upper(), [])
    return jsonify(members)

# Endpoint to return the totals from fetch_fec_totals function
@app.route("/api/member/fec_totals", methods=["POST"])
def api_member_fec():
    payload = request.get_json() or {}
    fec_ids = payload.get("fec_ids", [])
    cycle = payload.get("cycle", 2024)
    if not fec_ids:
        return jsonify({"error": "No FEC IDs provided"}), 400
    
    out = {"by_fec_id": [], "aggregated": {"cash_on_hand": 0, "debts": 0, "receipts": 0, "disbursements": 0, "large_contributions": 0, "small_contributions": 0, 
                                           "PAC_contributions": 0, "candidate_contributions": 0, "other_contributions": 0}}
    for fid in fec_ids:
        fid = fid.strip()
        if not fid:
            continue
        res = fetch_fec_totals(fid, cycle)
        out["by_fec_id"].append(res)
        if "error" not in res:
            out["aggregated"]["cash_on_hand"] += res["cash_on_hand"]
            out["aggregated"]["debts"] += res["debts"]
            out["aggregated"]["receipts"] += res["receipts"]
            out["aggregated"]["disbursements"] += res["disbursements"]
            out["aggregated"]["large_contributions"] += res["large_contributions"]
            out["aggregated"]["small_contributions"] += res["small_contributions"]
            out["aggregated"]["PAC_contributions"] += res["PAC_contributions"]
            out["aggregated"]["candidate_contributions"] += res["candidate_contributions"]
            out["aggregated"]["other_contributions"] += res["other_contributions"]
    
    return jsonify(out)

# Endpoint to return the top state totals from the fetch_fec_state_totals function
@app.route("/api/member/fec_state_top5", methods=["POST"])
def api_member_fec_state_top5():
    payload = request.get_json() or {}
    fec_ids = payload.get("fec_ids", [])
    cycle = payload.get("cycle", 2024)

    if not fec_ids:
        return jsonify({"error": "No FEC IDs provided"}), 400

    for fid in fec_ids:
        fid = fid.strip()
        if not fid:
            continue

        results = fetch_fec_state_totals(fid, cycle)

        if isinstance(results, dict) and "error" in results:
            continue
        if not results:
            continue

        return jsonify({"fec_id": fid, "cycle": cycle, "state_totals": results})

    return jsonify({"error": "No valid FEC results found for provided IDs"}), 404

# Endpoint to return the top individual contributors
@app.route("/api/member/top_contributors", methods=["POST"])
def api_top_contributors():
    payload = request.get_json() or {}
    fec_ids = payload.get("fec_ids", [])
    cycle = payload.get("cycle", 2024)

    if not fec_ids:
        return jsonify({"error": "No FEC IDs provided"}), 400

    for fid in fec_ids:
        fid = fid.strip()
        if not fid:
            continue
        
        committee_id = fetch_member_primary_committee(fid, cycle)
       
        if isinstance(committee_id, dict) and "error" in committee_id:
            continue
        if not committee_id:
            continue
        
        results = fetch_fec_top_contributors(committee_id, cycle)
        
        if isinstance(results, dict) and "error" in results:
            continue
        if not results:
            continue
        
        return jsonify({"committee_id": committee_id, "cycle": cycle, "top_contributors": results})

    return jsonify({"error": "No valid FEC results found for provided IDs"}), 404

@app.route("/api/geocode")
def geocode():
    """Geocode address/ZIP or reverse geocode lat/lng using Geocodio"""
    query = request.args.get("q")
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    
    if not query and not (lat and lng):
        return jsonify({"error": "Missing query or lat/lng parameters"}), 400
    
    try:
        if query:
            url = f"https://api.geocod.io/v1.9/geocode?q={query}&fields=cd&api_key={GEOCODIO_KEY}"
        else:
            url = f"https://api.geocod.io/v1.9/reverse?q={lat},{lng}&fields=cd&api_key={GEOCODIO_KEY}"
        
        resp = requests.get(url, timeout=10)
        data = resp.json()
        
        if data.get("results"):
            result = data["results"][0]
            location = result["location"]
            components = result["address_components"]
            cd_fields = result.get("fields", {}).get("congressional_districts", [])
            
            legislators = []
            if cd_fields:
                for leg in cd_fields[0].get("current_legislators", []):
                    legislators.append({
                        "name": f"{leg['bio']['first_name']} {leg['bio']['last_name']}",
                        "role": "sen" if leg["type"] == "senator" else "rep",
                        "party": leg["bio"]["party"],
                        "bio_id": leg["references"]["bioguide_id"],
                        "photo_url": leg["bio"]["photo_url"],
                        "district": cd_fields[0].get("district_number") if leg["type"] == "representative" else None,
                        "phone": leg["contact"]["phone"],
                        "website": leg["contact"]["url"]
                    })
            
            return jsonify({
                "lat": location["lat"],
                "lng": location["lng"],
                "state": components["state"],
                "state_full": STATE_FULL.get(components["state"], components["state"]),
                "zip": components.get("zip"),
                "county": components.get("county"),
                "legislators": legislators
            })
        
        return jsonify({"error": "No results found"}), 404
    except Exception as e:
        print(f"Error in /api/geocode: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5002)
