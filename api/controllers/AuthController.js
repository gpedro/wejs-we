// api/controllers/AuthController.js

var passport = require('we-passport').getPassport();
var weSendEmail = require('we-send-email');

module.exports = {

  index: function (req,res)	{
		res.redirect('/auth/register');
	},

	// Signup method GET function
  signupPage: function (req, res) {
    // return index page and let angular.js construct the page
    res.view('home/index');
  },

  // Signup method POST function
  signup: function (req, res, next) {
    var requireAccountActivation = false;
    var user = {};
    user.displayName = req.param("displayName");
    user.username = req.param("username");
    user.email = req.param("email");
    user.password = req.param("password");
    user.language = req.param("language");


    if( !sails.util.isUndefined(sails.config.site) )
      if( !sails.util.isUndefined( sails.config.site.requireAccountActivation ) ){
        requireAccountActivation = sails.config.site.requireAccountActivation;
      }

    // if dont need a account activation email then create a active user
    if(!requireAccountActivation)
      user.active = true;

    var confirmPassword = req.param("confirmPassword");
    var errors;

    errors = validSignup(user, confirmPassword, res);

    if( ! _.isEmpty(errors) ){
      // error on data or confirm password
      return res.send('400',{
        "error": "E_VALIDATION",
        "status": 400,
        "summary": "Validation errors",
        "model": "User",
        "invalidAttributes": errors
      });
    }

    User.findOneByEmail(user.email).exec(function(err, usr){
      if (err) {
          sails.log.error('Error on find user by email.',err);
          return res.send(500, { error: res.i18n("Error") });
      } else if ( usr ) {
        return res.send(400,{
          "error": "E_VALIDATION",
          "status": 400,
          "summary": "The email address is already registered in the system",
          "model": "User",
          "invalidAttributes": {
            "email": [
              {
                "rule": "email",
                "message": "The email address is already registered in the system"
              }
            ]
          }
        });
      } else {
          User.create(user).exec(function(error, newUser) {
            if (error) {

              if(error.ValidationError){
                // wrong email format
                if(error.ValidationError.email){
                  return res.send(400,error);
                }

              }else {
                return res.send(500, {error: res.i18n("DB Error") });
              }
            } else {
              if(requireAccountActivation){
                var options = {};

                EmailService.sendAccontActivationEmail(newUser, req.baseUrl , function(err, responseStatus){
                  if(err) {
                    sails.log.error('Action:Login sendAccontActivationEmail:',err);
                    return res.serverError('Error on send activation email for new user',newUser);
                  }

                  res.send('201',{
                    success: [
                      {
                        status: '201',
                        message: res.i18n('Account created but is need an email validation\n, One email was send to %s with instructions to validate your account', newUser.email)
                      }
                    ]
                  });

                });
              } else {
                req.logIn(newUser, function(err){
                  if(err){
                    sails.log.error('logIn error: ', err);
                    return res.negotiate(err);
                  }

                  res.send('201',newUser);
                });
              }
            }
        });
      }
    });

  },

  logout: function (req, res) {
    req.logout();
    res.redirect('/');
  },

  login: function (req, res, next) {
    var email = req.param("email");
    var password = req.param("password");

    if(!email || !password){
      sails.log.debug("AuthController:login:Password and email is required", password, email);
      return res.send(401,{
        error: [{
            status: '401',
            message: res.i18n('Password and email is required')
          }]
      });
    }

    User.findOneByEmail(email).exec(function(err, usr) {
      if (err) {
        sails.log.error('AuthController:login:Error on get user ', err, email);
        return res.send(500, { error: res.i18n("DB Error") });
      }

      if(!usr){
        sails.log.debug("AuthController:login:User not found", email);
        return res.send(401,{
          error: [{
              status: '401',
              message: res.i18n("User not found")
            }]
          });
      }

      if (!usr.verifyPassword(password)) {
        sails.log.debug("AuthController:login:Wrong Password", email);
        return res.send(401,{ error: [{
            status: '401',
            message: res.i18n("Wrong Password")
          }]
        });
      }

      passport.authenticate('local', function(err, usr, info) {

        if (err){
          return res.serverError(err);
        }
        if (!usr) return res.redirect('/login');

        req.logIn(usr, function(err){
          if(err){
            return res.serverError(err);
          }

          res.send(usr);
          // TODO add suport to oauth tokens
          //res.redirect('/');
        });

      })(req, res, next);
    });
  },

  /**
   * Activate a user account with activation code
   */
  activate: function(req, res){
    console.log('Check token');
    console.log('activate Account');
    user = {};
    user.id = req.param('id');

    token = req.param('token');

    console.log('user.id:', user.id);
    console.log('AuthToken:',token);

    var responseForbiden = function (){
		  return res.send(403, {
        responseMessage: {
          errors: [
            {
              type: 'authentication',
              message: res.i18n("Forbiden")
            }
          ]
        }
      });
    };

    var validAuthTokenRespose = function (err, result, authToken){
      if (err) {
        return res.send(500, { error: res.i18n("Error") });
      }

      // token is invalid
      if(!result){
        return responseForbiden();
      }

	    // token is valid then get user form db
	    User.findOneById(user.id).exec(function(err, usr) {
	      if (err) {
	        return res.send(500, { error: res.i18n("DB Error") });
	      }

	      // user found
	      if ( usr ) {

					// activate user and login
					usr.active = true;
					usr.save(function(err){
			      if (err) {
			        return res.send(500, { error: res.i18n("DB Error") });
			      }

					  // destroy auth token after use
					  authToken.destroy(function(err) {
				      if (err) {
				        return res.send(500, { error: res.i18n("DB Error") });
				      }

              req.logIn(usr, function(err){
                if(err){
                  sails.log.error('logIn error:', err);
                  return res.negotiate(err);
                }

						    return res.format({
						     'text/html': function(){
						        // TODO add a activation message
						        //res.view( 'home/index.ejs');
						        //res.redirect('/user/:id/activation-success');
						        res.redirect('/');
						     },

						     'application/json': function(){
						        console.log('send login result here ....');
						        res.send(200, usr);
						     }
						    });
              });

					  });

					});

	      } else {
	        // user not found
	        return responseForbiden();
	      }

	    });


    };

		AuthToken.validAuthToken(user.id, token, validAuthTokenRespose);

  },

  SendPasswordResetToken: function(req, res){
    console.log('TODO GetloginResetToken');


  },

  forgotPasswordPage: function(req, res){
    // return home page and let emeberJs mount the page
    res.view("home/index.ejs");
  },

  forgotPassword: function(req, res){
   var email = req.param('email');

    if(!email){
      return res.badRequest('Email is required to request a password reset token.');
    }

    User.findOneByEmail(email)
    .exec(function(error, user){
      if(error){
        sails.log.error(error);
        return res.serverError(error);
      }

      if(!user){
        return res.send(404,{
          errors: [{
            status: 'error',
            type: 'not_found',
            message: res.i18n('User not found for this email')
          }]
        });
      }

      AuthToken.create( {user_id: user.id} ).exec(function(error, token) {
        if(error){
          sails.log.error(error);
          return res.serverError(error);
        }

        if(token){
          var appName;
          if(sails.config.appName){
            appName = sails.config.appName;
          }else{
            appName = 'We.js';
          }

          var options = {
            email: user.email,
            subject: appName + ' - ' + res.i18n('Reset password')
          };

          user = user.toJSON();

          var templateVariables = {
            user: {
              name: user.name
            },
            site: {
              name: appName,
              slogan: 'MIMI one slogan here',
              url: req.baseUrl
            },
            resetPasswordUrl: req.baseUrl + '/auth/'+ user.id +'/reset-password/' + token.token
          };

          weSendEmail.sendEmail(options, 'AuthResetPasswordEmail', templateVariables, function(err, responseStatus){
            if(err){
              sails.log.error(err);
            }

            // success send {status: 200} for user
            res.send({
              success: [{
                type: 'email_send',
                status: 'success',
                message: res.i18n('Forgot password email send')
              }]
            });
          });
        }

      });
    });
  },

  consumeForgotPasswordToken: function(req, res){
    var uid = req.param('uid');
    var token = req.param('token');

    if(!uid || !token){
      sails.log.info('consumeForgotPasswordToken: Uid of token not found', uid, token);
      return res.badRequest();
    }

    loadUserAndAuthToken(uid, token, function(error, user, authToken){
      if(error){
        return res.negotiate(error);
      }

      if(!user || !authToken){
        sails.log.warn('consumeForgotPasswordToken: TODO add a invalid token page and response');
        return res.redirect('/auth/forgot-password');
      }

      // login the user
      req.logIn(user, function(err){
        if(err){
          sails.log.error('consumeForgotPasswordToken:logIn error', err);
          return res.negotiate(err);
        }

        // consumes the token
        authToken.isValid = false;
        authToken.save();

        if(req.wantsJSON){
          res.send('200',user);
        }else{
          res.redirect('/auth/reset-password');
        }

      });
    });
  },


  resetPasswordPage: function(req, res){
    res.view('home/index');
  },

  resetPassword: function(req, res){

  }

};

