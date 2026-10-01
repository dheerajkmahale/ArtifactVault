import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Artifact } from '../models/Artifact.js';
import { protect } from '../middleware/auth.js';
import { classifyArtifactImage } from '../services/gemini.js';

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
