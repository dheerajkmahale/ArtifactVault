import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Artifact } from '../models/Artifact.js';
import { protect } from '../middleware/auth.js';
import {
  classifyArtifactImage,
  generateTextEmbedding,
  cosineSimilarity,
} from '../services/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter,
});

const router = express.Router();

// @route   POST /api/artifacts
// @desc    Upload an image, create artifact, and trigger Gemini classification
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an artifact image file',
      });
    }

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Artifact title is required',
      });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    // Create artifact in 'processing' status
    const artifact = await Artifact.create({
      owner: req.user._id,
      title,
      description: description || '',
      original_image_url: imageUrl,
      image_path: `/uploads/${req.file.filename}`,
      classification: null,
      processing_status: 'processing',
      model_url: null,
      metadata: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });

    // Run classification with Gemini if key is provided
    try {
      const geminiResult = await classifyArtifactImage(req.file.path, req.file.mimetype);
      if (geminiResult) {
        artifact.classification = geminiResult;
        if (geminiResult.description) {
          try {
            artifact.descriptionEmbedding = await generateTextEmbedding(geminiResult.description);
          } catch (embErr) {
            console.warn('[Upload] Embedding generation error:', embErr.message);
          }
        }
        artifact.processing_status = 'completed';
        await artifact.save();
      } else {
        artifact.processing_status = 'completed';
        await artifact.save();
      }
    } catch (err) {
      console.warn('[Upload] Classification processing warning:', err.message);
      artifact.processing_status = 'completed';
      await artifact.save();
    }

    return res.status(201).json({
      success: true,
      artifact,
    });
  } catch (error) {
    console.error('Artifact creation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while uploading artifact',
    });
  }
});

// @route   POST /api/artifacts/:id/classify
// @desc    Trigger or re-trigger Gemini classification on an artifact
// @access  Private
router.post('/:id/classify', protect, async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);

    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found',
      });
    }

    if (artifact.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to classify this artifact',
      });
    }

    artifact.processing_status = 'processing';
    await artifact.save();

    const imageFilePath = path.join(__dirname, '..', artifact.image_path);
    const mimeType = artifact.metadata?.mimeType || 'image/png';

    const classification = await classifyArtifactImage(imageFilePath, mimeType);

    if (classification) {
      artifact.classification = classification;
      if (classification.description) {
        try {
          artifact.descriptionEmbedding = await generateTextEmbedding(classification.description);
        } catch (embErr) {
          console.warn('[Classify] Embedding generation error:', embErr.message);
        }
      }
      artifact.processing_status = 'completed';
      await artifact.save();

      return res.status(200).json({
        success: true,
        message: 'Classification completed successfully',
        artifact,
      });
    } else {
      artifact.processing_status = 'completed';
      await artifact.save();

      return res.status(200).json({
        success: false,
        message: 'Classification pending. GEMINI_API_KEY is not configured or failed.',
        artifact,
      });
    }
  } catch (error) {
    console.error('Re-classify error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during classification',
    });
  }
});

// @route   GET /api/artifacts
// @desc    Get user's artifacts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const artifacts = await Artifact.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedArtifacts = artifacts.map((art) => ({
      ...art,
      id: art._id.toString(),
    }));

    return res.status(200).json({
      success: true,
      count: formattedArtifacts.length,
      artifacts: formattedArtifacts,
    });
  } catch (error) {
    console.error('Fetch artifacts error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching artifacts',
    });
  }
});

// @route   GET /api/artifacts/public
// @desc    Get all public artifacts for showcase
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const artifacts = await Artifact.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formattedArtifacts = artifacts.map((art) => ({
      ...art,
      id: art._id.toString(),
    }));

    return res.status(200).json({
      success: true,
      count: formattedArtifacts.length,
      artifacts: formattedArtifacts,
    });
  } catch (error) {
    console.error('Fetch public artifacts error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching public artifacts',
    });
  }
});

// @route   GET /api/artifacts/:id
// @desc    Get single artifact by ID
// @access  Public / Private
router.get('/:id', async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id)
      .populate('owner', 'name email')
      .lean();

    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found',
      });
    }

    return res.status(200).json({
      success: true,
      artifact: {
        ...artifact,
        id: artifact._id.toString(),
      },
    });
  } catch (error) {
    console.error('Fetch artifact error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching artifact',
    });
  }
});

