/* eslint-disable eqeqeq */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-vars */
/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
require('../models/Module');
require('../models/User');
// var http = require('http');
// var https = require('https');

module.exports = {


  login: async function (req, res) {

  },

  home: function (req, res) {
    if (req.session.user.authority === 1) {
      res.redirect('/staff/index');
    } else if (req.session.user.authority === 2) {
      res.redirect('/teacher/index');
    } else if (req.session.user.authority === 2) {
      res.redirect('/student/index');
    }
  },

  myModule: async function (req, res) {
    var enrollment = await User.findOne({
      id: req.session.user.id
    }).populate('enrolledModules');

    if (!enrollment) {
      res.send({
        error: 'database error',
      });
    } else {
      res.view('user/teacher/my-module', {
        modules: enrollment.enrolledModules,
        layout: 'layouts/user-layout'
      });
    }
  },

  unenrolledModule: async function (req, res) {
    var enrollment = await User.findOne({
      id: req.session.user.id
    }).populate('enrolledModules');
    var enrolledModules = enrollment.enrolledModules;
    console.log('enrolled modules:' + JSON.stringify(enrolledModules));
    var enrolledModulesId = new Array();
    var count = 0;
    for (key in enrolledModules) {
      enrolledModulesId[count] = enrolledModules[key].id;
      count = count + 1;
    }
    await Module.find({
      id: {
        '!=': enrolledModulesId
      }
    }).exec((err, modules) => {
      if (err) {
        req.next(err);
      }
      if (!modules) {
        modules = {};
      }
      res.view('user/enroll-module', {
        modules: modules,
        layout: 'layouts/user-layout'
      });
    });
  },

  enrollModule: async function (req, res) {
    await User.addToCollection(req.session.user.id, 'enrolledModules', req.param('id')).exec((err) => {
      if (err) {
        res.send(500, {
          error: 'unable to enroll module'
        });
      }
      if (req.session.user.authority === 2) {
        res.redirect('/teacher/my_module');
      } else if (req.session.user.authority === 3) {
        res.redirect('/student/my_module');
      }

    });

  },

  dropModule: async function (req, res) {
    await User.removeFromCollection(req.session.user.id, 'enrolledModules', req.param('id')).exec((err) => {
      if (err) {
        res.send(500, {
          error: 'database error'
        });
      }
      console.log('drop module success');
      if (req.session.user.authority === 2) {
        res.redirect('/teacher/my_module');
      } else if (req.session.user.authority === 3) {
        res.redirect('/student/my_module');
      }
    });
  },


};
