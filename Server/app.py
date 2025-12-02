from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import os

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "https://dog-vs-cat-classifier-py-torch.vercel.app"}},
)

class CNN(nn.Module):
    def __init__(self):
        super().__init__()

        self.conv1 = nn.Conv2d(3, 32, 3)
        self.conv2 = nn.Conv2d(32, 64, 3)
        self.conv3 = nn.Conv2d(64, 128, 3)
        
        self.pool = nn.MaxPool2d(2,2)
        self.gap = nn.AdaptiveAvgPool2d((1,1))

        self.fc1 = nn.Linear(128, 128)
        self.fc2 = nn.Linear(128, 1)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = self.pool(F.relu(self.conv3(x)))

        x = self.gap(x)
        x = torch.flatten(x, 1)

        x = F.relu(self.fc1(x))
        return torch.sigmoid(self.fc2(x))

model = CNN()
model.load_state_dict(torch.load("dog_cat_model.pth", map_location="cpu"))
model.eval()

transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor()
])

CLASSES = ["Cat", "Dog"]

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    image_file = request.files["file"]
    image = Image.open(image_file).convert("RGB")

    img_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        output = model(img_tensor).item()

    prediction = CLASSES[1] if output >= 0.5 else CLASSES[0]

    return jsonify({
        "prediction": prediction,
        "confidence": float(output)
    })

@app.route("/", methods=["GET"])
def home():
    return "Dog vs Cat Classifier API is running"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
