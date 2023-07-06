const { Root, AddVideoToDropbox, DropboxAuth, DropboxAuthCallback, AuthCheck, RouteUnavailable} = require('../Controllers/Controllers')
const singleUploadMiddleware = require('../Middlewares/Middlewares');

const router = require('express').Router()

// Root endpoint
router.get('/', Root)

router.get('/dropbox-auth', DropboxAuth);
  
// Handle the authentication callback and retrieve the access token
router.get('/dropbox-auth/callback',DropboxAuthCallback);

router.get('/authCheck', AuthCheck);

// Upload endpoint
router.post('/upload',singleUploadMiddleware, AddVideoToDropbox)

// Route Unavailable
router.get('/*', RouteUnavailable);


module.exports = router
