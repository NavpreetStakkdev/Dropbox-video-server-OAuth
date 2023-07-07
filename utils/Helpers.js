const crypto = require("crypto");

// Helper function to escape characters in base64url encoding
function base64URLEncode(buffer) {
    let base64 = buffer.toString("base64");
    let base64url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return base64url;
}
  

async function sha256(buffer) {
    const hash = crypto.createHash("sha256");
    hash.update(buffer);
    const digest = hash.digest();
    return digest;
}

module.exports = { base64URLEncode,sha256 };