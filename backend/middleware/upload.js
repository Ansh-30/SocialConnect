const multer = require('multer');

const cloudinary =
  require('../config/cloudinary');

const {
  CloudinaryStorage,
} = require(
  'multer-storage-cloudinary'
);


// ─────────────────────────────────────────────
// Cloudinary Storage
// ─────────────────────────────────────────────

const storage =
  new CloudinaryStorage({

    cloudinary,

    params: async (
      req,
      file
    ) => {

      return {

        folder:
          'socioconnect',

        allowed_formats: [
          'jpg',
          'jpeg',
          'png',
          'gif',
          'webp',
        ],

        public_id: `${
          Date.now()
        }-${Math.round(
          Math.random() * 1e9
        )}`,
      };
    },
  });


// ─────────────────────────────────────────────
// File Filter
// ─────────────────────────────────────────────

const fileFilter = (
  req,
  file,
  cb
) => {

  const allowed = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (
    allowed.includes(
      file.mimetype
    )
  ) {

    cb(null, true);

  } else {

    cb(
      new Error(
        'Only image files allowed (jpeg/png/gif/webp)'
      )
    );
  }
};


// ─────────────────────────────────────────────
// Multer Upload Middleware
// ─────────────────────────────────────────────

const upload = multer({

  storage,

  fileFilter,

  limits: {

    fileSize:
      5 * 1024 * 1024,
  },
});


module.exports = upload;