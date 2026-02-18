import ftplib
import os
import sys
import datetime

# FTP Credentials (matching deploy.py)
FTP_HOST = "kadishim.co.il"
FTP_USER = "FTPNew@kadishim.co.il"
FTP_PASS = "KadishimFtp1234@"

CRITICAL_REMOTE_FILES = [
    "public_html/api/config.php",
    # "public_html/api/uploads" # Uploads handled recursively
]

BACKUP_ROOT = "_backups"

def download_file(ftp, remote_path, local_dir):
    filename = os.path.basename(remote_path)
    local_path = os.path.join(local_dir, filename)
    try:
        with open(local_path, 'wb') as f:
            ftp.retrbinary('RETR ' + remote_path, f.write)
        print(f"Downloaded: {filename}")
    except Exception as e:
        print(f"Failed to download {remote_path}: {e}")

def download_folder_recursive(ftp, remote_dir, local_dir):
    os.makedirs(local_dir, exist_ok=True)
    try:
        files = ftp.nlst(remote_dir)
    except:
        print(f"Could not list directory: {remote_dir} (might be empty or missing)")
        return

    for item in files:
        # Check if directory or file (crude FTP check)
        is_dir = False
        try:
            current_dir = ftp.pwd()
            ftp.cwd(item)
            ftp.cwd(current_dir)
            is_dir = True
        except:
            is_dir = False

        local_item_path = os.path.join(local_dir, os.path.basename(item))
        
        if is_dir:
             # Recursive download
             download_folder_recursive(ftp, item, local_item_path)
        else:
             download_file(ftp, item, local_dir)


def main():
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_dir = os.path.join(BACKUP_ROOT, timestamp)
    os.makedirs(backup_dir, exist_ok=True)
    
    print(f"Starting Backup to: {backup_dir}")

    try:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        
        # 1. Config File (Most Important)
        # Note: Paths on server might differ, adjusting based on deploy script knowledge
        # If deploy puts to /api, then remote path is likely /api/config.php or similar.
        # Let's try to find config.php in /api (relative to FTP root for this user)
        
        # Checking FTP root
        files_in_root = ftp.nlst()
        if "api" in files_in_root:
             print("Found 'api' folder, attempting to backup config.php...")
             download_file(ftp, "api/config.php", backup_dir)
        
        # 2. Uploads (If exists)
        if "uploads" in files_in_root:
            print("Found 'uploads' folder, backing up...")
            # Simple non-recursive download of root uploads for now
            download_folder_recursive(ftp, "uploads", os.path.join(backup_dir, "uploads"))
        
        # 3. Database Dump (Optional - usually requires PHP script to generate)
        # We can trigger a PHP script via HTTP if needed, but for now relying on file backup.

        ftp.quit()
        print("Backup Complete.")
        
    except Exception as e:
        print(f"Backup Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
