# ArtifactVault: 3D Artifact Scanning & Digital Preservation Studio

An intelligent full-stack system for digitizing, classifying, and exploring historical and cultural artifacts using multimodal vision AI, high-dimensional vector embeddings, and interactive 3D WebGL graphics.

---

## Production System Architecture

### Tech Stack
- **Frontend SPA**: React 18 + Vite 5 + Tailwind CSS + Radix UI / Shadcn UI + Lucide Icons + jsPDF
- **3D Spatial Graphics**: Three.js & WebGL with OrbitControls, multi-directional museum illumination, and wireframe mesh inspection
- **Backend REST API**: Node.js & Express with Multer for secure multipart file streaming, JWT auth middleware, and bcrypt password hashing
- **Database & Storage**: MongoDB with Mongoose ODM (relational metadata, user accounts, and 3072-dimensional vector embedding arrays)
- **Multimodal Vision AI**: Google Gemini 2.5 Flash (`@google/genai` SDK) for automated archaeological taxonomy, historical era dating, geographic origin, material composition, and condition diagnostics
- **Semantic Vector Embeddings**: Gemini text embedding model (`gemini-embedding-001`) for server-side cosine similarity search

---

## Live Working Features

1. **User Authentication & Curator Profiles**
   - Stateless JWT authentication with bcrypt password encryption (salt rounds = 10).
   - Protected curatorial command center (`/dashboard`) and account diagnostics (`/profile`).

2. **Multimodal Vision Classification (Gemini 2.5 Flash)**
   - Upload any 2D artifact photograph (PNG, JPG, WEBP).
   - Automated archaeological taxonomy extraction returning: primary category, confidence score, estimated era, geographic origin, material composition, physical condition state, and detailed curatorial assessment.

3. **Curator Verification Workflow ("AI Suggests, Human Confirms")**
   - In-place editing on the 3D Viewer page: authorized curators can review and edit every AI-suggested field.
   - Saves updates via `PATCH /api/artifacts/:id` and toggles curatorial provenance status between `AI Suggested` and `Curator Verified`.

4. **Embedding-Based Cosine Similarity Search**
   - Generates 3072-dimensional text embeddings from artifact curatorial descriptions.
   - Real-time in-memory vector cosine similarity ranking on `GET /api/artifacts/:id/similar` returning the closest matching relics in the vault.

5. **Interactive 3D Spatial Canvas (Three.js WebGL)**
   - Orbit, rotate, pan, and zoom around vaulted artifacts.
   - Interactive wireframe mesh mode and multi-light museum studio illumination.

6. **One-Page Archival PDF Catalog Cards**
   - One-click client-side export using `jsPDF`.
   - Generates formatted museum catalog cards with embedded photographic reference, specifications grid, curatorial notes, and verification stamp.

7. **Dynamic Gallery & Multi-Mode Sorting**
   - Live text search across titles, eras, materials, and categories.
   - Category filter pills (`Ceramic Pottery`, `Bronze Weapon`, `Gold Jewelry`, `Stone Sculpture`, etc.).
   - 4-mode sorting: `Newest First`, `Oldest First`, `Highest Confidence`, and `Alphabetical (A–Z)`.

---

## Honest Scope & Technical Notes

- **Independent Student / Portfolio Project**: ArtifactVault is a personal software engineering capstone created by Dheeraj Mahale to explore computer vision, vector similarity search, and WebGL graphics. It is not an enterprise product, has no venture backing, and holds no official partnerships with institutions like UNESCO or the Smithsonian.
- **Client-Side 3D Spatial Geometry**: True multi-view neural photogrammetric mesh reconstruction from a single 2D image (e.g. NeRFs or Gaussian Splatting) requires dedicated GPU cloud compute clusters. ArtifactVault demonstrates client-side spatial representation via Three.js texture mapping and interactive 3D geometries.
- **In-Memory Vector Search**: Vector similarity search computes cosine similarity in-memory across stored Gemini embeddings. This provides zero-overhead, sub-millisecond similarity queries for collections up to several thousand relics without requiring a dedicated vector database cluster.

---

## Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally at `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string)
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/apikey))

### 1. Start MongoDB
Ensure your local MongoDB daemon is running:
```bash
mongod --dbpath <path-to-data-directory>
```

### 2. Start Express Backend
```bash
cd server
npm install
```

Create `server/.env` (or copy from `server/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/artifactvault
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:8080
GEMINI_API_KEY=your_gemini_api_key_here
```

Launch the API server:
```bash
node server.js
# Output: [MongoDB] Connected successfully, [Server] Listening on http://localhost:5000
```

### 3. Start Frontend Development Server
```bash
cd ../artifact-3d-studio-main
npm install
npm run dev
# Output: Ready on http://localhost:8080
```
Open `http://localhost:8080` in your browser.

---

## Original Prototype Concept (Not Used in Production)

Earlier exploratory work for this project investigated an offline Python pipeline for depth estimation and CNN-based classification. These standalone scripts are archived under `legacy-prototype/` for historical reference:
- `legacy-prototype/preprocess.py`: Grayscale normalization and depth placeholder hooks.
- `legacy-prototype/model.py`: Simple 2D CNN feature extraction network in PyTorch.
- `legacy-prototype/train.py`: Skeleton training script.
- `legacy-prototype/requirements.txt`: Python package dependency list.

*Note: Synthetic metrics (such as early Chamfer distance and accuracy targets from initial exploration) are deprecated; the live ArtifactVault system exclusively uses the end-to-end MERN stack with Google Gemini 2.5 Flash Vision and vector embeddings documented above.*
