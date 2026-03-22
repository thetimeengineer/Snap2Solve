
import os
import shutil
import glob
import zipfile

# --- CONFIGURATION ---

# The folder where you downloaded the renamed ZIP files
DOWNLOADS_DIR = r's:\LASTY_P_S2S\model\temp_downloads'

# The final directory for the combined dataset
MERGED_DIR = os.path.join(os.path.dirname(__file__), 'merged_dataset_v2')

# The new class names, IN THE ORDER WE WANT THEM
# 0 = Pothole, 1 = Garbage, 2 = Vandalism, 3 = Streetlight
CLASS_NAMES = [
    'Pothole', 
    'Garbage', 
    'Vandalism', 
    'Streetlight'
]

# --- SCRIPT ---

def setup_directories():
    """Cleans and sets up the final merged directory."""
    print(f"Setting up directory at: {MERGED_DIR}")
    
    if os.path.exists(MERGED_DIR):
        print(f"Removing old {MERGED_DIR}...")
        try:
            shutil.rmtree(MERGED_DIR)
        except Exception as e:
            print(f"Warning: Could not remove directory {MERGED_DIR}: {e}")
            # Try clearing contents if we can't delete the root
            for split in ['train', 'valid', 'test']:
                for sub in ['images', 'labels']:
                    folder = os.path.join(MERGED_DIR, split, sub)
                    if os.path.exists(folder):
                        for file in os.listdir(folder):
                            try:
                                os.remove(os.path.join(folder, file))
                            except: pass

    os.makedirs(os.path.join(MERGED_DIR, 'train', 'images'), exist_ok=True)
    os.makedirs(os.path.join(MERGED_DIR, 'train', 'labels'), exist_ok=True)
    os.makedirs(os.path.join(MERGED_DIR, 'valid', 'images'), exist_ok=True)
    os.makedirs(os.path.join(MERGED_DIR, 'valid', 'labels'), exist_ok=True)
    os.makedirs(os.path.join(MERGED_DIR, 'test', 'images'), exist_ok=True)
    os.makedirs(os.path.join(MERGED_DIR, 'test', 'labels'), exist_ok=True)
    
    print("Directories are ready.")
    
    # Create data.yaml
    yaml_content = f"""
train: ./train/images
val: ./valid/images
test: ./test/images

nc: {len(CLASS_NAMES)}
names: {CLASS_NAMES}
"""
    with open(os.path.join(MERGED_DIR, 'data.yaml'), 'w') as f:
        f.write(yaml_content.strip())
    
    print("Directory setup complete and data.yaml created.")

def process_datasets():
    """
    Finds all ZIP files, unzips them, and merges them into a single
    dataset with remapped class labels.
    """
    # 1. Process ZIP files
    zip_files = [f for f in glob.glob(os.path.join(DOWNLOADS_DIR, '*.zip'))]
    
    # 2. Local folders already extracted or existing
    LOCAL_FOLDERS = {
        'smart-city-1': {0: 1, 1: 0}, # 0 (garbage) -> 1, 1 (pothole) -> 0
        'GARBAGE-CLASSIFICATION-3-1': {0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1}, # All to Garbage (1)
        'StreetLights-1': {0: 3}, # 0 -> Streetlight (3)
    }

    print(f"Found {len(zip_files)} ZIP files and {len(LOCAL_FOLDERS)} local folders to check.")

    # 1. Process ZIP files
    for zip_path in zip_files:
        zip_filename = os.path.basename(zip_path)
        category_name = zip_filename.split('.')[0].lower()
        
        new_class_id = -1
        if 'pothole' in category_name:
            new_class_id = 0
        elif 'garbage' in category_name or 'trash' in category_name:
            new_class_id = 1
        elif 'vandalism' in category_name or 'graffiti' in category_name:
            new_class_id = 2
        elif 'light' in category_name or 'streetlight' in category_name or 'pole' in category_name:
            new_class_id = 3

        if new_class_id == -1:
            print(f"Warning: Could not determine category for '{zip_filename}'. Skipping.")
            continue
            
        print(f"\n--- Processing ZIP: {zip_filename} (Assigning to Class ID: {new_class_id}) ---")
        temp_unzip_path = os.path.join(DOWNLOADS_DIR, f"temp_{category_name.replace(' ', '_')}")
        
        # Clean up existing temp folder if it exists
        if os.path.exists(temp_unzip_path):
            shutil.rmtree(temp_unzip_path)
            
        # print(f"  Unzipping to {temp_unzip_path}...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_unzip_path)
        
        # print(f"  Contents of unzip dir: {os.listdir(temp_unzip_path)}")
        
        copy_and_remap(temp_unzip_path, category_name, {0: new_class_id})
        try:
            shutil.rmtree(temp_unzip_path)
        except:
            print(f"Warning: Could not remove temp folder {temp_unzip_path}")

    # 2. Process local folders
    # These are expected to be in the parent directory of 'model'
    PARENT_DIR = os.path.dirname(os.path.dirname(__file__))
    for folder_name, class_mapping in LOCAL_FOLDERS.items():
        folder_path = os.path.join(PARENT_DIR, folder_name)
        if os.path.exists(folder_path):
            print(f"\n--- Processing Local Folder: {folder_name} ---")
            copy_and_remap(folder_path, folder_name, class_mapping)
        else:
            print(f"Warning: Local folder '{folder_name}' not found at {folder_path}")

    print("\n--- All datasets processed successfully! ---")
    print(f"Merged dataset is ready at: {MERGED_DIR}")

