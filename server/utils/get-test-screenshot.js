const fs = require('fs');
const path = require('path');

// Create a simple test screenshot (1x1 pixel PNG)
function createTestScreenshot() {
  // This is a 1x1 transparent PNG in base64
  const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  console.log('Test Screenshot Base64 Data:');
  console.log('============================');
  console.log(base64Image);
  console.log('\n');
  
  console.log('For Graph Explorer, use this in Request Body:');
  console.log('=============================================');
  console.log(JSON.stringify({ base64Data: base64Image }, null, 2));
  console.log('\n');
  
  console.log('Graph Explorer URL:');
  console.log('===================');
  console.log('PUT https://graph.microsoft.com/v1.0/me/drive/root:/Employee%20Tracker%20Screenshots/screenshots/test-screenshot.png:/content');
  console.log('\n');
  
  console.log('Headers:');
  console.log('========');
  console.log('Content-Type: image/png');
  console.log('\n');
  
  // Save to file for easy copying
  const output = {
    base64Data: base64Image,
    graphExplorerUrl: 'PUT https://graph.microsoft.com/v1.0/me/drive/root:/Employee%20Tracker%20Screenshots/screenshots/test-screenshot.png:/content',
    headers: {
      'Content-Type': 'image/png'
    }
  };
  
  fs.writeFileSync('test-screenshot-data.json', JSON.stringify(output, null, 2));
  console.log('Test data saved to: test-screenshot-data.json');
}

// Convert a real screenshot to base64 (if you have one)
function convertScreenshotToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Data = imageBuffer.toString('base64');
    
    console.log('Real Screenshot Base64 Data:');
    console.log('=============================');
    console.log(base64Data);
    console.log('\n');
    
    console.log('For Graph Explorer, use this in Request Body:');
    console.log('=============================================');
    console.log(JSON.stringify({ base64Data: base64Data }, null, 2));
    
    return base64Data;
  } catch (error) {
    console.error('Error reading image file:', error.message);
    return null;
  }
}

// Main function
function main() {
  console.log('OneDrive Screenshot Test Data Generator');
  console.log('=======================================\n');
  
  // Check if a real screenshot path was provided
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const imagePath = args[0];
    console.log(`Converting real screenshot: ${imagePath}`);
    convertScreenshotToBase64(imagePath);
  } else {
    console.log('Creating test screenshot data...');
    createTestScreenshot();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createTestScreenshot, convertScreenshotToBase64 }; 