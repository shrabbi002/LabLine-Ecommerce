import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Please add a short description'],
      trim: true,
      maxlength: [250, 'Short description cannot be more than 250 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a full description'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    price: {
      type: Number,
      default: null,
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'draft'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for text search
itemSchema.index({ title: 'text', shortDescription: 'text', category: 'text' });

const Item = mongoose.model('Item', itemSchema);
export default Item;
