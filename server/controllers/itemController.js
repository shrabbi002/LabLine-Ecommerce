import Item from '../models/Item.js';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { fileUrl, uploadDir } from '../middleware/upload.js';

// Helper to delete local image files
const deleteLocalImages = (images) => {
  if (!images || !Array.isArray(images)) return;
  images.forEach((img) => {
    // If the image is a local path (starts with /uploads or uploads)
    if (img.includes('/uploads/')) {
      const filename = img.split('/').pop();
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Successfully deleted local image: ${filePath}`);
        } catch (err) {
          console.error(`Error deleting file ${filePath}:`, err.message);
        }
      }
    }
  });
};

// Helper to check if requester is admin (optional authorization)
const checkIfAdmin = async (req) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return false;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    return user && (user.role === 'admin' || user.role === 'super-admin');
  } catch (err) {
    return false;
  }
};

// @desc    Get all items (with filters, search, pagination)
// @route   GET /api/items
// @access  Public
export const getItems = async (req, res) => {
  try {
    const queryObj = {};
    const isAdmin = await checkIfAdmin(req);

    // Filter by status (public can only see active items)
    if (!isAdmin) {
      queryObj.status = 'active';
    } else if (req.query.status) {
      queryObj.status = req.query.status;
    }

    // Search query (text search or regex fallback)
    if (req.query.search) {
      queryObj.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { shortDescription: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Category filter
    if (req.query.category) {
      queryObj.category = req.query.category;
    }

    // Featured filter
    if (req.query.featured) {
      queryObj.featured = req.query.featured === 'true';
    }

    // Sort setup
    let sortBy = '-createdAt';
    if (req.query.sort) {
      if (req.query.sort === 'priceAsc') sortBy = 'price';
      else if (req.query.sort === 'priceDesc') sortBy = '-price';
      else if (req.query.sort === 'oldest') sortBy = 'createdAt';
    }

    // Pagination setup
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 9;
    const startIndex = (page - 1) * limit;

    const total = await Item.countDocuments(queryObj);
    const items = await Item.find(queryObj)
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: items.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving items',
      error: error.message,
    });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
export const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item not found with id of ${req.params.id}`,
      });
    }

    // If item is draft, check if requester is admin
    if (item.status === 'draft') {
      const isAdmin = await checkIfAdmin(req);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this resource',
        });
      }
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving item',
      error: error.message,
    });
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private/Admin
export const createItem = async (req, res) => {
  try {
    const itemData = { ...req.body };

    // Set prices to null if empty string
    if (itemData.price === '') {
      itemData.price = null;
    }

    // Process tags
    if (itemData.tags && typeof itemData.tags === 'string') {
      itemData.tags = itemData.tags.split(',').map((tag) => tag.trim());
    }

    // Handle files if uploaded
    if (req.files && req.files.length > 0) {
      itemData.images = req.files.map((file) => fileUrl(file));
    } else {
      itemData.images = [];
    }

    const item = await Item.create(itemData);

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item,
    });
  } catch (error) {
    // Delete files if creation failed
    if (req.files) {
      const filesToDelete = req.files.map((file) => fileUrl(file));
      deleteLocalImages(filesToDelete);
    }

    res.status(400).json({
      success: false,
      message: 'Failed to create item',
      error: error.message,
    });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private/Admin
export const updateItem = async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    const updateData = { ...req.body };

    if (updateData.price === '') {
      updateData.price = null;
    }

    // Process tags
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map((tag) => tag.trim());
    } else if (updateData.tags === undefined && req.body.tags === '') {
      updateData.tags = [];
    }

    // Handling images
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map((file) => fileUrl(file));
    }

    // Merge or replace images
    // If client specified remaining images (some might have been deleted)
    let remainingImages = [];
    if (req.body.existingImages) {
      remainingImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];
    } else {
      // If existingImages is omitted but new files exist, we add them to the item's current images
      remainingImages = item.images;
    }

    // Determine images to delete from disk (in item.images but not in remainingImages)
    const imagesToDelete = item.images.filter(
      (img) => !remainingImages.includes(img)
    );
    deleteLocalImages(imagesToDelete);

    // Combine remaining and newly uploaded images
    updateData.images = [...remainingImages, ...newImages];

    item = await Item.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item,
    });
  } catch (error) {
    // Delete files if update failed
    if (req.files) {
      const filesToDelete = req.files.map((file) => fileUrl(file));
      deleteLocalImages(filesToDelete);
    }

    res.status(400).json({
      success: false,
      message: 'Failed to update item',
      error: error.message,
    });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private/Admin
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Delete associated images from disk
    deleteLocalImages(item.images);

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item and its images deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message,
    });
  }
};

// @desc    Get all unique categories
// @route   GET /api/items/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categoriesWithCount = await Item.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const categories = categoriesWithCount.map(item => ({
      name: item._id || 'Uncategorized',
      count: item.count
    }));
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: error.message,
    });
  }
};
