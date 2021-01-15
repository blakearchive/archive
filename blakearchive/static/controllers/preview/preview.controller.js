angular.module('blake').controller('PreviewController', function (
  $scope,$routeParams,$sce,$rootScope,$window,$modal,$cookies,
  BlakeDataService,imageManipulation,CompareObjectsFactory,$http) {
    var vm = this;
    var previewId = $routeParams.previewId;
    vm.pId = previewId;
    vm.image = '';
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

    vm.zoom = function() {
        $rootScope.zoom = !$rootScope.zoom;
        ////console.log($rootScope.zoom);
    };

    BlakeDataService.getImageForPreview(previewId).then(function(result){
      vm.image = result;
    });

    vm.bds= BlakeDataService;
/*    console.log("Exhibit ID: "+exhibitId);


    $rootScope.doneSettingExhibit = false;
    vm.bds.setSelectedExhibit(exhibitId).then(function(){
      //console.log(">>>>>hey, tae, you were wrong!!!!");
      $rootScope.doneSettingExhibit = true;
      console.log(vm.bds.exhibit);
      vm.scrollTo(1);
    }); */
});
