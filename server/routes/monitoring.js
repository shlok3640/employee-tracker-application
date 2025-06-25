const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Screenshot = require('../models/screenshot');
const { authenticate, requireAdmin } = require('./auth');
const { uploadScreenshotBuffer } = require('../utils/sharepoint-upload');
const { getSharepointToken } = require('../utils/getSharepointToken');

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

        // Upload to SharePoint in the background
        (async () => {
            try {
                const accessToken = await getSharepointToken();
                let base64Data = image;
                if (base64Data.startsWith('data:image')) {
                    base64Data = base64Data.split(',')[1];
                }
                const buffer = Buffer.from(base64Data, 'base64');
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const remoteFileName = `screenshot-${userId}-${timestamp}.jpg`;
                await uploadScreenshotBuffer(buffer, remoteFileName, accessToken);
                console.log('Screenshot uploaded to SharePoint:', remoteFileName);
            } catch (uploadErr) {
                console.error('Error uploading screenshot to SharePoint:', uploadErr);
            }
        })();
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