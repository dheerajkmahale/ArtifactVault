import mongoose from 'mongoose';

const artifactSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an artifact title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    original_image_url: {
      type: String,
      required: [true, 'Original image URL/path is required'],
    },
    image_path: {
      type: String,
    },
    cloudinary_id: {
      type: String,
      default: null,
    },
    classification: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    model_url: {
      type: String,
      default: null,
    },
    processing_status: {
      type: String,
      enum: ['uploading', 'processing', 'completed', 'failed'],
      default: 'completed',
    },
    curatorVerified: {
      type: Boolean,
      default: false,
    },
    descriptionEmbedding: {
      type: [Number],
      default: [],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

export const Artifact = mongoose.model('Artifact', artifactSchema);
