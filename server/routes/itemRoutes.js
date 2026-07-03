import express from 'express';
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getCategories,
} from '../controllers/itemController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getItems);
router.get('/categories', getCategories);
router.get('/:id', getItem);

// Admin-only write routes
router.post(
  '/',
  protect,
  authorize('admin', 'super-admin'),
  upload.array('images', 10), // Allow up to 10 images
  createItem
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'super-admin'),
  upload.array('images', 10),
  updateItem
);

router.delete(
  '/:id',
  protect,
  authorize('admin', 'super-admin'),
  deleteItem
);

export default router;
