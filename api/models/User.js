/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

// bcrypt for password encrypt
var bcrypt = require('bcrypt'),
SALT_WORK_FACTOR = 10;


module.exports = {
  schema: true,
  attributes: {

    username: {
      type: 'string'
    },

    email: {
      type: 'email', // Email type will get validated by the ORM
      required: true,
      unique: true
    },

    password: {
      type: 'string'
    },

    displayName: {
      type: 'string'
    },

    birthDate: 'date',

    image: {
      type: 'string'
    },

    avatarId: {
      type: 'string'
    },

    avatar: {
      model: 'images'
    },

    active: {
      type: 'boolean',
      defaultsTo: false
    },

    isAdmin: {
      type: 'boolean',
      defaultsTo: false
    },

    isModerator: {
      type: 'boolean',
      defaultsTo: false
    },

    comments: {
      collection: 'comment',
      via: 'creator'
    },
    language: {
      type: 'string',
      defaultsTo: 'en-us',
      maxLength: 6
    },

    // comment parent, to replay one specific comment
    posts: {
      collection: 'post',
      via: 'creator'
    },

    // Override toJSON instance method
    // to remove password value
    toJSON: function() {

      // remove password
      var obj = this.toObject();

      if(!obj.name){
        obj.name = obj.username;
      }

      delete obj.password;

      // set default objectType
      obj.objectType = "person";

      return obj;
    },

    // Password functions
    setPassword: function (password, done) {
        var _this = this;
        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) return done(err);

            // hash the password along with our new salt
            bcrypt.hash(password, salt, function(err, crypted) {
                if(err) return next(err);

                _this.cryptedPassword = crypted;
                done();
            });
        });
    },

    verifyPassword: function (password) {
        var isMatch = bcrypt.compareSync(password, this.password);
        return isMatch;
    },

    changePassword: function(user, oldPassword, newPassword, next){
      user.updateAttribute( 'password', newPassword , function (err) {
        console.log('travo');
        if (!err) {
            next();
        } else {
            next(err);
        }
      });
    },
  },

  // Lifecycle Callbacks
  beforeCreate: function(user, next) {

    // Create new user password before create
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);

      // hash the password along with our new salt
      bcrypt.hash(user.password, salt, function(err, crypted) {
        if(err) return next(err);

        user.password = crypted;
        next();
      });
    });

  }
};