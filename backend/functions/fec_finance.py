import os
import requests
import yaml
from dotenv import load_dotenv

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

# Get the fec id for a member from geocodio (fec id not included in returned json)
def get_member_fec(bio_id):
    folks = load_legislators()
    member_fec_ids = []
    for person in folks:
        if person.get("id", {}).get("bioguide") == bio_id:
            fec_ids = person.get("id", {}).get("fec", [])
            if fec_ids:  
                member_fec_ids.extend(fec_ids)
    return member_fec_ids

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

    if not results:
        return {"error": f"No results found for candidate ID {fec_id}", "status_code": r.status_code}

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