angular.module('blake').controller('PreviewController', function (
  $scope,$routeParams,$sce,$rootScope,$window,$modal,$cookies,
  BlakeDataService,imageManipulation,CompareObjectsFactory,$http) {
    var vm = this;
    var previewId = $routeParams.previewId;
    vm.pId = previewId;
    vm.images = [];
    $rootScope.showWorkTitle = 'preview';
    $rootScope.help = 'preview';
    $rootScope.worksNavState = false;
    //var currentIndex = 0;
    //$rootScope.showArticle = true;
    $rootScope.activeapparatus = 'none';
    //$rootScope.borderleftwidth = '13px';
    //$rootScope.thumbsliderwidth = '66%';
    //$rootScope.thumbslidermarginleft = '13px';
    $rootScope.buttonsleft = '74%';
    //$rootScope.galleriesMarginLeft = '33%';
    $rootScope.zoom = false;

    //vm.the_exhibit = BlakeDataService.getExhibit(exhibitId);
    vm.options = {
            id: "example",
            prefixUrl: "http://openseadragon.github.io/openseadragon/images/",
            tileSources:   {
                type: 'image',
                url:  ''
            }
    };

    vm.zoom = function() {
        $rootScope.zoom = !$rootScope.zoom;
        ////console.log($rootScope.zoom);
    };

    BlakeDataService.getImagesForPreview(previewId).then(function(result){
      vm.images = result;
      vm.options.tileSources.url = 'images/previews/' + vm.pId + '/' + vm.images[0];
      console.log('images/previews/' + vm.pId + '/' + vm.images[0]);
          });)

    vm.bds= BlakeDataService;
    //console.log("Exhibit ID: "+exhibitId);


    $rootScope.doneSettingPreview = false;
    vm.bds.setSelectedPreview(previewId).then(function(){
      //console.log(">>>>>hey, tae, you were wrong!!!!");

      $rootScope.doneSettingPreview = true;
      console.log(vm.bds.preview);
      //vm.scrollTo(1);
    }); 
});
