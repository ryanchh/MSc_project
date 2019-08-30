/**
 * Module.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    moduleCode:{
      type: 'string',
      required: true,
      unique: true,
    },

    moduleTitle:{
      type:'string',
      required: true,
    },

    moduleYear:{
      type:'string',
      required: true,
    },

    enrolledByUsers:{
      collection: 'user',
      via: 'enrolledModules',
    },

    courseworks:{
      collection: 'coursework',
      via: 'myModule',
    }
  },

};

