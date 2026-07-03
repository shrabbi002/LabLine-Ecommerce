import Content from '../models/Content.js';
import fs from 'fs';
import path from 'path';

// Helper to delete old content image from disk
const deleteOldImage = (imagePath) => {
  if (!imagePath || !imagePath.startsWith('/uploads/')) return;
  const filename = imagePath.split('/').pop();
  const filePath = path.join('./uploads', filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted old content image: ${filePath}`);
    } catch (err) {
      console.error(`Failed to delete old image ${filePath}:`, err.message);
    }
  }
};

// Default boilerplate data for sections if not in database yet
const defaultContent = {
  home: {
    section: 'home',
    heading: 'Welcome to Product Hub',
    subheading: 'Discover a premium collection of projects, products, and services.',
    bodyText: 'We build high-quality web applications, designs, and portfolios. Explore our featured work below and feel free to reach out for collaborations.',
    image: '',
    additionalData: {},
  },
  about: {
    section: 'about',
    heading: 'About Our Mission',
    subheading: 'Driving innovation, creativity, and robust software design.',
    bodyText: 'Our company has been delivering exceptional digital solutions for over 5 years. We focus on providing modern user interfaces, premium functionalities, and fully secure systems. Our dedicated team is committed to visual excellence, technical optimization, and high user satisfaction.',
    image: '',
    additionalData: {
      teamTitle: 'Meet the Team',
      foundedYear: '2021',
    },
  },
  contact: {
    section: 'contact',
    heading: 'Get In Touch',
    subheading: 'Have a project in mind or want to say hello? Drop us a line.',
    bodyText: 'We respond to all inquiries within 24 hours. Fill out the contact form or reach out directly using the details below.',
    image: '',
    additionalData: {
      address: '123 Tech Avenue, Silicon Valley, CA',
      email: 'hello@producthub.com',
      phone: '+1 (555) 123-4567',
      mapEmbedUrl: '',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
    },
  },
  general: {
    section: 'general',
    heading: 'ProductHub',
    subheading: '',
    bodyText: '',
    image: '',
    additionalData: {
      websiteName: 'ProductHub'
    },
  },
};

// @desc    Get section content
// @route   GET /api/content/:section
// @access  Public
export const getContent = async (req, res) => {
  const { section } = req.params;

  if (!['home', 'about', 'contact', 'general'].includes(section)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid content section name',
    });
  }

  try {
    let content = await Content.findOne({ section });

    // Fallback if not seeded yet
    if (!content) {
      return res.status(200).json({
        success: true,
        data: defaultContent[section],
        isDefault: true,
      });
    }

    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving content',
      error: error.message,
    });
  }
};

// @desc    Update section content (create if not exists)
// @route   PUT /api/content/:section
// @access  Private/Admin
export const updateContent = async (req, res) => {
  const { section } = req.params;

  if (!['home', 'about', 'contact', 'general'].includes(section)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid content section name',
    });
  }

  try {
    let content = await Content.findOne({ section });

    const updateData = {
      heading: req.body.heading,
      subheading: req.body.subheading,
      bodyText: req.body.bodyText,
    };

    // Parse map content for additionalData
    if (req.body.additionalData) {
      try {
        updateData.additionalData = typeof req.body.additionalData === 'string'
          ? JSON.parse(req.body.additionalData)
          : req.body.additionalData;
      } catch (err) {
        // Fallback if formatting was basic
        updateData.additionalData = req.body.additionalData;
      }
    }

    // Process image uploads
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;

      // Delete old image if a new one is uploaded
      if (content && content.image) {
        deleteOldImage(content.image);
      }
    } else if (req.body.removeImage === 'true' || req.body.image === '') {
      updateData.image = '';
      if (content && content.image) {
        deleteOldImage(content.image);
      }
    }

    if (!content) {
      // Create new content section
      content = new Content({
        section,
        ...updateData,
      });
      await content.save();
    } else {
      // Update existing content section
      content = await Content.findOneAndUpdate(
        { section },
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: `Section '${section}' content updated successfully`,
      data: content,
    });
  } catch (error) {
    // Delete newly uploaded file if execution failed
    if (req.file) {
      deleteOldImage(`/uploads/${req.file.filename}`);
    }

    res.status(400).json({
      success: false,
      message: 'Failed to update section content',
      error: error.message,
    });
  }
};
