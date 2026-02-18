import requests

try:
    print("Attempting to trigger import_memorials.php...")
    # Assuming standard XAMPP path based on vite.config.js
    url = "http://localhost/kadishim-new/public/api/import_memorials.php"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    try:
        data = response.json()
        print("Response JSON:", data)
    except:
        print("Response Text:", response.text)

except Exception as e:
    print(f"Failed to trigger import: {e}")
    print("Please ensure your local server (XAMPP/WAMP) is running.")
