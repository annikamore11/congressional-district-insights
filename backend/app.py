import os
import requests
import yaml
from flask import Flask, jsonify, request 
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()
FEC_API_KEY = os.getenv("FEC_API_KEY")

# URL for congress-legislators github repo
LEGIS_URL = "https://raw.githubusercontent.com/unitedstates/congress-legislators/master/legislators-current.yaml"

EXCLUDE_EMPLOYERS = {
    "RETIRED",
    "RETRIED",
    "INFORMATION REQUESTED PER BEST EFFORTS",
    "ENTREPRENEUR",
    "SELF-EMPLOYED",
    "SELF EMPLOYED",
    "SELF",
    "UNEMPLOYED",
    "HOMEMAKER",
    "HOUSE WIFE",
    "HOUSEWIFE",
    "NOT EMPLOYED",
    "NONE",
    "NULL",
    "N/A",
}

app = Flask(__name__)
CORS(app)  

# in-memory cache
_cache = {"legislators": None, "states": None}

# Fetch legislators from github repo
def load_legislators():
    if _cache["legislators"] is not None:
        return _cache["legislators"]
    r = requests.get(LEGIS_URL, timeout=10)
    r.raise_for_status()
    folks = yaml.safe_load(r.text)
    _cache["legislators"] = folks
    return folks

# Group legislators by state 
def group_by_state():
    if _cache["states"] is not None:
        return _cache["states"]
    folks = load_legislators()
    states = {}
    for person in folks:
        terms = person.get("terms", [])
        if not terms:
            continue
        latest = terms[-1]
        state = latest.get("state")
        role = latest.get("type")  
        if not state:
            continue
        entry = {
            "name": f"{person.get('name', {}).get('first','')} {person.get('name', {}).get('last','')}".strip(),
            "role": role,
            "party": latest.get("party"),
            "bio_id": person.get("id", {}).get("bioguide"),
            "fec_ids": person.get("id", {}).get("fec", []) or []
        }
        states.setdefault(state.upper(), []).append(entry)
    _cache["states"] = states
    return states

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

# Function to get cash, debts, raised, and spent for members to create finance overview bar chart
def fetch_fec_totals(fec_id, cycle=2024):
    """Fetch FEC totals for a candidate for a specific cycle"""
    base = f"https://api.open.fec.gov/v1/candidate/{fec_id}/totals/"
    params = {"api_key": FEC_API_KEY, "cycle": cycle, "per_page": 100}
    r = requests.get(base, params=params, timeout=10)
    if r.status_code != 200:
        return {"error": r.text, "status_code": r.status_code}
    data = r.json()
    results = data.get("results", [])
    summary = {
        "fec_id": fec_id,
        "cycle": cycle,
        "cash_on_hand": 0.0,
        "debts": 0.0,
        "receipts": 0.0,
        "disbursements": 0.0,
        "large_contributions": 0.0,
        "small_contributions": 0.0,
        "PAC_contributions": 0.0,
        "candidate_contributions": 0.0,
        "other_contributions": 0.0,
        "raw": results
    }
    for row in results:
        summary["cash_on_hand"] += float(row.get("last_cash_on_hand_end_period") or 0)
        summary["debts"] += float(row.get("last_debts_owed_by_committee") or 0)
        summary["receipts"] += float(row.get("receipts") or 0)
        summary["disbursements"] += float(row.get("disbursements") or 0)
        summary["large_contributions"] += float(row.get("individual_itemized_contributions"))
        summary["small_contributions"] += float(row.get("individual_unitemized_contributions"))
        summary["PAC_contributions"] += float(row.get("other_political_committee_contributions"))
        summary["candidate_contributions"] += float(row.get("candidate_contribution"))
    
    summary["other_contributions"] = summary["receipts"] - summary["large_contributions"] - summary["small_contributions"] - summary["PAC_contributions"] - summary["candidate_contributions"]
  
    return summary

# Function to get top 5 states contributors for a member
def fetch_fec_state_totals(fec_id, cycle=2024):
    base = f"https://api.open.fec.gov/v1/schedules/schedule_a/by_state/by_candidate/"
    params = {"api_key": FEC_API_KEY, "cycle": cycle, "per_page": 100, "sort": "-total", "candidate_id": fec_id, "election_full": "false"}
    r = requests.get(base, params=params, timeout=10)
    if r.status_code != 200:
        return {"error": r.text, "status_code": r.status_code}
    data = r.json()
    results = data.get("results", [])
    first5 = results[:5]

    first5_summary = []
    for row in first5:
        state = row.get("state")
        total = row.get("total")
        first5_summary.append({"state": state, "total": total})
 
    return first5_summary

# Function to get a member's primary committee for given cycle
def fetch_member_primary_committee(fec_id, cycle=2024):
    base = f"https://api.open.fec.gov/v1/candidates/search/"
    params = {"api_key": FEC_API_KEY, "cycle": cycle, "per_page": 100, "candidate_id": fec_id}
    r = requests.get(base, params=params, timeout=10)
    if r.status_code != 200:
        return {"error": r.text, "status_code": r.status_code}
    data = r.json()
    results = data.get("results", [])

    candidate = results[0]
    principal_committees = candidate.get("principal_committees", [])
    if principal_committees:
        committee_id = principal_committees[0].get("committee_id")
    
    return committee_id

# Function to get top INDIVIDUAL contributors for a member and cycle. This exclued PAC and Committee donations
def fetch_fec_top_contributors(committee_id, cycle=2024):
    """Fetch FEC individual top contributors for a member and cycle"""
    base = f"https://api.open.fec.gov/v1/schedules/schedule_a/by_employer/"
    params = {"api_key": FEC_API_KEY, "cycle": cycle, "per_page": 100, "sort": "-total", "committee_id": committee_id}
    r = requests.get(base, params=params, timeout=10)
    if r.status_code != 200:
        return {"error": r.text, "status_code": r.status_code}
    data = r.json()
    results = data.get("results", [])
    
    cleaned = []
    for row in results:
        employer = (row.get("employer") or "").strip().upper()
        total = row.get("total", 0)
        # Skip excluded/empty/typo variants
        if not employer or employer in EXCLUDE_EMPLOYERS:
            continue
        cleaned.append({"employer": row.get("employer"), "total": total})

    
    first10_summary = cleaned[:10]
    return first10_summary

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)), debug=True)
