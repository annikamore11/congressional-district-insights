import requests

API_KEY = 'otbdhhXaveJ28e2oxYxjDKb2CuSwVRlVo4aRzAIw'
base = 'https://api.open.fec.gov/v1'

TARGET_COUNT = 100  # Stop after finding 20 corporate PAC donations
EXCLUDE_KEYWORDS = ['WINRED', 'ACTBLUE', 'FOR SENATOR', 'FOR CONGRESS', 
                    'JOINT FUNDRAISING', 'VICTORY FUND', 'VICTORY COMMITTEE', 'FOR SENATE',
                    'SENATE CONSERVATIVES FUND']
EXCLUDE_ENTITY_TYPES = ['CCM']  # Campaign Committee
EXCLUDE_DESIGNATIONS = ['J', 'P']  # Joint fundraising, Principal campaign committee

corporate_contributions = []
committee_cache = {}  # Cache committee lookups to avoid duplicate API calls


# Step 1: Get all committee contributions
contributions = []
params = {
    'api_key': API_KEY,
    'committee_id': 'C00492785',  # Collins for Senator
    'is_individual': 'false',
    'two_year_transaction_period': '2026',
    'per_page': 100,
    'sort': '-contribution_receipt_amount'
}

# Initial request
response = requests.get(f'{base}/schedules/schedule_a/', params=params)
data = response.json()

page_count = 1
print(f"Processing page {page_count}...")

while len(corporate_contributions) < TARGET_COUNT:
    # Check if results exist
    if 'results' not in data or not data['results']:
        print("No more results available")
        break
        
    # Process current page
    for contrib in data['results']:
        # Skip if contrib is None
        if contrib is None:
            continue
            
        contributor_name = (contrib.get('contributor_name') or '').upper()
        entity_type = contrib.get('entity_type', '')
        
        # Quick filter: exclude by name keywords first
        if any(keyword in contributor_name for keyword in EXCLUDE_KEYWORDS):
            continue
        
        # Exclude campaign committees
        if entity_type in EXCLUDE_ENTITY_TYPES:
            continue
        
        # Check the nested contributor object if it exists
        contributor = contrib.get('contributor')
        if contributor:
            designation = contributor.get('designation', '')
            committee_type = contributor.get('committee_type', '')
            
            # Exclude joint fundraising and principal campaign committees
            if designation in EXCLUDE_DESIGNATIONS:
                continue
            
            # Keep only corporate PACs (Q) and some nonconnected PACs (N)
            # Q = Separate Segregated Fund (Corporate/Union PAC)
            # N = Nonconnected PAC (could be corporate-backed)
            if committee_type in ['Q']:
                corporate_contributions.append(contrib)
                amount = contrib.get('contribution_receipt_amount', 0)
                print(f"Found: {contributor_name} - ${amount:,.2f}")
                
                if len(corporate_contributions) >= TARGET_COUNT:
                    break
    
    # Stop if we have enough
    if len(corporate_contributions) >= TARGET_COUNT:
        print(f"\nReached target of {TARGET_COUNT} corporate PAC donations!")
        break
    
    # Check if there are more pages
    pagination = data.get('pagination', {})
    if not pagination or not pagination.get('last_indexes'):
        print("\nNo more pages available")
        break
    
    # Get next page
    last_indexes = pagination['last_indexes']
    for key, value in last_indexes.items():
        params[key] = value
    
    response = requests.get(f'{base}/schedules/schedule_a/', params=params)
    data = response.json()
    
    page_count += 1
    print(f"Processing page {page_count}... (Found {len(corporate_contributions)} so far)")

print(f"\n=== Results ===")
print(f"Total corporate PAC contributions found: {len(corporate_contributions)}")
print(f"Total pages checked: {page_count}")

# Display results
for i, contrib in enumerate(corporate_contributions, 1):
    amount = contrib.get('contribution_receipt_amount', 0)
    name = contrib.get('contributor_name', 'Unknown')
    date = contrib.get('contribution_receipt_date', 'Unknown')
    print(f"{i}. {name}: ${amount:,.2f} ({date})")