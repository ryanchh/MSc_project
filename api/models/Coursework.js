/**
 * Coursework.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    courseworkTitle:{
      type: 'string',
      required: true
    },

    programLanguage:{
      type: 'string',
      required: true
    },

    coureseworkDetail:{
      type: 'text',
      required: true
    },

    deadline:{
      type: 'ref',
      columnType: 'datetime',
      required: true
    },

    script:{
      type: 'string',
    },

    myModule:{
      model: 'module',
    },

  },

};

