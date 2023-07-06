const express = require('express');
const session = require('express-session');
const cors = require('cors');
const Routes = require('./Routes/Routes');
const app = express();
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require("path")

dotenv.config(); // Load environment variables from .env file

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Configure static file serving
app.use(express.static(path.join(__dirname, 'assets')));

// Configure session middleware with connect-mongo as the store
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  })
);

app.listen(process.env.PORT_NO || 4001, () => {
  console.log(`Server started at port Port no. ${process.env.PORT_NO}`);
});

app.use(
  cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

app.use('/', Routes);
