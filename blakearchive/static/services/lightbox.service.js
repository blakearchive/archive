/* TODO: this is not used... remove it.
manages lightbox state: are we in crop mode or not.
provide state transition functions for attachment to control buttons
*/
angular.module('blake')
  .factory('lightbox_service',function(){
    // note: this service is not currently being used...
    //
    var svc;
    svc = {
      'isCropMode': false,
      startCropMode: function(){
        this.isCropMode = true;
      }
    }
    return svc;
  });
