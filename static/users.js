const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

// Load User model
const User = require("../models/User");
//Login Page
router.get("/login", (req, res) => res.render("login"));
//Register Page
router.get("/register", (req, res) => res.render("register"));

// Google oAuth
router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));
router.get('/google/callback',passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
)

let transporter = nodemailer.createTransport({
  host:'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
      user: 'praveenchandra273v@gmail.com', // generated  user
      pass: ''  // generated  password
  }
});


//Register Handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //Check Requied Fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }
  //Password Match
  if (password !== password2) {
    errors.push({ msg: "Password do not match" });
  }
  //Check Password Lenght
  if (password.length < 6) {
    errors.push({ msg: "Password should be atleast 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    // Validation Passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // user exists
        errors.push({ msg: "Email is already registerd" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          provider: 'email'
        });
        //Hash password
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(newUser.password, salt,(err,hash)=>{
                if(err) throw err;
                newUser.password=hash;
                newUser.save()
                .then(user=>{
                    req.flash('success_msg','You are now registered and can now log in')
                    res.redirect('/users/login');
                })
                .catch(err=>{console.log(err)});
            })
        })
      }
    });
  }
});

// Login handle
router.post('/login',(req,res,next)=>{
  passport.authenticate('local',{
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true //req.flash('error')
  })(req,res,next);
});

// logout handle
router.get('/logout',(req,res)=>{
  req.logOut();
  req.flash('success_msg','You are successfully logged out');
  res.redirect('/users/login');
});

//Forget password handle
router.get("/forget", (req, res) => res.render("forget"));

router.post("/forget",(req,res)=>{
  crypto.randomBytes(32,(err,buffer)=>{
    if(err){
        console.log(err)
    }
    const token = buffer.toString("hex")
    User.findOne({email:req.body.email})
    .then(user=>{
        if(!user){
          req.flash('error_msg','No user with this email')
          return (res.redirect('/users/forget'));  
        }
        user.resetToken = token
        user.expireToken = Date.now() + 23400000; //token valid for one hour
        const url = `http://localhost:5000/users/reset/${token}`
        console.log(url);
        user.save().then((result)=>{
            // transporter.sendMail({
            //     to:user.email,
            //     from:"NodeJs-Authentication-App <praveenchandra273v@gmail.com>",
            //     subject:"Password reset",
            //     html:`
            //     <p>You requested for password reset</p>
            //     <h5>Click this <a href=${url}>link</a> to reset password</h5>`
            // })
        })
        req.flash('success_msg','Password reset link sent')
        res.redirect('/users/forget');
    })
  })
});

//Reset-password handle
router.get("/reset/:token", (req, res) => res.render("reset"));

router.post('/reset/:token',(req,res)=>{

    const newPassword = req.body.password
    const password2 = req.body.password2
    const sentToken = req.params.token
    let errors = [];

  //Check Requied Fields
  if (!newPassword || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }
  //Password Match
  if (newPassword !== password2) {
    errors.push({ msg: "Password do not match" });
  }
  //Check Password Lenght
  if (newPassword.length < 6) {
    errors.push({ msg: "Password should be atleast 6 characters" });
  }
  if (errors.length > 0) {
    res.render("reset", {
      errors
    });
  }
  else{  
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            req.flash('error_msg',"Try again session expired")
            res.redirect('/users/forget')
        }
        else{
        bcrypt.hash(newPassword,10).then(hashedpassword=>{
          user.password = hashedpassword
          user.resetToken = undefined
          user.expireToken = undefined
          user.save().then((saveduser)=>{
            req.flash('success_msg','Password updated successfully')
            res.redirect('/users/login');
          })
        })
      } 
    }).catch(err=>{
        console.log(err)
    })
   }
});

module.exports = router;