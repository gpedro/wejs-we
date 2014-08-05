
define(['we','ember'], function (we) {

  App.GroupsCreateController = Ember.ObjectController.extend({
    url: "/api/v1/images/",
    file: null,
    files: {},
    privacityList: [
      {
        label: we.i18n('Public'),
        value:'public'
      },
      {
        label: we.i18n('Restrict'),
        value:'restrict'
      },

      {
        label: we.i18n('Private'),
        value:'private'
      },
      {
        label: we.i18n('Hidden'),
        value:'hidden'
      }
    ],
    filesDidChange: function() {
      this.set('file',this.get('files')[0]);
    }.observes('files'),
    actions:{
      selectFile: function(){

        var self = this;
        var uploadUrl = this.get('url');
        var file = this.get('file');

        var uploader = Ember.Uploader.create({
          url: uploadUrl,
          type: 'POST',
          paramName: 'images'
        });

        if (!Ember.isEmpty(file)) {
          self.set('isLoading',true);
          var promisseUpload = uploader.upload(file);

          promisseUpload.then(function(data) {
            
            self.set('salvedImage',data.images[0]);
            self.set('imageSelected', true);
            self.set('isLoading',false);

          }, function(error) {
            // Handle failure
            console.error('error on upload avatar', error);
          });
        }
      },
      cropAndSave: function(){
        var self = this;
        var cords = this.get('cropImageData');
        var imageId = this.get('salvedImage.id');

        // cortando a imagem
        Ember.$.ajax({
          type: 'get',
          url: '/api/v1/images-crop/'+ imageId,
          data: cords,
          contentType: 'application/json'
        }).done(function(newImage){
          self.get('store').push('image', newImage.image);
          self.send('createGroup');
        }).fail(function(e){
          console.error('Error on image crop',e);
        });
      },
      createGroup: function(){
        
        var _this = this;
        var group = this.get('group');

        group.creator = this.get('store').getById('user', App.currentUser.get('id'));
        group.logo = this.get('store').getById('image', this.get('salvedImage.id'));
        
        var newGroup = this.store.createRecord('group',group);
        newGroup.save().then(function(g){
          _this.transitionToRoute('group',g.id);
        });

      },
      /*
      submit: function(){
        /*
        var self = this;
        var uploadUrl = this.get('url');
        var file = this.get('file');        

        var uploader = Ember.Uploader.create({
          url: uploadUrl,
          type: 'POST',
          paramName: 'images'
        });

        if (!Ember.isEmpty(file)) {

          self.set('isLoading',true);

          var promisseUpload = uploader.upload(file);
          promisseUpload.then(function(data) {
            self.set('salvedImage',data.images[0]);
            self.set('imageSelected', true);

            self.set('isLoading',false);
          }, function(error) {
            // Handle failure
            console.error('error on upload avatar', error);
          });
        }
        /*
          group.set(avatar)
         */
        /*
        var group = this.get('group');
        var _this = this;
        var files = this.get('files');

        console.warn("this: ", files);

        group.creator = this.get('store').getById('user', App.currentUser.get('id'));

        var newGroup = this.store.createRecord('group',group);
        newGroup.save().then(function(g){
          _this.transitionToRoute('group',g.id);
        });
        
      }*/
    }
  });

});