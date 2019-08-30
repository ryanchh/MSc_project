/**
 * Attempt.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    repository:{
      type: 'string',
      required: true
    },

    grade:{
      type: 'number'
    },

    feedback: {
      type: 'text'
    },

    attemptCount:{
      type: 'number'
    },

    student:{
      model: 'User'
    },

    coursework:{
      model: 'Coursework'
    },

  },

};

