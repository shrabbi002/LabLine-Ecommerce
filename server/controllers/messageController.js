import Message from '../models/Message.js';

// @desc    Create a contact message submission
// @route   POST /api/contact
// @access  Public
export const createMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // Basic field validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all contact form fields',
      });
    }

    const newMessage = await Message.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you shortly.',
      data: newMessage,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

// @desc    Get all messages (admin review)
// @route   GET /api/contact
// @access  Private/Admin
export const getMessages = async (req, res) => {
  try {
    // Filter out read vs unread if requested
    const queryObj = {};
    if (req.query.read) {
      queryObj.read = req.query.read === 'true';
    }

    // Sort order: oldest first or newest first (default is newest)
    let sortBy = '-createdAt';
    if (req.query.sort === 'oldest') {
      sortBy = 'createdAt';
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Message.countDocuments(queryObj);
    const unreadCount = await Message.countDocuments({ read: false });

    const messages = await Message.find(queryObj)
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: messages.length,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving messages',
      error: error.message,
    });
  }
};

// @desc    Toggle message read status
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
export const markMessageRead = async (req, res) => {
  try {
    let message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Toggle or set read value
    const read = req.body.read !== undefined ? req.body.read : true;

    message = await Message.findByIdAndUpdate(
      req.params.id,
      { read },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Message marked as ${read ? 'read' : 'unread'}`,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update message status',
      error: error.message,
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message,
    });
  }
};
