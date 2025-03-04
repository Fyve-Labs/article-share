/**
 * This is a utility script to generate placeholder icons for the extension.
 * 
 * In a production version, you would replace these with designed icons.
 * This script creates simple placeholder SVG icons that can be used during development.
 * 
 * Usage: Run with Node.js: node create_icons.js
 */

const fs = require('fs');
const path = require('path');

// Generate SVG icon with text
function generateSvgIcon(size, text) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#4285F4" rx="${size * 0.2}" ry="${size * 0.2}"/>
    <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.4}" 
      fill="white" text-anchor="middle" dy="${size * 0.14}">AS</text>
    ${text ? `<text x="50%" y="75%" font-family="Arial" font-size="${size * 0.15}" 
      fill="white" text-anchor="middle">${text}</text>` : ''}
  </svg>`;
}

// Icon sizes based on Chrome requirements
const sizes = [16, 48, 128];

// Ensure the images directory exists
const imagesDir = __dirname;

console.log('Generating placeholder icons...');

// Create each icon size
sizes.forEach(size => {
  const svgContent = generateSvgIcon(size, size);
  const filePath = path.join(imagesDir, `icon${size}.svg`);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created: ${filePath}`);
});

console.log('Done! Generated placeholder SVG icons.');
console.log('Note: You may want to convert these to PNG for production use.'); 