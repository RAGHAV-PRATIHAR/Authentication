//jshint esversion:6
require('dotenv').config()
const express = require("express");
let ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var encrypt = require('mongoose-encryption');
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/userDB");
}

const userSchema = mongoose.Schema({
  Username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});
const secret="this is our secret."
userSchema.plugin(encrypt, { secret: process.env.secret,  encryptedFields: ['password'] });
const user = new mongoose.model("user", userSchema);

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// async function getdocs(user){
//     const docs=await User.find({username:user})
//     return docs
// }
app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async function (req, res) {
  const NewUser = new user({
    Username: req.body.username,
    password: req.body.password,
  });
  await NewUser.save().then(function (found) {
    if (found) res.render("secrets");
    else console.log("something weird happened");
  });
});

app.post("/login", async function (req, res) {
  try {
    const email = req.body.username;
    const passcode = req.body.password;
    await user.find({ username: email }).then(function (found) {
      if (found.password === passcode) res.render("secrets");
      else console.log(found);
    })
  } catch (err) {
    console.log(err);
  }
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
