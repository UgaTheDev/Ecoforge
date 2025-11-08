import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import os

# Load your trained model
model = tf.keras.models.load_model('food_trash_model.h5')

# Path to the folder containing test images
test_folder = "data/test_images"  # <-- change this to your folder path

# Check folder exists
if not os.path.exists(test_folder):
    raise FileNotFoundError(f"Test folder not found: {test_folder}")

# Loop through all image files in the folder
for filename in os.listdir(test_folder):
    if filename.lower().endswith((".jpg", ".jpeg", ".png")):
        img_path = os.path.join(test_folder, filename)
        
        # Load and preprocess image
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0

        # Make prediction
        pred = model.predict(img_array)
        label = "TRASH" if pred[0][0] > 0.5 else "FOOD"
        confidence = pred[0][0]

        # Print result
        print(f"{filename} -> {label} (confidence: {confidence:.4f})")
