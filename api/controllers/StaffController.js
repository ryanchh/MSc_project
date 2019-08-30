/* eslint-disable eqeqeq */
/**
 * StaffController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
require('../models/User');
require('../models/Module');

module.exports = {

  //   newUser: function (req, res) {
  //     res.view('user/staff/new-user', {
  //       layout: 'layouts/user-layout'
  //     });
  //   },
  firstAdmin: async function(req, res){
    console.log('first admin');
    await User.create({
      emailAddress: req.param('emailAddress'),
      username: req.param('username'),
      password: req.param('password'),
      authority: 1,
    }, function userCreated(err, data) {
      if (err) {
        return req.next(err);
      }
      console.log('data:',data);
      res.redirect('/login');
    });
  },

  createUser: function (req, res) {
    var authority;
    if(req.param('authority')=='Staff'){
      authority = 1;
    }else if(req.param('authority')=='Teacher'){
      authority = 2;
    }else if(req.param('authority')=='Student'){
      authority = 3;
    }else{
      throw new Error('unexpected authoriy value');
    }
    User.create({
      emailAddress: req.param('emailAddress'),
      username: req.param('username'),
      password: req.param('password'),
      authority: authority,
    }, function userCreated(err) {
      if (err) {
        return req.next(err);
      }
      res.redirect('/staff/user_all');
    });
  },

  showAllUser: async function (req, res) {
    await User.find({}).exec((err, users) => {
      if (err) {
        res.send(500, {
          error: 'database error'
        });
      }
      res.view('user/staff/show-all', {
        users: users,
        layout: 'layouts/user-layout'
      });
    });
  },

  userDetail: async function (req, res) {
    await User.findOne(req.param('id'), function foundUser(err, user) {
      if (err) {
        return req.next(err);
      }
      if (!user) {
        return req.next();
      }
      res.view('user/staff/user-detail', {
        user: user,
        layout: 'layouts/user-layout'
      });
    });
  },

  teacherAll: async function (req, res) {
    await User.find({
      authority: 2
    }).exec((err, teachers) => {
      if (err) {
        res.send({
          error: 'database error'
        });
      }
      res.view('user/staff/teacher-all', {
        teachers: teachers,
        layout: 'layouts/user-layout'
      });
    });
  },

  findTeacher: async function (req, res) {
    if (req.param('keyword') === '') {
      await User.find({
        authority: 2
      }).exec((err, teacher) => {
        if (err) {
          res.send({
            error: 'database error'
          });
        }
        res.view('user/staff/teacher-all', {
          teachers: teacher,
          layout: 'layouts/user-layout'
        });
      });
    } else {
      await User.find({
        // userName: req.param('keyword'),
        or: [{
          username: req.param('keyword')
        }, {
          emailAddress: req.param('keyword')
        }],
        authority: 2
      }).exec((err, teacher) => {
        if (err) {
          console.log(err);
          res.send({
            error: err
          });
        }
        res.view('user/staff/teacher-all', {
          teachers: teacher,
          layout: 'layouts/user-layout'
        });
      });
    }
  },

  findStudent: async function (req, res) {
    if (req.param('keyword') === '') {
      await User.find({
        authority: 3
      }).exec((err, students) => {
        if (err) {
          res.send({
            error: 'database error'
          });
        }
        res.view('user/staff/student-all', {
          students: students,
          layout: 'layouts/user-layout'
        });
      });
    } else {
      await User.find({
        or: [{
          username: req.param('keyword')
        }, {
          emailAddress: req.param('keyword')
        }],
        authority: 3
      }).exec((err, student) => {
        if (err) {
          console.log(err);
          res.send({
            error: err
          });
        }
        res.view('user/staff/student-all', {
          students: student,
          layout: 'layouts/user-layout'
        });
      });
    }
  },

  findModule: async function (req, res) {
    if (req.param('keyword') === '') {
      await Module.find({}).exec((err, modules) => {
        if (err) {
          res.send({
            error: 'database error'
          });
        }
        res.view('user/staff/module-all', {
          modules: modules,
          layout: 'layouts/user-layout'
        });
      });
    } else {
      await Module.find({
        or: [{
          moduleCode: req.param('keyword')
        }, {
          moduleTitle: req.param('keyword')
        },{
          moduleYear: req.param('keyword')
        }],
      }).exec((err, module) => {
        if (err) {
          console.log(err);
          res.send({
            error: err
          });
        }
        res.view('user/staff/module-all', {
          modules: module,
          layout: 'layouts/user-layout'
        });
      });
    }
  },

  studentAll: async function (req, res) {
    await User.find({
      authority: 3
    }).exec((err, students) => {
      if (err) {
        res.send({
          error: 'database error'
        });
      }
      res.view('user/staff/student-all', {
        students: students,
        layout: 'layouts/user-layout'
      });
    });
  },

};
