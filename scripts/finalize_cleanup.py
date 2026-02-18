import os
import shutil

base_dir = r"c:\Users\Jacob\Documents\פרוייקטים\קדישים"
old_dir = os.path.join(base_dir, "kadishim-old")
legacy_php_dir = os.path.join(base_dir, "kadishim-php-legacy")

# Ensure destination exists
if not os.path.exists(old_dir):
    os.makedirs(old_dir)

# 1. Move kadishim-php-legacy
if os.path.exists(legacy_php_dir):
    try:
        shutil.move(legacy_php_dir, os.path.join(old_dir, "php-legacy-website"))
        print(f"Moved kadishim-php-legacy to {old_dir}")
    except Exception as e:
        print(f"Error moving legacy folder: {e}")

# 2. Move loose files
loose_files = ["installer.php", "logo.gif", "בעיות באתר.txt"]
for f in loose_files:
    src = os.path.join(base_dir, f)
    if os.path.exists(src):
        try:
            shutil.move(src, os.path.join(old_dir, f))
            print(f"Moved {f} to {old_dir}")
        except Exception as e:
            print(f"Error moving {f}: {e}")

print("Cleanup complete.")
