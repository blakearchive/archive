angular.module("blake").controller("CropperController",
function($rootScope, $routeParams, BlakeDataService, $scope, $timeout,
  Fabric,
  FabricCanvas,
  FabricConstants
){
    // use the fabric canvas service to get the active object...
    //$scope.imageToCrop = FabricCanvas.getCanvas().getActiveObject().getSrc();
    $scope.cropper;
    $scope.imageToCrop = window.localStorage.getItem("cropper-image-to-crop");
    var image = document.getElementById('image');

    $scope.init = function(){
      $scope.cropper = new Cropper(image, {
        viewMode: 0,
        autoCropArea: .4,
        ratio: 1.0,
        checkOrientation: false,
        dragMode: 'move', /* crop/move/none - double click to switch on the fly*/
        //preview: 'preview', /* element or selector - element will show preview of cropped image*/
        zoom: function(e) {
          // zoom event...
          //console.log("zoomed: "+e.detail.ratio);
          // prevent zooming past 1.0 ratio... i.e.: image's natural size
          if (e.detail.ratio > 1.0){
            $scope.cropper.zoomTo(1.0);
            e.preventDefault();
          }
        }
      });

    }

    $('#lb-crop-btn').on('click',function(){
      //console.log("crop the image to our lightbox!!!");
      // lightbox should listen for this value to change...
      window.localStorage.setItem('lbox-cropped-image',$scope.cropper.getCroppedCanvas().toDataURL());

      // New Method. add the cropped image as an object along with its
      // title and caption.  the lightbox will listen for the change to
      // localstorage and act accordingly....
      // var imageInfo = window.localStorage.getItem('cropper-image-to-crop-info');
      // imageInfo = JSON.parse(imageInfo);
      // imageInfo.url = $scope.cropper.getCroppedCanvas().toDataURL();
      // window.localStorage.setItem('lbox-cropped-image',JSON.stringify(imageInfo));
    });

    // new Cropper is not available even on doc ready?!!!
    $(document).ready(function(){
      $scope.init();
    });
});
