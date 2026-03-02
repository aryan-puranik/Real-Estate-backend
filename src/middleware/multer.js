import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Base upload paths
const BASE_UPLOAD_PATH = path.join(__dirname, '../uploads/');
ensureDirectoryExists(BASE_UPLOAD_PATH);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(BASE_UPLOAD_PATH, 'properties/');

    // Create property-specific folder if property ID is available
    if (req.body.propertyId) {
      uploadPath = path.join(uploadPath, req.body.propertyId, '/');
    } else if (req.params.id) {
      uploadPath = path.join(uploadPath, req.params.id, '/');
    }

    // Create folder if it doesn't exist
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    // Sanitize filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedFilename = file.originalname
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
      .toLowerCase();

    // Remove extension from sanitized name if it exists
    const nameWithoutExt = sanitizedFilename.replace(ext, '');

    cb(null, `${uniqueSuffix}-${nameWithoutExt}${ext}`);
  },
});

// Image file filter with more comprehensive validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WEBP, BMP) are allowed'));
  }
};

// Configure multer for multiple file uploads
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files per upload
  },
});

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Maximum file size is 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 10 files allowed'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      error: 'Upload error',
      message: err.message
    });
  }
  next();
};