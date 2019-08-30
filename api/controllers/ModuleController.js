/**
 * ModuleController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  create: function (req, res) {
    Module.create(req.allParams(), function userCreated(err) {
      if (err) {
        return req.next(err);
      }
      res.redirect('/staff/module_all');
    });
  },

  moduleAll: async function (req, res) {
    await Module.find({}).exec((err, modules) => {
      if (err) {
        res.send(500, {
          error: 'database error'
        });
      }
      res.view('user/staff/module-all', {
        modules: modules,
        layout: 'layouts/user-layout'
      });
    });
  }
};
