const multer = require('multer');

const upload = multer({
  dest: 'uploads/', // Set a temporary storage location, but we won't be using it
  limits: { fileSize: 1024 * 1024 * 1024 }, // Set the maximum file size limit to 1024MB or 1GB
});

module.exports = (req, res, next) => {
  upload.single('video')(req, res, (err) => {
    if (err) {
      // Handle the error
      return res.status(500).json({ error: 'Failed to upload file' });
    }
    // Access the original file path from req.file.path
    const filePath = req.file.path;

    // Now you can use the filePath for further processing or uploading to Dropbox
    // Call the next middleware or send the response
    next();
  });
};