# Max images per category to keep the dataset balanced and training fast
MAX_IMAGES_PER_CATEGORY = 1000

# To keep track of how many images we've added per class
class_counts = {0: 0, 1: 0, 2: 0, 3: 0}

def copy_and_remap(source_dir, dataset_name, class_mapping):
    """
    Copies images and remaps labels from source to merged directory,
    limiting each category to MAX_IMAGES_PER_CATEGORY.
    """
    print(f"  Processing directory: {source_dir}")
    print(f"  Mapping classes: {class_mapping}")
    for split in ['train', 'valid', 'test']:
        source_img_dir = os.path.join(source_dir, split, 'images')
        source_label_dir = os.path.join(source_dir, split, 'labels')
        
        # Some datasets have images/labels in the root
        if not os.path.exists(source_img_dir) or not os.path.exists(source_label_dir):
            if split == 'train':
                if os.path.exists(os.path.join(source_dir, 'images')):
                    source_img_dir = os.path.join(source_dir, 'images')
                    source_label_dir = os.path.join(source_dir, 'labels')
                    print(f"  Found images/labels in root of {source_dir}")
                else:
                    print(f"  Split '{split}' NOT found in {source_dir}")
                    continue
            else:
                continue
            
        label_files = os.listdir(source_label_dir)
        print(f"  Split '{split}': Found {len(label_files)} labels.")
        
        copied_count = 0
        for label_file in label_files:
            if not label_file.endswith('.txt'):
                continue
            
            # Read labels to see which classes are in this image
            label_path = os.path.join(source_label_dir, label_file)
            try:
                with open(label_path, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
            except Exception as e:
                print(f"  Error reading label {label_file}: {e}")
                continue
            
            new_lines = []
            image_needed = False
            
            for line in lines:
                parts = line.strip().split()
                if not parts: continue
                
                try:
                    old_cls = int(parts[0])
                except ValueError:
                    continue

                if old_cls in class_mapping:
                    new_cls = class_mapping[old_cls]
                    
                    # Check if we still need more images for this category (only for 'train' split)
                    if split == 'train':
                        if class_counts[new_cls] < MAX_IMAGES_PER_CATEGORY:
                            parts[0] = str(new_cls)
                            new_lines.append(" ".join(parts))
                            image_needed = True
                    else:
                        # For valid/test, we keep everything
                        parts[0] = str(new_cls)
                        new_lines.append(" ".join(parts))
                        image_needed = True
            
            # If this image contains at least one label we still need
            if image_needed and new_lines:
                # 1. Copy Image
                img_exts = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']
                base_name = os.path.splitext(label_file)[0]
                img_file = None
                for ext in img_exts:
                    if os.path.exists(os.path.join(source_img_dir, base_name + ext)):
                        img_file = base_name + ext
                        break
                
                if img_file:
                    new_name = f"{dataset_name}_{img_file}"
                    shutil.copy2(
                        os.path.join(source_img_dir, img_file),
                        os.path.join(MERGED_DIR, split, 'images', new_name)
                    )
                    
                    # 2. Write Remapped Label
                    with open(os.path.join(MERGED_DIR, split, 'labels', f"{dataset_name}_{label_file}"), 'w', encoding='utf-8') as f:
                        f.write("\n".join(new_lines))
                    
                    copied_count += 1
                    # 3. Update counts (only for train split)
                    if split == 'train':
                        for line in new_lines:
                            cls = int(line.split()[0])
                            class_counts[cls] += 1
        print(f"  Split '{split}': Copied {copied_count} images.")

if __name__ == "__main__":
    setup_directories()
    process_datasets()
