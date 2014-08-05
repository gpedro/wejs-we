
define(['we','ember'], function (we) {

  App.GroupController = Ember.ObjectController.extend({
    actions:{
      createPost: function(){
        console.warn('create');
      },
      deleteItem: function(router){

        var userConfirmation = confirm( we.i18n("Are you sure you want to delete the group?") );
        
        if (userConfirmation === true) {

          var model = this.get('model');
          model.deleteRecord();
          model.save();

          //_this.transitionToRoute('groups');
          //router.transitionTo('groups');
          this.transitionToRoute('groups');          

        }
      }
    }
  });

});