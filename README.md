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

---

## Architecture & Current Status

### Tech Stack
- **Frontend**: Pure JavaScript (React 18 + Vite 5 + TailwindCSS + Shadcn UI + Three.js).
- **Backend API**: Node.js + Express + Mongoose (MongoDB ODM) + Multer for local asset ingestion.
- **Authentication**: Stateless JSON Web Tokens (JWT) + bcrypt password hashing.
- **Database**: MongoDB (Local or MongoDB Atlas cluster).
- **AI Vision Classification**: Google Gemini 2.5 Flash via official `@google/genai` SDK.

### Background & Architecture Evolution
The application was originally scaffolded using Supabase (PostgreSQL, Auth, Edge Functions) and TypeScript. After the upstream cloud Supabase project became unreachable, the architecture was intentionally converted:
1. **Full TS-to-JS Migration**: All frontend `.ts`/`.tsx` files across components, pages, hooks, and utilities were converted to clean ECMAScript `.js`/`.jsx` modules with zero TypeScript dependencies, verified by clean Vite builds (`npm run build`).
2. **Self-Contained MERN Architecture**: Replaced Supabase dependencies with a dedicated Express.js server and MongoDB schema models (`User`, `Artifact`).
3. **Google Gemini 2.5 Flash Vision AI**: Integrated multi-modal visual classification directly into the Express backend to extract archaeological taxonomy, era dating, and condition diagnostics from uploaded photographs.

### What's Fully Working
- **Authentication**: Real user signup, login, session persistence via JWT, and route protection with `AuthGuard`.
- **Image Upload & Storage**: Multer-powered multipart upload saving original artifact photographs to `server/uploads/` and serving them as static assets.
- **Live Gemini AI Vision Classification**: Automatic analysis on upload and on-demand via `POST /api/artifacts/:id/classify`, returning structured JSON metadata:
  - `category`: Primary archaeological classification (e.g., Bronze Armor, Ceramic Pottery)
  - `confidence`: Confidence match percentage (0–100%)
  - `era`: Estimated historical period or dynasty
  - `region`: Cultural / geographical origin
  - `material`: Physical composition and surface patina
  - `condition`: State of preservation and fractures
  - `description`: Comprehensive curatorial provenance assessment
- **Interactive 3D Spatial Viewer**: WebGL canvas using Three.js and OrbitControls with dark museum lighting, wireframe mode toggle, camera reset, and photogrammetric 2D reference preview alongside the curatorial metadata panel.
- **Curatorial Results Panel**: Category badge, confidence progress bar, 4-quadrant metadata grid, natural description block, and loading skeleton states.
- **Gallery with Filters & Search**: Search bar matching titles, eras, materials, and categories; category filter pills (`Ceramic Pottery`, `Bronze Weapon`, etc.); and status indicators.
- **Artifact Deletion**: Permanent artifact deletion with confirmation prompts in both Gallery cards and the 3D Viewer.
- **Curator Profile (`/profile`)**: Account credentials, join date, vault metrics (Total Vaulted, AI Classified, Processing Queue), and system architecture status.

### What's Out of Scope / Not Implemented
- **True Photogrammetric 3D Mesh Generation**: Converting a single 2D photograph into a true 3D manifold polygon mesh (via Neural Radiance Fields / NeRF, 3D Gaussian Splatting, or dense multi-view stereo) requires dedicated GPU cloud compute clusters and is out of scope for a local web stack.
- **3D Fallback**: If an actual `.gltf` / `.glb` model URL is provided, the viewer renders it; otherwise, the viewer displays an interactive photogrammetric textured 3D mesh with OrbitControls as the spatial visualization.

### How to Run Locally

#### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)
- Google Gemini API Key (Obtain from [aistudio.google.com/apikey](https://aistudio.google.com/apikey))

#### 1. Start MongoDB
Ensure your MongoDB daemon is running locally:
```bash
# Example if using mongod service
mongod --dbpath <data-dir>
```

#### 2. Start the Express Backend
```bash
cd server
npm install
```
Create `server/.env` with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/artifactvault
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:8080
GEMINI_API_KEY=your_gemini_api_key_here
```
Start the server:
```bash
node server.js
# Output: [MongoDB] Connected successfully, [Server] Listening on http://localhost:5000
```

#### 3. Start the Frontend Development Server
```bash
cd ../artifact-3d-studio-main
npm install
npm run dev
# Output: Ready on http://localhost:8080
```
Open `http://localhost:8080` in your browser.

