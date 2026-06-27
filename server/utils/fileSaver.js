const fs = require('fs');
const path = require('path');

/**
 * Decodes base64 string and saves it to a file.
 * @param {string} base64Str - Base64 encoded string
 * @param {string} folder - Folder name under uploads directory
 * @param {string} prefix - Filename prefix (e.g. driver ID)
 * @param {string} documentType - Document type name
 * @returns {string} Relative URL of the saved file
 */
const saveBase64File = (base64Str, folder, prefix, documentType) => {
  if (!base64Str || typeof base64Str !== 'string') return null;

  // Match mime type and base64 data
  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    // If it's already a URL, return it as is
    if (base64Str.startsWith('http') || base64Str.startsWith('/uploads')) {
      return base64Str;
    }
    throw new Error('Invalid base64 document format');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // Determine file extension
  let extension = 'bin';
  if (mimeType.includes('pdf')) extension = 'pdf';
  else if (mimeType.includes('png')) extension = 'png';
  else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
  else if (mimeType.includes('webp')) extension = 'webp';

  // Make sure upload directory exists
  const relativeUploadDir = path.join('uploads', folder);
  const absoluteUploadDir = path.resolve(__dirname, '..', relativeUploadDir);

  if (!fs.existsSync(absoluteUploadDir)) {
    fs.mkdirSync(absoluteUploadDir, { recursive: true });
  }

  // Generate unique filename
  const filename = `${prefix}_${documentType}_${Date.now()}.${extension}`;
  const absoluteFilePath = path.join(absoluteUploadDir, filename);

  fs.writeFileSync(absoluteFilePath, buffer);

  // Return the web-accessible relative URL
  return `/uploads/${folder}/${filename}`;
};

module.exports = { saveBase64File };
