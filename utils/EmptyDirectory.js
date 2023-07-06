const fs = require("fs-extra");
const path = require("path");

function clearUploadsFolder() {
  const uploadsFolder = path.join(__dirname, "../uploads/");
  fs.emptyDirSync(uploadsFolder);
  console.log(`Uploads folder cleared`);
}

module.exports = { clearUploadsFolder };
