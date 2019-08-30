/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` your home page.            *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  '/': {
    view: 'pages/homepage'
  },


  /*****************************************************
   * For all user
   *****************************************************/

  '/home': 'UserController.home',

  'get /login': {
    view: 'user/login',
    locals: {
      layout: 'layouts/layout'
    }
  },

  'post /login': 'SessionController.create',

  'get /session/destroy': 'SessionController.destroy',

  'get /user/showone/:id': 'UserController.showOne',

  'get /user/enroll_module': 'UserController.unenrolledModule',

  'post /user/enroll_module/:id': 'UserController.enrollModule',
  // 'post /module/enroll': 'UserController.enrollModule',

  // 'delete /user/module/:id': 'UserController.dropModule',
  'post /user/module/:id': 'UserController.dropModule',

  /*****************************************************
   * For staff
   *****************************************************/

  '/set_admin':{
    view: 'user/staff/new-admin',
    locals: {
      layout: 'layouts/layout'
    }
  },

  'post /first_admin': 'StaffController.firstAdmin',


  // staff home page
  '/staff/index': {
    view: 'user/staff/index',
    locals: {
      layout: 'layouts/user-layout'
    }
  },

  // staff use to create new user(staff, teacher, student).
  '/staff/new_user': {
    view: 'user/staff/new-user',
    locals: {
      layout: 'layouts/user-layout'
    }
  },

  '/staff/new_module': {
    view: 'user/staff/new-module',
    locals: {
      layout: 'layouts/user-layout'
    }
  },

  'get /staff/user_all': 'StaffController.showAllUser',

  // show all the module for staff.
  '/staff/module_all': {
    view: 'user/staff/module-all',
    locals: {
      layout: 'layouts/user-layout'
    }
  },

  // show all the module
  'get /staff/module_all': 'ModuleController.moduleAll',

  // show all the teacher for staff.
  'get /staff/teacher_all': 'StaffController.teacherAll',

  // show all the student for staff.
  'get /staff/student_all': 'StaffController.studentAll',

  // show user detail.
  'get /staff/user_detail/:id': 'StaffController.userDetail',

  // create new user.
  'post /user/create': 'StaffController.createUser',

  // search teacher by keyword
  'get /staff/teacher': 'StaffController.findTeacher',

  // search student by keyword
  'get /staff/student': 'StaffController.findStudent',

  // search module by keyword
  'get /staff/module': 'StaffController.findModule',

  // create new module
  'post /staff/module': 'StaffController.createModule',

  /*****************************************************
   * For teacher
   *****************************************************/

  // teacher home page.
  '/teacher/index': {
    view: 'user/teacher/index',
    locals: {
      layout: 'layouts/user-layout'
    }
  },

  '/teacher/my_module': 'TeacherController.myModule',

  'get /teacher/module_all': 'ModuleController.moduleAll',

  'get /teacher/module_detail/:id': 'TeacherController.moduleDetail',

  'get /teacher/module/:id/new_coursework': 'TeacherController.newCoursework',

  'post /teacher/module/:id/new_coursewrok': 'TeacherController.createCoursework',



  /*****************************************************
   * For student
   *****************************************************/

  // student home page.
  '/student/index': {
    view: 'user/student/index',
    locals: {
      layout: 'layouts/user-layout'
    }
  },

  '/student/my_module': 'StudentController.myModule',

  'get /student/module_detail/:id': 'StudentController.moduleDetail',

  'get /student/coursework_detail/:id': 'StudentController.courseworkDetail',

  'get /student/coursework/:id/new_attempt': 'StudentController.newAttempt',

  'post /student/coursework/:id/new_attempt': 'StudentController.postAttempt',

  '/coursework/:cwId/attempt/:id': 'StudentController.attemptDetail',




  /***************************************************************************
   *                                                                          *
   * More custom routes here...                                               *
   * (See https://sailsjs.com/config/routes for examples.)                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the routes in this file, it   *
   * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
   * not match any of those, it is matched against static assets.             *
   *                                                                          *
   ***************************************************************************/


};
