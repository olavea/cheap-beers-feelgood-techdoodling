const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
    res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
    res.render('register', { title: 'Register'}); 
};

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply a name!').notEmpty();

    req.checkBody('email', 'ThatEmail is not valid!').isEmail();
    req.sanitizeBody('email').normalizeEmail({ 
      remove_dots: false,
      remove_extension: false,
      gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
    req.checkBody('password-confirm', 'Password Cannot be Blank!').notEmpty();
    req.checkBody('password-confirm', 'Oops! Your Password do not match').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
        return; // stop the function from running
    }
    next(); // There were no errors
};

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  const register = promisify(User.register, User);
  await register(user, req.body.password); 
  next(); // pass to authController.login
};

exports.account = (req, res) => {
  res.render('account', { title: 'Edit Your Account' });
};

exports.updateAccount = async (req, res) => {
  const updates ={
      name: req.body.name,
      email: req.body.name
  };
//(query, update, options)
  const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: updates },
      { new: true, runValidators: true, context: 'query'}
  );
  //res.json(user); = Invalid Email Address
  req.flash('success', 'Updated the profile!');
  res.redirect('/account');
};

// dog123
// 9hsajfvlakbhvaødosfijvælakdfnb (in database)

// dog123
// 9hsajfvlakbhvaødosfijvælakdfnb (same as provided = login)

// cat123
// shghoaihfiherbgihaeæfbiohjaeføio (not the same Hash! = not login
// and Salt(?) 