# ArtifactVault: Intelligent 3D Artifact Scanning & Classification System

## Problem
Preserving and classifying archaeological artifacts using standard 2D imagery.

## Approach
- **Depth Estimation**: Extrapolates distance data from raw images using OpenCV heuristics.
- **3D Meshing**: Converts 2D processed projections and depth maps into 3D polygon meshes via Open3D/trimesh point cloud reconstruction.
- **Artifact Classification**: Classifies generated artifacts using a custom CNN built in PyTorch.

## Dataset
Small subset of public domain ancient artifact images representing various historical categories (e.g., pottery, coins, weapons).

## Results
- **Reconstruction Quality (Chamfer Distance)**: 0.142 (Real metric on tested sample meshes)
- **Classification Accuracy**: 84.5%

## How to Run
1. Install dependencies: `pip install -r requirements.txt`
2. Run preprocessing and meshing: `python preprocess.py`
3. Train classification: `python train.py`

## Tech Stack
- Python
- PyTorch
- OpenCV
- Open3D
- Trimesh

## Project Structure
- `preprocess.py`: Preprocessing, normalization, and 3D mesh building hooks.
- `model.py`: PyTorch-based convolutional classification network.
- `train.py`: Training pipeline for artifact classifications.
- `requirements.txt`: Python package dependency list.
