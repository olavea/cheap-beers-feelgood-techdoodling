const passport = require('passport');

// a strategy i passport a local is not facebook
// config object
exports.login = passport.authenticate('local', {
  failureRedirect: '/login', 
  failureFlash: 'Failed Login!',
  successsRedirect: '/', 
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out! 👋 ');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  //first check if the user is authenticated
  if (req.isAuthenticated()) {
    next(); //Carry on! They are logged in!
    return;
  }
  req.flash('error', 'Oops you must be logged in to do that!');
  res.redirect('/login');
};