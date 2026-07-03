import express from 'express';
import { getContent, updateContent } from '../controllers/contentController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public read route
router.get('/:section', getContent);

// Admin-only update route
router.put(
  '/:section',
  protect,
  authorize('admin', 'super-admin'),
  upload.single('image'), // Content edits allow a single file upload
  updateContent
);

export default router;
