import torch
import torch.nn as nn

class ArtifactClassifier(nn.Module):
    def __init__(self):
        super(ArtifactClassifier, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Flatten(),
            nn.Linear(16 * 112 * 112, 10) # Assuming input size 224x224
        )
    
    def forward(self, x):
        return self.features(x)

if __name__ == "__main__":
    model = ArtifactClassifier()
    print(model)
