// Helper function to escape characters in base64url encoding
function base64UrlEscape(str) {
    return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

module.exports = { base64UrlEscape };