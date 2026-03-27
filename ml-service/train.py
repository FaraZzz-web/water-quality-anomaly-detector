import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
import os

# 1. HYPERPARAMETERS
EPOCHS = 5
BATCH_SIZE = 8
LEARNING_RATE = 0.001
DATA_DIR = './dataset'

def train_model():
    print("🚀 Booting up PyTorch Training Pipeline...")
    
    # 2. IMAGE PREPROCESSING (Resize to 224x224 and normalize pixels)
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    # 3. LOAD DATASET
    try:
        dataset = datasets.ImageFolder(root=DATA_DIR, transform=transform)
        dataloader = torch.utils.data.DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)
        class_names = dataset.classes # Should automatically detect ['ANOMALY', 'NORMAL']
        print(f"📁 Found {len(dataset)} images belonging to {class_names}.")
    except Exception as e:
        print(f"❌ Error loading data: {e}. Make sure your dataset/ folder is set up correctly!")
        return

    # 4. BUILD THE NEURAL NETWORK (Transfer Learning with ResNet18)
    # We download a brain that already knows how to see shapes/colors, and just retrain the final output layer.
    model = models.resnet18(pretrained=True)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(class_names)) # Change output to 2 classes

    # 5. LOSS FUNCTION & OPTIMIZER
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    # 6. THE TRAINING LOOP
    print("🧠 Starting Training...")
    model.train()
    
    for epoch in range(EPOCHS):
        running_loss = 0.0
        correct_predictions = 0
        total_predictions = 0

        for inputs, labels in dataloader:
            optimizer.zero_grad()           # Clear old math
            outputs = model(inputs)         # Forward pass (guess)
            loss = criterion(outputs, labels) # Calculate how wrong the guess was
            loss.backward()                 # Backpropagation (learn)
            optimizer.step()                # Update weights

            # Calculate accuracy
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total_predictions += labels.size(0)
            correct_predictions += (predicted == labels).sum().item()

        epoch_loss = running_loss / len(dataloader)
        epoch_acc = (correct_predictions / total_predictions) * 100
        print(f"Epoch [{epoch+1}/{EPOCHS}] - Loss: {epoch_loss:.4f} - Accuracy: {epoch_acc:.2f}%")

    # 7. SAVE THE TRAINED BRAIN
    torch.save(model.state_dict(), 'water_model.pth')
    print("✅ Training Complete! Model saved as 'water_model.pth'")
    print(f"Class Mapping: 0 = {class_names[0]}, 1 = {class_names[1]}")

if __name__ == '__main__':
    train_model()