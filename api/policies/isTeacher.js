module.exports = function (req, res, ok) {
  if (req.session.user.authority === 2) {
    return ok();
  } else {
    res.redirect('/login');
    return;
  }
};
