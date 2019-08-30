/* eslint-disable eqeqeq */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-vars */
/**
 * SessionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
// import User from User.js;
require('../models/User');
// require('bcrypt');

module.exports = {

  // 'new': function (req, res) {
  //   console.log(req.session);
  //   res.view('user/login');
  // },

  create: async function (req, res) {

    await User.findOne({
      emailAddress: req.param('email')
    }, function foundUser(err, user) {
      if (err) {
        return req.next(err);
      }
      if (!user) {
        console.log('email address not found');
        var noAccountError = [{
          name: 'noAccount',
          message: 'email address not found'
        }];
        req.session.flush = {
          err: noAccountError
        };
        res.redirect('/login');
        return;
      }

      // eslint-disable-next-line prefer-arrow-callback
      require('bcrypt').compare(req.param('password'), user.password, function (err, valid) {
        if (err) {
          return req.next(err);
        }
        if (!valid) {
          console.log('wrong pwd');
          res.redirect('/login');
          return;
        }
        req.session.authenticated = true;
        req.session.user = user;
        // res.redirect('/user/showone/'+user.id, {layout:'layouts/staff-layout'});
        if (user.authority === 1) {
          res.redirect('/staff/index/');
        } else if (user.authority === 2) {
          res.redirect('/teacher/index');
        } else if (user.authority === 3) {
          res.redirect('/student/index');
        } else {
          res.redirect('/login');
        }

      });
    });
  },

  destroy: function (req, res) {
    req.session.destroy();

    res.redirect('/login');
  }
};
