from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

# Load model once at startup
print("Loading model...")
model = tf.keras.models.load_model('../food_trash_model.h5')
print("Model loaded successfully!")

@app.route('/api/classify', methods=['POST'])
def classify():
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Handle base64 image from React Native
        image_data = data['image']
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        # Decode and process image
        img = Image.open(io.BytesIO(base64.b64decode(image_data)))
        img = img.resize((224, 224)).convert('RGB')
        img_array = np.expand_dims(np.array(img) / 255.0, axis=0)
        
        # Predict
        pred = model.predict(img_array, verbose=0)[0][0]
        is_trash = pred > 0.5
        
        return jsonify({
            'isTrash': bool(is_trash),
            'isFood': bool(not is_trash),
            'confidence': float(pred if is_trash else 1 - pred),
            'rawScore': float(pred)
        })
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)