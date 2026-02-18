import requests
import json
import os

# Configuration
API_BASE_URL = "https://kadishim.co.il/api" # Verify this URL
LOCAL_DATA_DIR = "src/data"

ENDPOINTS = {
    "memorials": "get_all_memorials.php",
    "pages": "get_pages.php",
    # "messages": "get_messages.php" # Add if needed and authenticated
}

FILES_MAP = {
    "memorials": "memorials_v2.json",
    "pages": "pages_db.json"
}

def sync_data():
    print("Starting Data Sync from Production...")
    
    print("--------------------------------------------------")
    print("3. Fetching Menu Structure...")
    try:
        # Try new API location first
        response = requests.get(f"{API_BASE_URL}/get_menu.php", verify=False) # verify=False for simple https
        if response.status_code != 200:
             # Try fallback if needed, or just warn
             print(f"Warning: Could not fetch menu. Status: {response.status_code}")
        else:
            menu_data = response.json()
            if menu_data:
                # Save to src/data (for build/dev)
                with open("src/data/menu_structure.json", "w", encoding="utf-8") as f:
                    json.dump(menu_data, f, indent=4, ensure_ascii=False)
                # Save to public/data (for local runtime API)
                os.makedirs("public/data", exist_ok=True)
                with open("public/data/menu_structure.json", "w", encoding="utf-8") as f:
                    json.dump(menu_data, f, indent=4, ensure_ascii=False)
                
                print(f"  > Saved menu_structure.json (Size: {len(str(menu_data))} bytes)")
            else:
                print("  > Remote menu is empty or invalid.")

    except Exception as e:
        print(f"  > Error fetching menu: {e}")
    
    for key, endpoint in ENDPOINTS.items():
        url = f"{API_BASE_URL}/{endpoint}"
        try:
            print(f"Fetching {key} from {url}...")
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for API errors returned as JSON
                if isinstance(data, dict) and "error" in data:
                     print(f"API Error for {key}: {data['error']}")
                     continue

                filename = FILES_MAP.get(key)
                if filename:
                    filepath = os.path.join(LOCAL_DATA_DIR, filename)
                    
                    # Create backup of local file before overwriting
                    if os.path.exists(filepath):
                        os.rename(filepath, filepath + ".bak")
                        
                    with open(filepath, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)
                    print(f"Saved {len(data)} items to {filename}")
            else:
                print(f"Failed to fetch {key}: Status {response.status_code}")
                
        except Exception as e:
            print(f"Error syncing {key}: {e}")

if __name__ == "__main__":
    sync_data()