/**
 * Load user and auth token
 * @param  {string}   uid      user id
 * @param  {string}   token    user token
 * @param  {Function} callback    callback(error, user, authToken)
 */
var loadUserAndAuthToken = function(uid, token, callback){
  User.findOneById(uid)
  .exec(function(error, user){
    if(error){
      sails.log.error('consumeForgotPasswordToken: Error on get user', user, token);
      return callback(error, null, null);
    }

    if(user){
      AuthToken
      .findOneByToken(token)
      .where({
        user_id: user.id,
        token: token,
        isValid: true
      })
      .exec(function(error, authToken){
        if(error){
          sails.log.error('consumeForgotPasswordToken: Error on get token', user, token);
          return callback(error, null, null);
        }

        if(authToken){
          return callback(null, user, authToken);
        }else{
          return callback(null, user, null);
        }

      });

    }else{
      // user not found
      return callback(null, null, null);
    }

  });
};

var validSignup = function(user, confirmPassword, res){
  var errors = {};

  if(!user.email){
    errors.email = [];
    errors.email.push({
      type: 'validation',
      field: 'email',
      rule: 'required',
      message: res.i18n("Field <strong>email</strong> is required")
    });
  }

  if(!user.password){
    errors.password = [];
    errors.password.push({
      type: 'validation',
      field: 'password',
      rule: 'required',
      message: res.i18n("Field <strong>password</strong> is required")
    });
  }

  if(!confirmPassword){
    errors.confirmPassword = [];
    errors.confirmPassword.push({
      type: 'validation',
      field: 'confirmPassword',
      rule: 'required',
      message: res.i18n("Field <strong>Confirm new password</strong> is required")
    });
  }

  if(confirmPassword != user.password){
    if(!errors.password) errors.password = [];
    errors.password.push({
      type: 'validation',
      field: 'password',
      rule: 'required',
      message: res.i18n("<strong>New password</strong> and <strong>Confirm new password</strong> are different")
    });
  }

  return errors;
};
