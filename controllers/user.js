const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("./users/signup.ejs");
};

module.exports.signUp = async (req, res) => {
  try {
    let { username, password, email } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "welcome to wanderlust");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("./users/login.ejs");
};

module.exports.Login = async (req, res) => {
  req.flash("success", " welcome back to wanderlust ");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.Logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out");
    res.redirect("/listings");
  });
};
