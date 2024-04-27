const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Customer = require("../models/customer");

function generateToken(payload, secretKey) {
    const token = jwt.sign(payload, secretKey);
    return token;
  }

  const signUp = (req, res) => {
    const { email, name, phone, password, username, confirm_password } = req.body;
    console.log(req.body);
    if (password !== confirm_password) {
      res.status(200).json({ message: "Mật khẩu không khớp" });
    } else {
      Customer.findOne({ $or: [{ name: name }, { email: email }] }).then(
        (existingCustomer) => {
          if (existingCustomer) {
            res.status(201).json({ message: "User details already exist" });    
          } else {
            bcrypt
              .hash(password, 10)
              .then((hashedPassword) => {
                const activationToken = crypto.randomBytes(32).toString("hex");
                const newCustomer = new Customer({
                  email: email,
                  name: name,
                  phone: phone,
                  username: username,
                  password: hashedPassword,
                  activationToken: activationToken,
                });
                return newCustomer.save();
              })
              .then((newCustomer) => {
                let transporter = nodemailer.createTransport({
                  service: "Gmail",
                  auth: {
                    user: process.env.USER,
                    pass: process.env.PASS,
                  },
                });
                const secretKey = "signupCus";
                const payload = {
                  email: newCustomer.email,
                  activationToken: newCustomer.activationToken,
                };
                const token = generateToken(payload, secretKey);
                const activationLink =
                  process.env.url_domain + `/auth/activate?token=${token}`;
  
                let mailOptions = {
                  from: "nguyenquangloi2666@gmail.com",
                  to: newCustomer.email,
                  subject: "Activate your account",
                  html: `<p>Click the link below to activate your account:</p><a href="${activationLink}">Activate</a>`,
                };
  
                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log("Email sent: " + info.response);
                  }
                });
                res.status(203).json({ message: "Check your email to activate your account" });
              });
          }
        }
      );
    }
  };

  const activateAccount = async (req, res) => {
    const { token } = req.query;
    if (!token) {
      return res.status(404).send("Đường link kích hoạt không hợp lệ");
    }
  
    try {
      const decodedToken = jwt.verify(token, "signupCus");
  
      const customer = await Customer.findOneAndUpdate(
        {
          email: decodedToken.email,
          activationToken: decodedToken.activationToken,
        },
        { $set: { isActive: true, activationToken: null } },
        { new: true }
      );
  
      if (!customer) {
        return res.status(404).send("Đường link kích hoạt không hợp lệ");
      }
  
      // Redirect to the login page or a success page
      res.status(200).send("Kích hoạt tài khoản thành công");
    } catch (err) {
      res.status(500).send("Đường link kích hoạt không hợp lệ");
    }
  };

  const login = (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);
    Customer.findOne({ username: username }).then((existingCustomer) => {
      if (existingCustomer && existingCustomer.isActive) {
        bcrypt.compare(password, existingCustomer.password).then((match) => {
          if (match) {
            res.status(201).json({ message: "Đăng nhập thành công", existingCustomer });
          } else {
            res.status(202).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
          }
        });
      } else {
        res.status(203).json({ message: "Tài khoản chưa được kích hoạt" });
      }
    });
  };
  

module.exports = {signUp, activateAccount, login };
