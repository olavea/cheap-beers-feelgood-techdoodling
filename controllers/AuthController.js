const passport = require('passport');

// a strategy i passport a local is not facebook
// config object
exports.login = passport.authenticate('local', {
  failureRedirect: '/login', 
  failureFlash: 'Failed Login!',
  successsRedirect: '/', 
  successFlash: 'You are now logged in!'
});

// exports.logout = (req, res) => {
//     req.logut();
// }