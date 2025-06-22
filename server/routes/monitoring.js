const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Screenshot = require('../models/screenshot');
const { authenticate, requireAdmin } = require('./auth');

const JWT_SECRET = process.env.JWT_SECRET;

// POST /screenshot - save a screenshot
router.post('/screenshot', authenticate, async (req, res) => {
    const { image, metadata } = req.body;
    const userId = req.user.id;

    if (!image) {
        return res.status(400).json({ message: 'No image data provided.' });
    }

    try {
        const newScreenshot = new Screenshot({
            user: userId,
            image: image,
            metadata: metadata || {},
        });

        await newScreenshot.save();
        res.status(201).json({ message: 'Screenshot saved successfully.' });
    } catch (error) {
        console.error('Error saving screenshot:', error);
        res.status(500).json({ message: 'Server error saving screenshot.' });
    }
});

router.get('/screenshots/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const screenshots = await Screenshot.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(20); // Limiting to recent 20 for performance
    res.json(screenshots);
  } catch (error) {
    console.error('Error fetching screenshots:', error);
    res.status(500).json({ message: 'Server error fetching screenshots.' });
  }
});

module.exports = router; 