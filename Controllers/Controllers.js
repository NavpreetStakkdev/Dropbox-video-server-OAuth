const fs = require("fs");
const crypto = require("crypto");
const { upload } = require("./lib/index");
const { clearUploadsFolder } = require("../utils/EmptyDirectory");;
const { dropboxOAuth2, OAuthcache } = require("../utils/OAuth");
const path = require("path")

module.exports.Root = async (req, res, next) => {
  const documentation = `
  <br><br>
  1. You can use the Route /dropbox-auth to get Authenticated with the Video-Server to get your personal access token and Start saving files to Dropbox.
  <br><br>
  2. You can use Route /authcheck to check if you are Authenticated or not.
  <br><br>
  3. To Add files to Your Dropbox Account, you can use the Upload Route (POST) with the Video in the form-data request body. A demonstration has been attached following this Prompt.
  `;

  const imagePath = "/image.png"

  res.send(`
    Congrats! You are on the Dropbox-video-server 🤞. To Start Saving your Content, access the /upload route.
    <br><br>
    ${documentation}
    <br><br>
    <img src="${imagePath}" alt="Demo Image" style="width: 60% ; padding: 10px;">
  `);
};


module.exports.RouteUnavailable = async (req, res, next) => {
  res.status(200).json({
    message: "Route Not available please check and Try again ☹. ",
  });
};

module.exports.AuthCheck = async (req, res, next) => {
  if (req.session.token) {
    message="Congrats you are Authenticated 🤞."
  }
  else{
    message="Oops 😵, You are not Authenticated to get your personal Authentication with the Video server use route /dropbox-auth."
  }
  res.status(200).json({
    message: "Congrats you are Authenticated 🤞.",
  });
};

module.exports.DropboxAuth = async (req, res, next) => {
  dropboxOAuth2.auth.setClientId(process.env.APP_KEY);

  if (!req.session.token) {
    // create a random state value
    let state = crypto.randomBytes(16).toString("hex");
    // Save state and the session id for 10 mins
    OAuthcache.set(state, req.session.id, 6000);
    // get authentication URL and redirect

    const authUrl = await dropboxOAuth2.auth.getAuthenticationUrl(
      process.env.URL_ADDRESS + process.env.OAUTH_REDIRECT_URL,
      state,
      "code",
      "legacy",
      [],
      "none",
      true
    );

    res.redirect(authUrl);
  } else {
    const tokenResponse=req.session.token.result
    dropboxOAuth2.auth.setAccessToken(tokenResponse.access_token);
    dropboxOAuth2.auth.accessToken = tokenResponse.access_token;
    dropboxOAuth2.auth.tokenType = tokenResponse.token_type;
    if (tokenResponse.expires_in) {
      const expiresIn = tokenResponse.expires_in;
      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);
      dropboxOAuth2.auth.accessTokenExpiresAt = expirationDate;
    }
    if (tokenResponse.refresh_token) {
      dropboxOAuth2.auth.refreshToken = tokenResponse.refresh_token;
    }

    // if a token exists, it can be used to access Dropbox resources
    try {
      let account_details = await dropboxOAuth2.usersGetCurrentAccount()
      let display_name = account_details.result.name.display_name;
      console.log(display_name)
      // dropboxOAuth2.auth.setAccessToken(null); // clean up token

      res.send( "Welcome " + display_name + " you have been successsfully authenticated and your app is ready to use! 🥂");
    } catch (error) {
      dropboxOAuth2.auth.setAccessToken(null);
      next(error);
    }
  }
};

// Handle the authentication callback and retrieve the access token
module.exports.DropboxAuthCallback = async (req, res, next) => {
  if (req.query.error_description) {
    return next(new Error(req.query.error_description));
  }

  let state = req.query.state;
  if (!OAuthcache.get(state)) {
    return next(new Error("session expired or invalid state"));
  }

  if (req.query.code) {
    try {
      let token = await dropboxOAuth2.auth.getAccessTokenFromCode(
        process.env.URL_ADDRESS + process.env.OAUTH_REDIRECT_URL,
        req.query.code
      );

      // store token and invalidate state
      req.session.token = token;
      OAuthcache.del(state);

      let accessToken = token.result.access_token;

      // Store the access token securely or use it directly for further Dropbox API calls
      // You can redirect the user to another page or send a response here
      // Save the access token to environment variable
      process.env.ACCESS_TOKEN = accessToken;

      res.send("Authentication successful! " + accessToken);

      res.redirect("/AuthCheck");
    } catch (error) {
      return next(error);
    }
  }
};

module.exports.AddVideoToDropbox = async (req, res, next) => {
  console.log("Upload Triggered!");

  const videoFile = req.file;

  if (!videoFile) {
    return res.status(400).json({ error: "No video file provided" });
  }

  // Read the video file as a stream
  const videoStream = fs.createReadStream(videoFile.path);

  // Specify the save location for the uploaded video file
  const saveLocation = "/dropbox/" + videoFile.originalname;

  // Upload video file to Dropbox
  upload(
    [
      {
        file: videoStream,
        name: videoFile.originalname,
        saveLocation: saveLocation,
      },
    ],
    process.env.ACCESS_TOKEN,
    true
  )
    // upload(files, accessToken, true)
    .then(() => {
      clearUploadsFolder();
      res.status(200).json({ message: "Video uploaded successfully" });
    })
    .catch((error) => {
      console.error("Error uploading video to Dropbox:", error);
      res.status(500).json({ error: "Failed to upload video" });
    });
};
