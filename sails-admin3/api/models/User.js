/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
    },
    password: {
      type: 'string',
      required: true,
    },
    role: {
      type: 'number',
      required: true,
    },
    enterpriseId:{
      type: 'string',
      required: true,
    },
    token: {
      type: 'string',
      defaultsTo: '',
    }
  },

};

