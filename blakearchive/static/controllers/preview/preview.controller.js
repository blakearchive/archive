angular.module('blake').controller('PreviewController', function (
  $scope,$routeParams,$sce,$rootScope,$window,$modal,$cookies,
  BlakeDataService,imageManipulation,CompareObjectsFactory,$http,OpenSeadragon) {
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

    var viewer = OpenSeadragon({
            element: this.viewer.nativeElement,
            prefixUrl: "/images/previews/",
            tileSources:   {
                type: 'image',
                url:  '{{previewCtrl.pId}}/{{ i.dbi }}.cc.jpg'
            }
    });

    //vm.the_exhibit = BlakeDataService.getExhibit(exhibitId);

    vm.zoom = function() {
        $rootScope.zoom = !$rootScope.zoom;
        ////console.log($rootScope.zoom);
    };

    BlakeDataService.getImagesForPreview(previewId).then(function(result){
      vm.images = result;
      $scope.seadragon.titleSources.url = previewId + vm.images[0].dbi + "cc.jpg";
    });

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
