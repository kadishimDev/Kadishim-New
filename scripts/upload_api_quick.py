
import ftplib
import os

FTP_HOST = "kadishim.co.il"
FTP_USER = "FTPNew@kadishim.co.il"
FTP_PASS = "KadishimFtp1234@"
REMOTE_DIR = "api"
LOCAL_API_DIR = "public/api"

FILES_TO_UPLOAD = [
    "save_message.php",
    "save_request.php",
    "test_email.php"
]

def upload_files():
    print(f"Connecting to {FTP_HOST}...")
    try:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("Login successful!")
        
        # Change to API directory
        try:
            ftp.cwd(REMOTE_DIR)
            print(f"Changed directory to {REMOTE_DIR}")
        except:
             print(f"Could not change to {REMOTE_DIR}, trying relative...")
             # Maybe we land in root?
             try:
                 ftp.cwd("domains/kadishim.co.il/public_html/new/api")
             except:
                 print("Could not find remote API dir")
                 return

        for fname in FILES_TO_UPLOAD:
            local_path = os.path.join(LOCAL_API_DIR, fname)
            if os.path.exists(local_path):
                print(f"Uploading {fname}...")
                with open(local_path, "rb") as file:
                    ftp.storbinary(f"STOR {fname}", file)
                print(f"Uploaded {fname}")
            else:
                print(f"Local file {fname} not found!")

        ftp.quit()
        print("Done.")
        
    except Exception as e:
        print(f"FTP Failed: {e}")

if __name__ == "__main__":
    upload_files()
