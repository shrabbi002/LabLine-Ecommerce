import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      unique: true,
      enum: ['home', 'about', 'contact', 'general'],
    },
    heading: {
      type: String,
      trim: true,
    },
    subheading: {
      type: String,
      trim: true,
    },
    bodyText: {
      type: String,
    },
    image: {
      type: String,
      default: '',
    },
    additionalData: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model('Content', contentSchema);
export default Content;
