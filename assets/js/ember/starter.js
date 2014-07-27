
define('starter',['we','we-cs'], function (we) {
  // uses domReady for start wejs
  require(['domReady!'], function () {
    we.bootstrap(function(){
      console.warn('we is UP');
    });
  });

});
