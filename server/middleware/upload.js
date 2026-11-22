import 'dotenv/config';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Image uploads.
 * - If CLOUDINARY_URL is set (production), files are kept in memory and streamed to Cloudinary;
 *   each file gets `publicUrl` set to the hosted https URL.
 * - Otherwise files are written to disk (./uploads locally, /tmp/uploads on Vercel, which is
 *   temporary — set CLOUDINARY_URL in production so images persist).
 */
const useCloudinary = Boolean(process.env.CLOUDINARY_URL);

export const uploadDir = process.env.VERCEL ? path.join(os.tmpdir(), 'uploads') : './uploads';

if (!useCloudinary && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = useCloudinary
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    });

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) return cb(null, true);
  cb(new Error('Only images (JPEG, JPG, PNG, WEBP, GIF) are allowed!'), false);
};

const multerUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: process.env.CLOUDINARY_FOLDER || 'labline', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(file.buffer);
  });

// Runs after multer: pushes in-memory files to Cloudinary.
const cloudinaryStep = async (req, res, next) => {
  if (!useCloudinary) return next();
  try {
    const files = req.files || (req.file ? [req.file] : []);
    await Promise.all(
      files.map(async (file) => {
        const result = await uploadToCloudinary(file);
        file.publicUrl = result.secure_url;
        delete file.buffer;
      })
    );
    next();
  } catch (err) {
    next(err);
  }
};

/** Public URL/path to store in the database for an uploaded file. */
export const fileUrl = (file) => file.publicUrl || `/uploads/${file.filename}`;

const upload = {
  single: (field) => [multerUpload.single(field), cloudinaryStep],
  array: (field, max) => [multerUpload.array(field, max), cloudinaryStep],
};

export default upload;
