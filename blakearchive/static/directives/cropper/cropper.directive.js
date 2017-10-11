/* DELETE ME, no longer used...
  or possibly, refacter cropper controller into this
  in either case, the controller code below is out of date!!!
*/
angular.module("blake").controller("CropperControllerEx",
function($rootScope, $modal, BlakeDataService, $scope,
  Fabric,
  FabricCanvas,
  FabricConstants,
  Cropper
){
    // use the fabric canvas service to get the active object...
    $scope.imageToCrop = FabricCanvas.getCanvas().getActiveObject().getSrc();

    var data;
    $scope.cropper = {};

    $scope.options = {
      maximize: true,
      aspectRatio: 2 / 1,
      crop: function(dataNew) {
        data = dataNew;
      }
    };

    $scope.showEvent = 'show';
    $scope.hideEvent = 'hide';
    function showCropper() { $scope.$broadcast($scope.showEvent); }
    function hideCropper() { $scope.$broadcast($scope.hideEvent); }
});

angular.module('blake').directive("cropper", function(){
    return {
        restrict: 'E',
        transclude: true,
        template: require('html-loader!./cropper.html'),
        controller: "CropperController",
        controllerAs: 'cc',
        bindToController: true
    };
});
