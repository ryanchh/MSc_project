/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    emailAddress: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
      maxLength: 200,
      example: 'mary.sue@example.com'
    },

    username: {
      type: 'string',
      required: true,
      maxLength: 200,
    },

    password: {
      type: 'string',
      required: true,
    },

    authority: {
      type: 'integer',
      required: true,
    },

    enrolledModules: {
      collection: 'module',
      via: 'enrolledByUsers',
    },

  },

  beforeCreate: function (values, next) {
    if (!values.password) {
      return next({
        err: ['need another password']
      });
    }

    require('bcrypt').hash(values.password, 10, function passwordEncrypted(err, encryptedPassword) {
      if (err) {
        return next(err);
      }
      values.password = encryptedPassword;
      next();
    });
  }
};
