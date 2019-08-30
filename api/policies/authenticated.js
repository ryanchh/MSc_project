module.exports = function(req, res, ok){
  if(req.session.authenticated){
    return ok();
  }else{
    res.redirect('/login');
    return;
  }
};
