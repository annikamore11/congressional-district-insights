import os
import requests
import yaml
from flask import Flask, jsonify, request 
from flask_cors import CORS
from dotenv import load_dotenv
from constants import STATE_FULL
from database.queries import (
    aggregate_state_results, fetch_county_results, 
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

# Endpoint to list states
@app.route("/api/states")
def api_states():
    states = group_by_state()
    return jsonify(sorted(list(states.keys())))

# Endpoint to list members for selected state
@app.route("/api/members/<state>")
def api_members(state):
    states = group_by_state()
    members = states.get(state.upper(), [])
    return jsonify(members)

# Endpoint to return the totals from fetch_fec_totals function
@app.route("/api/member_fec", methods=["POST"])
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
@app.route("/api/member_fec_state_top5", methods=["POST"])
def api_member_fec_state_top5():
    payload = request.get_json() or {}
    fec_ids = payload.get("fec_ids", [])
    cycle = payload.get("cycle", 2024)

    if not fec_ids:
        return jsonify({"error": "No FEC IDs provided"}), 400

    # Try each FEC ID until one returns results
    for fid in fec_ids:
        fid = fid.strip()
        if not fid:
            continue

        results = fetch_fec_state_totals(fid, cycle)

        # Skip if it errored or returned nothing
        if isinstance(results, dict) and "error" in results:
            continue
        if not results:
            continue

        # Return the first valid FEC ID's top 5 states
        return jsonify({"fec_id": fid, "cycle": cycle, "state_totals": results})

    return jsonify({"error": "No valid FEC results found for provided IDs"}), 404


# Endpoint to return the top individual contributors from the fetch_top_contributors function
@app.route("/api/top_contributors", methods=["POST"])
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
        
        # Get primary committee id 
        committee_id = fetch_member_primary_committee(fid, cycle)
       
        if isinstance(committee_id, dict) and "error" in committee_id:
            continue
        if not committee_id:
            continue
        
        # get top contributors for primary committee
        results = fetch_fec_top_contributors(committee_id, cycle)
        
        if isinstance(results, dict) and "error" in results:
            continue
        if not results:
            continue
        
        return jsonify({"committee_id": committee_id, "cycle": cycle, "top_contributors": results})

    return jsonify({"error": "No valid FEC results found for provided IDs"}), 404

## Retrieve Historical Election Trends 
@app.route("/api/state/<state_name>")
def get_state_results(state_name):
    results = aggregate_state_results(state_name)
    return jsonify({
        "state": state_name,
        "results": results
    })

@app.route("/api/county/<state_name>/<county>")
def get_county_results(state_name, county):
    print(county)
    results = fetch_county_results(state_name, county)
    return jsonify({
        "state": state_name,
        "county": county,
        "results": results
    })


@app.route("/api/geocode")
def geocode():
    """Geocode address/ZIP or reverse geocode lat/lng using Geocodio"""
    query = request.args.get("q")  # Address or ZIP
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    
    if not query and not (lat and lng):
        return jsonify({"error": "Missing query or lat/lng parameters"}), 400
    
    try:
        # Determine if this is forward geocoding or reverse geocoding
        if query:
            # Forward geocoding (address or ZIP)
            url = f"https://api.geocod.io/v1.9/geocode?q={query}&fields=cd&api_key={GEOCODIO_KEY}"
        else:
            # Reverse geocoding (lat/lng)
            url = f"https://api.geocod.io/v1.9/reverse?q={lat},{lng}&fields=cd&api_key={GEOCODIO_KEY}"
        
        resp = requests.get(url, timeout=10)
        data = resp.json()
        
        if data.get("results"):
            result = data["results"][0]
            location = result["location"]
            components = result["address_components"]
            cd_fields = result.get("fields", {}).get("congressional_districts", [])
            
            # Extract legislators if available
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

## Retrieve County Health Ratings Data
@app.route("/api/health/state/<state_full>/<state_name>")
def get_health_state_results(state_full, state_name):
    results = fetch_health_state(state_full, state_name)
    return jsonify({
        "state": state_name,
        "results": results
    })

@app.route("/api/health/county/<state_name>/<county>")
def get_health_county_results(state_name, county):
    results = fetch_health_county(state_name, county)
    return jsonify({
        "state": state_name,
        "county": county,
        "results": results
    })

## Retrieve Census Data 
@app.route("/api/demographics/state/<state_full>/<state_name>")
def get_demographics_state_results(state_full, state_name):
    results = fetch_demographics_state(state_full, state_name)
    return jsonify({
        "state": state_name,
        "results": results
    })

@app.route("/api/demographics/county/<state_name>/<county>")
def get_demographics_county_results(state_name, county):
    results = fetch_demographics_county(state_name, county)
    return jsonify({
        "state": state_name,
        "county": county,
        "results": results
    })

## Retrieve Education Data 
@app.route("/api/education/state/<state_full>/<state_name>")
def get_education_state_results(state_full, state_name):
    results = fetch_education_state(state_full, state_name)
    return jsonify({
        "state": state_name,
        "results": results
    })

@app.route("/api/education/county/<state_name>/<county>")
def get_education_county_results(state_name, county):
    results = fetch_education_county(state_name, county)
    return jsonify({
        "state": state_name,
        "county": county,
        "results": results
    })

# Retrieve Economy Data 
@app.route("/api/economy/state/<state_full>/<state_name>")
def get_economy_state_results(state_full, state_name):
    results = fetch_economy_state(state_full, state_name)
    return jsonify({
        "state": state_name,
        "results": results
    })

@app.route("/api/economy/county/<state_name>/<county>")
def get_economy_county_results(state_name, county):
    results = fetch_economy_county(state_name, county)
    return jsonify({
        "state": state_name,
        "county": county,
        "results": results
    })
if __name__ == "__main__":
    app.run(debug=True, port=5001)
