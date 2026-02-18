
import ftplib
import os

FTP_HOST = "kadishim.co.il"
FTP_USER = "FTPNew@kadishim.co.il"
FTP_PASS = "KadishimFtp1234@"
LOCAL_DIST_DIR = "dist"
REMOTE_DIR = "/" # Based on previous listing, login lands in the correct folder or close to it

def upload_tree(ftp, local_dir):
    for root, dirs, files in os.walk(local_dir):
        # Determine relative path to maintain structure
        rel_path = os.path.relpath(root, LOCAL_DIST_DIR)
        if rel_path == ".":
            rel_path = ""
        
        # Create remote directories
        for d in dirs:
            remote_path = os.path.join(rel_path, d).replace("\\", "/")
            try:
                ftp.mkd(remote_path)
                print(f"Created remote directory: {remote_path}")
            except ftplib.error_perm:
                pass # Directory likely exists

        # Upload files
        for f in files:
            local_file_path = os.path.join(root, f)
            remote_file_path = os.path.join(rel_path, f).replace("\\", "/")
            
            print(f"Uploading {f} to {remote_file_path}...")
            with open(local_file_path, "rb") as file:
                ftp.storbinary(f"STOR {remote_file_path}", file)

def sync():
    print(f"Connecting to {FTP_HOST}...")
    try:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("Login successful!")
        
        # Check where we are
        print("Current remote directory:")
        ftp.retrlines('LIST')

        print(f"Starting upload from {LOCAL_DIST_DIR}...")
        upload_tree(ftp, LOCAL_DIST_DIR)
        
        print("Sync complete!")
        ftp.quit()
        
    except Exception as e:
        print(f"FTP Sync Failed: {e}")

if __name__ == "__main__":
    sync()
