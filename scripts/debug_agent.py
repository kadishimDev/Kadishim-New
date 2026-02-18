import requests
import time

print("Waiting for PHP server on 8081...")
time.sleep(2)  # Wait for server

BASE_URL = "http://127.0.0.1:8081/api"

def trigger_import():
    try:
        print(f"Triggering import at {BASE_URL}/import_memorials.php...")
        response = requests.get(f"{BASE_URL}/import_memorials.php")
        print(f"Status Code: {response.status_code}")
        try:
            print("Response JSON:", response.json())
        except:
            print("Response Text (truncated):", response.text[:500])
    except Exception as e:
        print(f"Import Failed: {e}")

def check_memorials():
    try:
        print(f"Fetching memorials from {BASE_URL}/get_all_memorials.php...")
        response = requests.get(f"{BASE_URL}/get_all_memorials.php")
        print(f"Status Code: {response.status_code}")
        try:
            data = response.json()
            print(f"Total Memorials found: {len(data)}")
            if len(data) > 0:
                print("First record sample:", data[0])
            else:
                print("List is empty!")
        except:
            print("Response Text (truncated):", response.text[:500])
    except Exception as e:
        print(f"Fetch Failed: {e}")

if __name__ == "__main__":
    trigger_import()
    check_memorials()
