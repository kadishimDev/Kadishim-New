import shutil
import os

DIST_DIR = os.path.join(os.path.dirname(__file__), '..', 'dist')
ZIP_FILE = os.path.join(os.path.dirname(__file__), '..', 'deploy')

def create_zip():
    print(f"Zipping {DIST_DIR} to {ZIP_FILE}.zip...")
    shutil.make_archive(ZIP_FILE, 'zip', DIST_DIR)
    print("Done!")

if __name__ == "__main__":
    create_zip()
