
import ftplib
import os

FTP_HOST = "kadishim.co.il"
FTP_USER = "FTPNew@kadishim.co.il"
FTP_PASS = "KadishimFtp1234@"
LOCAL_FILE = "deploy.zip"
REMOTE_DIR = "domains/kadishim.co.il/public_html/new"
LOCAL_FILE = "deploy.zip"
REMOTE_DIR = "/domains/kadishim.co.il/public_html/new"

def upload_file():
    print(f"Attempting to connect to {FTP_HOST}...")
    try:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("Login successful!")
        
        # Change directory
        try:
            ftp.cwd(REMOTE_DIR)
            print(f"Changed directory to {REMOTE_DIR}")
        except Exception as e:
            print(f"Could not change directory to {REMOTE_DIR}: {e}")
            # Try just 'public_html/new'
            try: 
               ftp.cwd("public_html/new")
               print("Changed directory to public_html/new")
            except:
               print("Listing root directory:")
               ftp.retrlines('LIST')
               return

        # Upload
        if os.path.exists(LOCAL_FILE):
             print(f"Uploading {LOCAL_FILE}...")
             with open(LOCAL_FILE, "rb") as file:
                 ftp.storbinary(f"STOR {LOCAL_FILE}", file)
             print("Upload complete!")
        else:
             print(f"Local file {LOCAL_FILE} not found!")

        ftp.quit()
        
    except Exception as e:
        print(f"FTP Failed: {e}")

if __name__ == "__main__":
    upload_file()
