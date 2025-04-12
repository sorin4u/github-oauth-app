

/* 
 * Package Imports
*/

const path = require("path");
require("dotenv").config();
const express = require('express');
const partials = require('express-partials');
const session = require('express-session'); // Part 2: Import express-session
const passport = require('passport'); // Part 3: Import passport
const GitHubStrategy = require('passport-github2').Strategy; // Part 3: Import GitHubStrategy

const app = express();

/*
 * Variable Declarations
*/

const PORT = 3000;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

/*
 * Passport Configurations
*/

passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/github/callback"
}, function(accessToken, refreshToken, profile, done) {
  return done(null, profile); // Part 3: Verify callback
}));

passport.serializeUser(function(user, done) {
  done(null, user); // Part 4: Serialize user
});

passport.deserializeUser(function(user, done) {
  done(null, user); // Part 4: Deserialize user
});

/*
 *  Express Project Setup
*/

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.use(session({ // Part 2: Initialize session
  secret: 'codecademy',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize()); // Part 3: Initialize Passport
app.use(passport.session()); // Part 3: Use Passport session

/*
 * Routes
*/

app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, (req, res) => { // Part 5: Protect /account route
  res.render('account', { user: req.user });
});

app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});



app.get('/logout', (req, res, next) => {
  req.logout((err) => { // Pass a callback to handle errors
    if (err) { return next(err); }
    res.redirect('/login'); // Redirect to the login page after logout
  });
});

app.get('/auth/github', passport.authenticate('github', { scope: ['user'] })); // Part 5: GitHub authentication route

app.get('/auth/github/callback', passport.authenticate('github', { // Part 5: Authorization callback URL
  failureRedirect: '/login',
  successRedirect: '/'
}));

/*
 * Listener
*/

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

/*
 * ensureAuthenticated Callback Function
*/

function ensureAuthenticated(req, res, next) { // Part 5: Ensure authenticated middleware
  if (req.isAuthenticated()) { 
    return next(); 
  }
  res.redirect('/login');
}