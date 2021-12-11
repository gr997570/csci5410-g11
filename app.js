const express = require("express");
const app = express();
const userRoute = require("./routes/users");
const uploadRoute = require("./routes/upload");
const chatRoute = require("./routes/chat");
const bodyParser = require('body-parser')
const multer = require('multer')
const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    // no larger than 5mb.
    fileSize: 5 * 1024 * 1024,
  },
})
var cors = require('cors')
app.use(express.json());
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());
//app.use("", userRoute);
app.disable('x-powered-by')
app.use(multerMid.single('file'))
app.use("", userRoute);
app.use("", uploadRoute);
app.use("", chatRoute);

module.exports = app;
