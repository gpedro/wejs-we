
define(['we','ember'], function (we) {

  App.GroupsIndexsController = Ember.ArrayController.extend({
    actions:{
      createGroup: function(){
        console.warn('create group');
      }
    }
  });

});