// @route   PATCH /api/artifacts/:id
// @desc    Update artifact curatorial classification (Curator human confirmation)
// @access  Private (Owner only)
router.patch('/:id', protect, async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);

    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found',
      });
    }

    if (artifact.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this artifact',
      });
    }

    const {
      title,
      description,
      category,
      era,
      region,
      material,
      condition,
      classification,
    } = req.body;

    if (title !== undefined && typeof title === 'string' && title.trim()) {
      artifact.title = title.trim();
    }

    // Merge curatorial classification fields
    const currentClass =
      artifact.classification && typeof artifact.classification === 'object'
        ? { ...artifact.classification }
        : {};

    const incomingClass = classification || {};

    if (category !== undefined || incomingClass.category !== undefined) {
      currentClass.category = (category || incomingClass.category || '').trim();
    }
    if (era !== undefined || incomingClass.era !== undefined) {
      currentClass.era = (era || incomingClass.era || '').trim();
    }
    if (region !== undefined || incomingClass.region !== undefined) {
      currentClass.region = (region || incomingClass.region || '').trim();
    }
    if (material !== undefined || incomingClass.material !== undefined) {
      currentClass.material = (material || incomingClass.material || '').trim();
    }
    if (condition !== undefined || incomingClass.condition !== undefined) {
      currentClass.condition = (condition || incomingClass.condition || '').trim();
    }

    const updatedDesc =
      description !== undefined
        ? description
        : incomingClass.description !== undefined
        ? incomingClass.description
        : currentClass.description;

    if (updatedDesc !== undefined) {
      currentClass.description = (updatedDesc || '').trim();
      artifact.description = (updatedDesc || '').trim();
    }

    artifact.classification = currentClass;
    artifact.markModified('classification');

    // Mark as Curator Verified
    artifact.curatorVerified = true;

    // If description is present, recompute embedding
    if (currentClass.description) {
      try {
        const newEmbedding = await generateTextEmbedding(currentClass.description);
        if (newEmbedding && newEmbedding.length > 0) {
          artifact.descriptionEmbedding = newEmbedding;
        }
      } catch (embErr) {
        console.warn('[Patch] Embedding re-calculation error:', embErr.message);
      }
    }

    await artifact.save();

    return res.status(200).json({
      success: true,
      message: 'Artifact curatorial record updated and verified',
      artifact: {
        ...artifact.toObject(),
        id: artifact._id.toString(),
      },
    });
  } catch (error) {
    console.error('Update artifact error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating artifact',
    });
  }
});

// @route   GET /api/artifacts/:id/similar
// @desc    Get 3-5 closest matches by cosine similarity
// @access  Public / Private
router.get('/:id/similar', async (req, res) => {
  try {
    const target = await Artifact.findById(req.params.id);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Target artifact not found',
      });
    }

    // Ensure target has an embedding
    let targetEmbedding = target.descriptionEmbedding;
    const targetText =
      target.classification?.description || target.description;

    if ((!targetEmbedding || targetEmbedding.length === 0) && targetText) {
      try {
        targetEmbedding = await generateTextEmbedding(targetText);
        if (targetEmbedding && targetEmbedding.length > 0) {
          target.descriptionEmbedding = targetEmbedding;
          await target.save();
        }
      } catch (embErr) {
        console.warn('[Similar] Target embedding warning:', embErr.message);
      }
    }

    if (!targetEmbedding || targetEmbedding.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        similar: [],
      });
    }

    // Retrieve other artifacts in the vault
    const candidates = await Artifact.find({
      _id: { $ne: target._id },
    }).lean();

    // Ensure candidates with descriptions have embeddings
    for (const cand of candidates) {
      if (
        (!cand.descriptionEmbedding || cand.descriptionEmbedding.length === 0) &&
        (cand.classification?.description || cand.description)
      ) {
        try {
          const candText = cand.classification?.description || cand.description;
          const emb = await generateTextEmbedding(candText);
          if (emb && emb.length > 0) {
            cand.descriptionEmbedding = emb;
            await Artifact.updateOne(
              { _id: cand._id },
              { $set: { descriptionEmbedding: emb } }
            );
          }
        } catch (e) {
          // ignore error on candidate
        }
      }
    }

    // Calculate cosine similarity for all candidates
    const scoredCandidates = [];

    for (const cand of candidates) {
      if (cand.descriptionEmbedding && cand.descriptionEmbedding.length > 0) {
        const sim = cosineSimilarity(targetEmbedding, cand.descriptionEmbedding);
        // Normalize similarity to percentage 0-100
        const simPercent = Math.max(0, Math.min(100, Math.round(sim * 100)));
        scoredCandidates.push({
          id: cand._id.toString(),
          title: cand.title,
          description: cand.classification?.description || cand.description || '',
          category: cand.classification?.category || 'Artifact',
          era: cand.classification?.era || 'Historical',
          region: cand.classification?.region || 'Unknown',
          material: cand.classification?.material || 'Unknown',
          original_image_url: cand.original_image_url,
          curatorVerified: !!cand.curatorVerified,
          similarity: simPercent,
        });
      }
    }

    // Sort descending by similarity
    scoredCandidates.sort((a, b) => b.similarity - a.similarity);

    // Return top 3-5 matches
    const topMatches = scoredCandidates.slice(0, 4);

    return res.status(200).json({
      success: true,
      count: topMatches.length,
      similar: topMatches,
    });
  } catch (error) {
    console.error('Similar artifacts error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while computing similar artifacts',
    });
  }
});

// @route   DELETE /api/artifacts/:id
// @desc    Delete artifact
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);

    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found',
      });
    }

    if (artifact.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this artifact',
      });
    }

    if (artifact.image_path) {
      const filePath = path.join(__dirname, '..', artifact.image_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await artifact.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Artifact deleted successfully',
    });
  } catch (error) {
    console.error('Delete artifact error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting artifact',
    });
  }
});

export default router;
