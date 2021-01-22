angular.module('blake').controller('PreviewController', function (
  $scope,$routeParams,$sce,$rootScope,$window,$modal,$cookies,
  BlakeDataService,imageManipulation,CompareObjectsFactory,$http) {
    var vm = this;
    var previewId = $routeParams.previewId;
    vm.pId = previewId;
    vm.images = [];
    vm.showOverlayCopyInfo = false;
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
    var optionsSet = false;

    //vm.the_exhibit = BlakeDataService.getExhibit(exhibitId);
    vm.options = {
            id:            "example",
                prefixUrl:     "http://openseadragon.github.io/openseadragon/images/",
                tileSources:   {
                    type: 'image',
                    //url:  'images/previews/but649/BUT649.1.1r.PT.300.cc.jpg'
                    url: ''
                }

    };
/*
    vm.zoom = function() {
        $rootScope.zoom = !$rootScope.zoom;
        ////console.log($rootScope.zoom);
    };

    BlakeDataService.getImagesForPreview(previewId).then(function(result){
          vm.images = result;
          console.log(vm.images);
        vm.options.tileSources.url = 'images/previews/' + vm.pId + '/' + vm.images[0].dbi + '.jpg';
        vm.optionsSet = true;
          //vm.options.tileSources.url = 'images/previews/' + vm.pId + '/' + vm.images[0].dbi;
    });
*/
    vm.bds= BlakeDataService;
    vm.bds.setSelectedWork($routeParams.previewId);
    //vm.descId = vm.bds.workCopies[0]
    //console.log("Exhibit ID: "+exhibitId);
    vm.bds.setSelectedCopy(vm.bds.workCopies[0].copy_id).then(function(){
        console.log(vm.bds);
        vm.options.tileSources.url = 'images/' + "BUT649.1.1r.PT.300" + '.300.jpg';
        vm.optionsSet = true;
    });
/*
    $rootScope.doneSettingPreview = false;
    vm.bds.setSelectedPreview(previewId).then(function(){
      console.log(vm.bds.preview);
      $rootScope.doneSettingPreview = true;
      
      //vm.scrollTo(1);
    }); 
*/
});
