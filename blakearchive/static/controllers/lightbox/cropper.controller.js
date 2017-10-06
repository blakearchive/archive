angular.module("blake").controller("CropperController",
function($rootScope, $routeParams, BlakeDataService, $scope, $timeout,
  lightbox_service,
  Fabric,
  FabricCanvas,
  FabricConstants
){
    // use the fabric canvas service to get the active object...
    $scope.cropper;
    $scope.imageToCrop; // url of image to crop
    $scope.imageToCropCaption;

    lightbox_service.getImageToCrop().then(function(imageToCrop){
      $scope.imageToCrop = imageToCrop.url;
      $scope.imageToCropCaption = imageToCrop.fullCaption;
      //console.log("=>imageToCrop url is fetched from db!")
    });

    // bootstrap cropperjs to the image element...
    // which must be done after the image has loaded...
    $scope.init = function(){
      console.log("=>init started!");

      $scope.cropper = new Cropper($scope.imageElement, {
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
      console.log("=>init done!");
    }

    $('#lb-crop-btn').on('click',function(){
      // lightbox should listen for this value to change...
      //window.localStorage.setItem('lbox-cropped-image',$scope.cropper.getCroppedCanvas().toDataURL());
      var croppedImage = {};
      croppedImage.id = 1;
      croppedImage.fullCaption = $scope.imageToCropCaption;
      croppedImage.url =  $scope.cropper.getCroppedCanvas().toDataURL();

      // the lightbox needs to be notified of this....
      lightbox_service.setCroppedImage(croppedImage);

    });

    // new Cropper is not available even on doc ready?!!!
    $(document).ready(function(){
      //console.log("== document is ready!");
      $scope.imageElement = document.getElementById('image');

      // when the page is loaded... wait for the image element to load
      // prior to bootstrapping the cropper!
      $('#image').on("load",(function(){
        //console.log("jquery detected image was loaded!")
        $scope.init();
      }));;
    });
});
