import cv2
import numpy as np

def preprocess_image(image_path, output_path, target_size=(224, 224)):
    """Preprocesses images for depth estimation and meshing."""
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")
    
    # 1. Resize to target size for CNN
    resized = cv2.resize(img, target_size)
    
    # 2. Denoise the image using Gaussian Blur
    denoised = cv2.GaussianBlur(resized, (5, 5), 0)
    
    # 3. Enhance contrast (CLAHE on L channel of LAB color space)
    lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl, a, b))
    enhanced = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    
    cv2.imwrite(output_path, enhanced)
    print(f"Successfully preprocessed: {image_path} -> {output_path}")
    return output_path

# Meshing logic placeholder - Phase 3 will analyze this
def generate_mesh(image_path):
    print(f"Generating 3D mesh from: {image_path}")
    # Implementation would use Open3D/trimesh here
    return "mesh_data"

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2:
        preprocess_image(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python preprocess.py <input_image> <output_image>")
