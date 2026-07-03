import express from 'express';
import {
  createMessage,
  getMessages,
  markMessageRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public submission route
router.post('/', createMessage);

// Admin-only inbox management routes
router.get('/', protect, authorize('admin', 'super-admin'), getMessages);
router.put('/:id/read', protect, authorize('admin', 'super-admin'), markMessageRead);
router.delete('/:id', protect, authorize('admin', 'super-admin'), deleteMessage);

export default router;
