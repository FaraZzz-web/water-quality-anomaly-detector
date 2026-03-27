from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# --- AI SETUP ---
print("🧠 Loading PyTorch Brain...")
# 1. Recreate the exact brain structure we trained
model = models.resnet18(weights=None) # We don't need internet weights anymore
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, 2) # 2 classes (ANOMALY, NORMAL)

# 2. Load the memories (weights) we just saved
model.load_state_dict(torch.load('water_model.pth', weights_only=True))
model.eval() # Set to evaluation mode (no learning, just predicting)

# 3. Same preprocessing as training so the AI recognizes the pixels
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])
print("✅ Brain Loaded and Ready!")

@app.route('/predict', methods=['POST'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    
    try:
        # Open the image file
        img = Image.open(file.stream).convert('RGB')
        
        # Preprocess the image to a PyTorch Tensor
        input_tensor = transform(img)
        input_batch = input_tensor.unsqueeze(0) # Add a batch dimension [1, 3, 224, 224]
        
        # Run it through the neural network!
        with torch.no_grad(): # Turn off gradient math to save memory
            output = model(input_batch)
            
        # Calculate percentages (Softmax)
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        confidence, predicted_idx = torch.max(probabilities, 0)
        
        confidence_score = float(confidence.item())
        class_idx = int(predicted_idx.item())
        
        # Map index 0 to ANOMALY and 1 to NORMAL based on your training
        if class_idx == 0:
            status = "ANOMALY"
            message = "Visual analysis detected high turbidity or discoloration indicative of contamination."
        else:
            status = "NORMAL"
            message = "Water sample appears clear and within safe visual parameters."
            
        return jsonify({
            "status": status,
            "confidence": confidence_score,
            "message": message
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)