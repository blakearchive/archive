angular.module('blake').controller('PreviewController', function (
  $scope,$routeParams,$sce,$rootScope,$window,$modal,$cookies,
  BlakeDataService,imageManipulation,CompareObjectsFactory,$http,lightbox_service,worktitleService) {
    var vm = this;
    var previewId = $routeParams.previewId;
    vm.pId = previewId;
    vm.images = [];
    vm.showOverlayCopyInfoForPreview = false;
    $rootScope.showWorkTitle = 'work';
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
    var showEditorsNotes = false;
    var imageLoader = true;
    var multi = false;
    vm.wts = worktitleService;
    vm.rs = $rootScope;
    $rootScope.mycontrast = 100;
    $rootScope.mycontrastForMenu = $rootScope.mycontrast + 5;
    //vm.the_exhibit = BlakeDataService.getExhibit(exhibitId);
    vm.options = {
            id: "example",
            toolbar: "toolbar",
            showFullPageControl: false,
            nextButton: "en",
            prefixUrl: "http://openseadragon.github.io/openseadragon/images/",
            tileSources:   {
                type: 'image',
                //url:  'images/previews/but649/BUT649.1.1r.PT.300.cc.jpg'

                url: ''
            },
            collectionRows: 4,
            collectionColumns: 2,
            collectionMode: false,
            collectionTileMargin: 0,
            //sequenceMode: true,
            //showNavigator: true,
            //navigatorHeight:   "20%",
            //navigatorWidth:    "10%",

    };
    vm.options1 = {x:1,y:0,id:"1",toolbar:"toolbar",showFullPageControl: false,nextButton: "en",prefixUrl: "http://openseadragon.github.io/openseadragon/images/",tileSources:{x:1,y:0,},};
    vm.options2 = {x:0,y:0,id:"2",toolbar:"toolbar",showFullPageControl: false,nextButton: "en",prefixUrl: "http://openseadragon.github.io/openseadragon/images/",tileSources:{x:0,y:0,},};
    vm.options3 = {x:1,y:0,id:"3",toolbar:"toolbar",showFullPageControl: false,nextButton: "en",prefixUrl: "http://openseadragon.github.io/openseadragon/images/",tileSources:{},};
    vm.options4 = {x:0,y:0,id:"4",toolbar:"toolbar",showFullPageControl: false,nextButton: "en",prefixUrl: "http://openseadragon.github.io/openseadragon/images/",tileSources:{},};
    vm.options5 = {x:1,y:0,id:"5",toolbar:"toolbar",showFullPageControl: false,nextButton: "en",prefixUrl: "http://openseadragon.github.io/openseadragon/images/",tileSources:{},};
    vm.options6 = {x:0,y:0,id:"6",toolbar:"toolbar",showFullPageControl: false,nextButton: "en",prefixUrl: "http://openseadragon.github.io/openseadragon/images/",tileSources:{},};
    vm.options7 = {x:1,y:0,id:"7",toolbar:"toolbar",showFullPageControl: false,nextButton: "en",prefixUrl: "http://openseadragon.github.io/openseadragon/images/",tileSources:{},};
    vm.options8 = {x:0,y:0,id:"8",toolbar:"toolbar",showFullPageControl: false,nextButton: "en",prefixUrl: "http://openseadragon.github.io/openseadragon/images/",tileSources:{},};
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
    
    vm.bds.setSelectedWork($routeParams.previewId).then(function() {
        vm.bds.setSelectedCopy(vm.bds.workCopies[0].bad_id).then(function(result) {
            //vm.copy = result;
            console.log(vm.bds.copyObjects[0]);
            
            /*vm.bds.getObject($routeParams.descId).then(function(result) {
                vm.object = result;
                console.log(vm.object.dbi)
                vm.options.tileSources.url = 'images/' + vm.object.dbi + '.300.jpg';
                vm.optionsSet = true;
            });*/
            if(vm.bds.copyObjects[0].dbi == 'but770.1.1.pt') {
                vm.multi = true;
                var url = "";
                var tilesources = [];
                for (var i = 1; i < 9; i++) {
                    url = 'images/' + vm.bds.copyObjects[0].dbi + '.0' + i + '.300.dzi';
                    //tilesources.push(url);
                    switch(i) {
                        case 1:
                            vm.options1.tileSources = url;
                            break;
                        case 2:
                            vm.options2.tileSources = url;
                            break;
                        case 3:
                            vm.options3.tileSources = url;
                            break;
                        case 4:
                            vm.options4.tileSources = url;
                            break;
                        case 5:
                            vm.options5.tileSources = url;
                            break;
                        case 6:
                            vm.options6.tileSources = url;
                            break;
                        case 7:
                            vm.options7.tileSources = url;
                            break;
                        case 8:
                            vm.options8.tileSources = url;
                            break;
                    }
                }
                //vm.options.collectionMode = true;
                //vm.options.tileSources = tilesources;
            }
            else {
                vm.multi = false;
                vm.options.tileSources = 'images/' + vm.bds.copyObjects[0].dbi + '.300.dzi';
            }
            vm.optionsSet = true;
            vm.showEditorsNotes = false;
            console.log(vm.optionsSet);
            console.log(vm.multi);

        });
    });

    vm.adjustContrast = function(){

    }

    vm.toggleEditorsNotes = function(){
        if(vm.showEditorsNotes == true) {
            vm.showEditorsNotes = false;
        }
        else {
            vm.showEditorsNotes = true;
        }
    }

    vm.addToLightBox = function(){
      //console.log("===> adding: "+JSON.stringify(vm.bds.object));
      var item = {};
      item.url = "/images/"+vm.bds.copyObjects[0].dbi+".300.jpg";
      item.title = vm.wts.getFullTitle();
      item.caption = vm.wts.getCaptionFromGallery();
      //CartStorageService.insert(item);
      lightbox_service.addToCart(item);

      // updates vm.rs so that cart counter is updated
      lightbox_service.listCartItems().then(function(data){
        vm.rs.cartItems = data;
        //console.log("===== "+JSON.stringify($rootScope.cartItems));
      });

    }
    //vm.descId = vm.bds.workCopies[0]
    //console.log("Exhibit ID: "+exhibitId);
    /*vm.bds.setSelectedCopy(vm.bds.workCopies[0].copy_id).then(function(){
        console.log(vm.bds);
        vm.options.tileSources.url = 'images/' + "BUT649.1.1r.PT.300" + '.300.jpg';
        vm.optionsSet = true;
    });*/
/*
    $rootScope.doneSettingPreview = false;
    vm.bds.setSelectedPreview(previewId).then(function(){
      console.log(vm.bds.preview);
      $rootScope.doneSettingPreview = true;
      
      //vm.scrollTo(1);
    }); 
*/
});
