import os
import shutil

base_dir = r"c:\Users\Jacob\Documents\פרוייקטים\קדישים"
old_folder_name = "20210701_kasdishim_c6a54cdc2450a1738217_20220701122242_archive"
new_folder_name = "kadishim-old"

# 1. Rename Old Folder
old_path = os.path.join(base_dir, old_folder_name)
new_path = os.path.join(base_dir, new_folder_name)

if os.path.exists(old_path):
    try:
        os.rename(old_path, new_path)
        print(f"Renamed '{old_folder_name}' to '{new_folder_name}'")
    except Exception as e:
        print(f"Error renaming folder: {e}")
else:
    print(f"Folder '{old_folder_name}' not found. It might have been renamed already.")

# 2. Cleanup kadishim-new
project_dir = os.path.join(base_dir, "kadishim-new")
backup_dir = os.path.join(project_dir, "backups")

if not os.path.exists(backup_dir):
    os.makedirs(backup_dir)
    print(f"Created backup directory: {backup_dir}")

# List of files to move to backup (temp scripts, old zips)
files_to_move = [
    "Run Site.bat", 
    "Start Website.bat", 
    "Push to Git.bat",
    "debug_admin_data.js", 
    "run_site.py", 
    "test_calendar_logic.js",
    "list_slugs.cjs",
    "check_encoding.cjs",
    "deploy.zip"
]

for filename in files_to_move:
    src = os.path.join(project_dir, filename)
    dst = os.path.join(backup_dir, filename)
    if os.path.exists(src):
        try:
            shutil.move(src, dst)
            print(f"Moved {filename} to backups")
        except Exception as e:
            print(f"Error moving {filename}: {e}")

# 3. Create 'kadishim-upress-upload' (dist copy)
dist_dir = os.path.join(project_dir, "dist")
upress_dir = os.path.join(base_dir, "kadishim-upress-upload")

# We don't copy yet because dist might be empty/old, but we set up the structure
if not os.path.exists(upress_dir):
    os.makedirs(upress_dir)
    print(f"Created Upress upload directory: {upress_dir}")
