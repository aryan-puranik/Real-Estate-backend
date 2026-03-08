import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const rootDir = process.cwd();


// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Base upload paths - now relative to root
const BASE_UPLOAD_PATH = path.join(rootDir, 'uploads/');
ensureDirectoryExists(BASE_UPLOAD_PATH);

// Create subdirectories for different upload types
const UPLOAD_PATHS = {
  properties: path.join(BASE_UPLOAD_PATH, 'properties/'),
  profiles: path.join(BASE_UPLOAD_PATH, 'profiles/')
};


// Ensure all upload directories exist
Object.values(UPLOAD_PATHS).forEach(dir => ensureDirectoryExists(dir));

// Dynamic storage based on upload type
const getStorage = (uploadType = 'properties') => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath;

      if (uploadType === 'profile') {
        uploadPath = UPLOAD_PATHS.profiles;
      } else {
        // Property images logic
        uploadPath = UPLOAD_PATHS.properties;

        // Create property-specific folder if property ID is available
        if (req.body.propertyId) {
          uploadPath = path.join(uploadPath, req.body.propertyId, '/');
        } else if (req.params.id) {
          uploadPath = path.join(uploadPath, req.params.id, '/');
        }
      }

      // Create folder if it doesn't exist
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      // Sanitize filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();

      // For profile photos, use a simpler naming convention
      if (uploadType === 'profile') {
        // Include user identifier if available
        const userIdentifier = req.body.email ?
          req.body.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '-') :
          'user';
        cb(null, `profile-${userIdentifier}-${uniqueSuffix}${ext}`);
      } else {
        // Property images naming (existing logic)
        const sanitizedFilename = file.originalname
          .replace(/[^a-zA-Z0-9]/g, '-')
          .replace(/-+/g, '-')
          .toLowerCase();

        const nameWithoutExt = sanitizedFilename.replace(ext, '');
        cb(null, `${uniqueSuffix}-${nameWithoutExt}${ext}`);
      }
    },
  });
};

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

// Configure multer for property images (multiple files)
export const upload = multer({
  storage: getStorage('properties'),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files per upload
  },
});

// Configure multer for profile photos (single file)
export const uploadProfilePhoto = multer({
  storage: getStorage('profile'),
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for profile photos
    files: 1 // Only one file
  },
});

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: err.field === 'profilePhoto' ?
          'Profile photo maximum size is 2MB' :
          'Maximum file size is 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: err.field === 'profilePhoto' ?
          'Only one profile photo allowed' :
          'Maximum 10 files allowed'
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