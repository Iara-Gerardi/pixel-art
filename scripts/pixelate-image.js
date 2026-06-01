#!/usr/bin/env node

/**
 * Image Pixelation Script
 * 
 * Converts an image to a binary 2D array representation.
 * 
 * Usage:
 *   node pixelate-image.js <image-path> <rows> <cols> [threshold]
 * 
 * Arguments:
 *   image-path: Path to the input image
 *   rows: Number of rows in the output array
 *   cols: Number of columns in the output array
 *   threshold: Optional brightness threshold (0-255, default: 128)
 *              Pixels darker than threshold become 1 (black)
 * 
 * Output:
 *   Prints a JavaScript-compatible 2D array to stdout
 * 
 * Example:
 *   node pixelate-image.js photo.png 81 108
 *   node pixelate-image.js photo.png 81 108 100
 */

const Jimp = require('jimp');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('Error: Insufficient arguments');
  console.error('');
  console.error('Usage: node pixelate-image.js <image-path> <rows> <cols> [threshold]');
  console.error('');
  console.error('Arguments:');
  console.error('  image-path  Path to the input image');
  console.error('  rows        Number of rows in the output array');
  console.error('  cols        Number of columns in the output array');
  console.error('  threshold   Optional brightness threshold (0-255, default: 128)');
  console.error('');
  console.error('Example:');
  console.error('  node pixelate-image.js photo.png 81 108');
  process.exit(1);
}

const imagePath = path.resolve(args[0]);
const targetRows = parseInt(args[1], 10);
const targetCols = parseInt(args[2], 10);
const threshold = args[3] ? parseInt(args[3], 10) : 128;

// Validate arguments
if (isNaN(targetRows) || targetRows <= 0) {
  console.error(`Error: Invalid rows value: ${args[1]}`);
  process.exit(1);
}

if (isNaN(targetCols) || targetCols <= 0) {
  console.error(`Error: Invalid cols value: ${args[2]}`);
  process.exit(1);
}

if (threshold < 0 || threshold > 255) {
  console.error(`Error: Threshold must be between 0 and 255, got: ${threshold}`);
  process.exit(1);
}

// Helper to convert hex to RGBA
function intToRGBA(i) {
  if (typeof i !== 'number') {
    throw new Error('intToRGBA expects a number');
  }
  const r = (i >>> 24) & 0xFF;
  const g = (i >>> 16) & 0xFF;
  const b = (i >>> 8) & 0xFF;
  const a = i & 0xFF;
  return { r, g, b, a };
}

// Process the image
(async () => {
  try {
    // Read the image
    let Jimp = require('jimp').Jimp || require('jimp');
    if (!Jimp.read && require('jimp').default) {
      Jimp = require('jimp').default;
    }
    
    const image = await Jimp.read(imagePath);
    
    // Resize to target dimensions
    try {
      image.resize({ w: targetCols, h: targetRows });
    } catch {
      image.resize(targetCols, targetRows);
    }
    
    // Convert to grayscale
    try {
      image.greyscale();
    } catch {
      image.grayscale();
    }

    // Create binary array
    const binaryArray = [];

    for (let y = 0; y < targetRows; y++) {
      const row = [];
      for (let x = 0; x < targetCols; x++) {
        const hex = image.getPixelColor(x, y);
        
        let brightness;
        if (typeof hex === 'object') {
          brightness = hex.r;
        } else {
          const rgba = intToRGBA(hex);
          brightness = rgba.r;
        }
        
        // Apply thresholding: < threshold -> 1 (black), >= threshold -> 0 (white)
        const value = brightness < threshold ? 1 : 0;
        row.push(value);
      }
      binaryArray.push(row);
    }
    
    // Output the array in a compact JavaScript format
    console.log('[' + binaryArray.map(row => '[' + row.join(',') + ']').join(',') + ']');

  } catch (err) {
    console.error('Error processing image:', err.message);
    process.exit(1);
  }
})();
