const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const ip = require('express-ip');
const geoip = require('geoip-lite');

const { hashPass, comparePass } = require("../utils/bcrypt");
const { GetNowDate } = require("../utils/generators");
const { IsEmail } = require("../utils/filters");

const usersFilePath = path.join(__dirname, "../../public/users.json");

require("dotenv").config()

const MY_CUSTOM_SECRET_KEY = process.env.JWT_SECRET_KEY;

const signUp = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email
  const first_name = req.body.first_name
  const last_name = req.body.last_name

  // Get user's IP address
  var ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress 

  // Get user's geolocation based on IP address
  const geo = geoip.lookup(ipAddr);

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

    const existingUser = users.find((user) => user.system_info.authentication.username === username) 
    const existingEmail = users.find((user) => user.personal_info.contact_info.email === email)

    if (!IsEmail(email)) {
      const msg = "No correct email"
      const status = "fail"
      return res.status(400).redirect(`/index.html?message=${msg}&status=${status}`);
    }

    if (existingUser) {
      const msg = "Username already exists"
      const status = "fail"
      return res.status(400).redirect(`/index.html?message=${msg}&status=${status}`);
    }
    
    if (existingEmail) {
      const msg = "Email already exists"
      const status = "fail"
      return res.status(400).redirect(`/index.html?message=${msg}&status=${status}`);
    }

    hashPass(password).then((bcryptedPassword) => {
      const token = jwt.sign({ username }, MY_CUSTOM_SECRET_KEY);
      const id = uuid.v4();

      const newUser = {
        "personal_info": {
          "contact_info": {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "full_name": first_name + ' ' + last_name
          },
          // Дополнительные категории персональной информации, если есть
        },
        "system_info": {
          "authentication": {
            "id": id,
            "username": username,
            "password": bcryptedPassword,
            "token": token
          },
          "network_info": {
            "ip": ipAddr,
            geo
          },
          "registration_info": {
            "reg_date": GetNowDate()
          }
        }
      };
      
  
      // Push newUser to the users array and write to the file
      // Note: This part of the code should go inside the fs.writeFile callback
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

    let users = [];

    if (data) {
      try {
        users = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing users file:", parseError);
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    const existingUser = users.find((user) => user.system_info.authentication.username === username);

    if (!existingUser) {
      const msg = "Username does not exist!"
      const status = "fail"
      return res.status(400).redirect(`/?message=${msg}&status=${status}`);
    }

    userHashedPass = existingUser['system_info']['authentication']['password']

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