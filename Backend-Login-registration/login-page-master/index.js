const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/loginDB");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String },
});

const User = mongoose.model("User", userSchema);

app.get("/register", function (req, res) {
  res.render("registration");
});

app.get("/login", function (req, res) {
  res.render("main");
});

app.post("/register", async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const response = await User.create({
      username: username,
      password: hashedPassword,
    });
    if (!response) {
      res.send("There was an error");
    } else {
      res.send("You've registered successfully");
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/login", async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const user = await User.findOne({ username: username }).lean();
    if (!user) {
      res.send("Invalid credentials");
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      } else {
        res.send("congratulations! You've logged in successfully");
      }
    }
  } catch (error) {
    res.send("Error occured while logging in");
  }
});

app.listen(3000, function () {
  console.log("server started on port 3000");
});
