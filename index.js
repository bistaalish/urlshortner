require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const URLModel = require("./models/urlModel")
var validUrl = require('valid-url');
const shortId = require("shortid")
// DB set up
const uri = process.env.MONGO_URI
// Mongoose connect to database
mongoose.connect(uri,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTImeoutMS: 5000
})
const connection = mongoose.connection;

connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})
// Basic Configuration
const port = process.env.PORT || 3000;

// Logger middleware
// Middleware for logging requests
const logMiddleware = (req, res, next) => {
  // Create a log string containing request method, path, and IP address
  const logString = `${req.method} ${req.path} - ${req.ip}`;
  console.log(logString);
  console.log(req.body);
  next(); // Move to the next middleware or route handler
};


app.use(logMiddleware)
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(cors());
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl",async (req,res)=>{
  // res.json(req.body)
  const url = req.body.url
  const urlCode = shortId.generate();
  // check if the url is valid or not.
  if(!validUrl.isWebUri(url)){
    res.status(401).json({
      error: 'invalid URL'
    })
  }
})


app.get('/api/shorturl/:short_url?', async function (req, res) {
  try {
    const urlParams = await URL.findOne({
      short_url: req.params.short_url
    })
    if (urlParams) {
      return res.redirect(urlParams.original_url)
    } else {
      return res.status(404).json('No URL found')
    }
  } catch (err) {
    console.log(err)
    res.status(500).json('Server error')
  }
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
