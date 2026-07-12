const multer = require('multer');
const path = require('path');
const fs = require('fs');

const MAX_VIDEO_SIZE = parseInt(process.env.MAX_VIDEO_SIZE, 10) || 1610612736; // 1.5GB
const MAX_DOC_SIZE = parseInt(process.env.MAX_DOC_SIZE, 10) || 52428800; // 50MB
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

const folderFor = (type) => {
  switch (type) {
    case 'video':
      return 'videos';
    case 'pdf':
      return 'pdfs';
    case 'ppt':
      return 'ppts';
    case 'avatar':
      return 'avatars';
    default:
      return 'misc';
  }
};

const ALLOWED_MIME = {
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska'],
  pdf: ['application/pdf'],
  ppt: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  avatar: ['image/jpeg', 'image/png', 'image/webp'],
};

const detectMaterialType = (mimetype) => {
  if (ALLOWED_MIME.video.includes(mimetype)) return 'video';
  if (ALLOWED_MIME.pdf.includes(mimetype)) return 'pdf';
  if (ALLOWED_MIME.ppt.includes(mimetype)) return 'ppt';
  return null;
};

const IMAGE_FIELDS = ['avatar', 'thumbnail'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let type;
    if (IMAGE_FIELDS.includes(file.fieldname)) {
      type = 'avatar';
    } else {
      type = detectMaterialType(file.mimetype) || 'misc';
    }
    const dest = path.join(UPLOAD_ROOT, folderFor(type));
    fs.mkdirSync(dest, { recursive: true });
    req._detectedType = type;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (IMAGE_FIELDS.includes(file.fieldname)) {
    if (ALLOWED_MIME.avatar.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Only JPEG, PNG or WEBP images are allowed for this field'));
  }

  // study material field
  const type = detectMaterialType(file.mimetype);
  if (!type) {
    return cb(
      new Error('Unsupported file type. Allowed: MP4/WEBM/MOV videos, PDF, PPT/PPTX')
    );
  }
  cb(null, true);
};

// Dynamic size limit is handled post-upload since multer needs one static limit;
// we set the limit to the largest allowed (video) and validate doc/avatar size manually.
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE },
});

// Middleware to enforce per-type size limits after multer has written the file
const enforceSizeLimits = (req, res, next) => {
  if (!req.file) return next();

  const type = IMAGE_FIELDS.includes(req.file.fieldname) ? 'avatar' : detectMaterialType(req.file.mimetype);
  const limit =
    type === 'video' ? MAX_VIDEO_SIZE : type === 'avatar' ? MAX_AVATAR_SIZE : MAX_DOC_SIZE;

  if (req.file.size > limit) {
    fs.unlink(req.file.path, () => {});
    res.status(400);
    return next(
      new Error(
        `File exceeds maximum allowed size of ${(limit / (1024 * 1024)).toFixed(0)}MB for type "${type}"`
      )
    );
  }

  req.file.materialType = type;
  next();
};

module.exports = { upload, enforceSizeLimits, MAX_VIDEO_SIZE, MAX_DOC_SIZE };
