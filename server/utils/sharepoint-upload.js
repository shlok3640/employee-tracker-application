const axios = require('axios');

const DRIVE_ID = 'b!6SYFaItnwUSBxvDZDUDXIAZzYltTDCZKmdGF5-ip2RvdUKOekXGsR5b9cKeeOoq6';
const FOLDER_PATH = 'Employee Tracker Screenshots';

async function uploadScreenshotBuffer(buffer, remoteFileName, accessToken) {
  const uploadUrl = `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/root:/${FOLDER_PATH}/${remoteFileName}:/content`;
  try {
    const response = await axios.put(uploadUrl, buffer, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'image/jpeg' // or 'image/png' if you use PNGs
      }
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Headers:', err.response.headers);
      console.error('Data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
    throw err;
  }
}

module.exports = { uploadScreenshotBuffer };