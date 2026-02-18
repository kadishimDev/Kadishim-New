import ftplib
import os
import sys
import mimetypes

# FTP Credentials
FTP_HOST = "kadishim.co.il"
FTP_USER = "FTPNew@kadishim.co.il"
FTP_PASS = "KadishimFtp1234@"

# Directories
LOCAL_BUILD_DIR = "dist"
LOCAL_API_DIR = "public/api"

# Protected Files (NEVER OVERWRITE THESE)
PROTECTED_FILES = [
    "config.php",
    "uploads",
    "database",
    ".htaccess", # Sometimes contains specific config
    "menu_structure.json" # User-edited menu structure
]

def upload_file(ftp, local_path, remote_path):
    """Uploads a file, respecting protected list."""
    filename = os.path.basename(remote_path)
    
    # Check protection
    if filename in PROTECTED_FILES:
        # Check if exists remotely
        file_list = []
        try:
            file_list = ftp.nlst(os.path.dirname(remote_path) or '.')
        except:
            pass # Directory might be empty or error
            
        if filename in file_list:
            print(f"Skipping PROTECTED file: {remote_path}")
            return

    print(f"Uploading {local_path} -> {remote_path}...")
    try:
        with open(local_path, "rb") as file:
            ftp.storbinary(f"STOR {remote_path}", file)
    except Exception as e:
        print(f"Error uploading {filename}: {e}")

def upload_directory(ftp, local_dir, remote_dir):
    """Recursively uploads a directory, respecting protected list."""
    dirname = os.path.basename(remote_dir)
    if dirname in PROTECTED_FILES:
        print(f"Skipping PROTECTED directory: {remote_dir}")
        return

    try:
        ftp.mkd(remote_dir)
        print(f"Created remote directory: {remote_dir}")
    except:
        pass # Directory likely exists

    # Switch to remote dir to easy relative paths, or just use full paths? 
    # Using full paths is safer logic-wise here.
    
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}" if remote_dir else item
        
        if os.path.isdir(local_path):
            upload_directory(ftp, local_path, remote_path)
        else:
            upload_file(ftp, local_path, remote_path)

def main():
    print("========================================")
    print("     SMART DEPLOY TO FTP (UPRESS)       ")
    print("========================================")
    
    # 1. Check if build exists
    if not os.path.exists(LOCAL_BUILD_DIR):
        print("Error: 'dist' folder not found!")
        print("Please run 'npm run build' first.")
        sys.exit(1)

    try:
        # 2. Connect
        print(f"Connecting to {FTP_HOST}...")
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("Connected!")

        # 3. Upload 'dist' contents to Root
        print("\n--- Uploading Frontend (dist) ---")
        for item in os.listdir(LOCAL_BUILD_DIR):
            local_path = os.path.join(LOCAL_BUILD_DIR, item)
            
            if os.path.isdir(local_path):
                upload_directory(ftp, local_path, item) # e.g. dist/assets -> /assets
            else:
                upload_file(ftp, local_path, item)      # e.g. dist/index.html -> /index.html

        # 4. Upload 'public/api' to '/api'
        print("\n--- Uploading Backend (api) ---")
        # Ensure remote api dir exists
        try:
            ftp.mkd("api")
        except:
            pass
            
        for item in os.listdir(LOCAL_API_DIR):
             local_path = os.path.join(LOCAL_API_DIR, item)
             if os.path.isfile(local_path):
                 upload_file(ftp, local_path, f"api/{item}")

        ftp.quit()
        print("\n========================================")
        print("       DEPLOYMENT SUCCESSFUL!           ")
        print("========================================")

    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
