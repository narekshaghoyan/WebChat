const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

const { hashPass, comparePass } = require("../utils/bcrypt")

const usersFilePath = path.join(__dirname, "../../public/users.json");
require("dotenv").config()

const MY_CUSTOM_SECRET_KEY = process.env.JWT_SECRET_KEY;

const signUp = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  let users = [];

  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading users file:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (data) {
      try {
        users = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing users file:", parseError);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
    const existingUser = users.find((user) => user.username === username);

    if (existingUser) {
      const msg = "Username already exists"
      const status = "fail"
      return res.status(400).redirect(`/index.html?message=${msg}&status=${status}`);
    }
    hashPass(password).then((bcryptedPassword) => {
      const token = jwt.sign({ username }, MY_CUSTOM_SECRET_KEY );
      const id = uuid.v4();
      const newUser = { id, username, password: bcryptedPassword, token };
      users.push(newUser);

      fs.writeFile(usersFilePath, JSON.stringify(users), "utf8", (writeErr) => {
        if (writeErr) {
          console.error("Error writing users file:", writeErr);
          return res.status(500).json({ message: "Internal server error" });
        }
        const successMessage = "Signup successful. Please login.";
        const status = "success";
        res
          .status(201)
          .redirect(`/?message=${successMessage}&status=${status}`);
      });
    });
  });

}

const Login = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const room = req.body.room 

  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading users file:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (data) {
      try {
        users = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing users file:", parseError);
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    const existingUser = users.find((user) => user.username === username);

    if (!existingUser) {
      const msg = "Username does not exist!"
      const status = "fail"
      return res.status(400).redirect(`/?message=${msg}&status=${status}`);
    }

    userHashedPass = existingUser['password']

    comparePass(password, userHashedPass).then((IfCorrectPassword) => {
      if (!IfCorrectPassword) {
        const msg = "Username or password no correct"
        const status = "fail"
        return res.status(401).redirect(`/?message=${msg}&status=${status}`);
      }
      UserToken = existingUser['token']

      const token = jwt.sign({ username, room }, MY_CUSTOM_SECRET_KEY )

      return res.status(401).redirect(`/chat.html?token=${token}`);
    })
  });
}

module.exports = {
  signUp,
  Login
};