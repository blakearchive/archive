angular.module("blake").controller("CopyController", function ($scope,$routeParams,$rootScope,$window,$modal,$cookies,CartStorageService,BlakeDataService,imageManipulation,CompareObjectsFactory) {
    var vm = this;

    $rootScope.worksNavState = false;
    $rootScope.showWorkTitle = 'copy';
    $rootScope.showOverlay = false;
    $rootScope.zoom = false;
    $rootScope.supplemental = false;
    $rootScope.help = 'copy';
    $rootScope.dpivalue = '100';
    vm.bds = BlakeDataService;
    vm.cof = CompareObjectsFactory;
    
    var cartItems = CartStorageService.cartItems;
    
    if(!angular.isDefined($rootScope.persistentmode)){
        $rootScope.persistentmode = 'gallery';
    }

    BlakeDataService.setSelectedCopy($routeParams.copyId, $routeParams.descId).then(function(){
        vm.cof.resetComparisonObjects();
        $rootScope.view.mode = 'object';
        $rootScope.view.scope = 'image';
    })

    /*
     * Toolbar manipulation
     */
    vm.showTools = true;

    vm.toggleTray = function(){
        $rootScope.worksNavState = false;
        vm.trayOpen = !vm.trayOpen;
    }

    vm.toggleTools = function(){
        vm.showTools = !vm.showTools;
        $scope.$broadcast('copyCtrl::toggleTools',vm.showTools);
    }

    /*
     * OVP Toolbar
     */
    vm.getObjectToTransform = function(){

        var object = {};

        if($rootScope.view.mode == 'object'){
            object =  vm.bds.object;
        }
        if($rootScope.view.mode == 'compare'){
            object = vm.cof.main;
        }

        return object;
    }

    vm.trueSizeOpen = function(object){
        if(!angular.isDefined($cookies.getObject('clientPpi'))){
            var clientDpiModalInstance = $modal.open({
                template: '<client-ppi object="{{object}}"></client-ppi>',
                controller: 'ModalController',
                size: 'lg'
            });
        } else {
            $window.open('/new-window/truesize/'+vm.bds.copy.bad_id+'?descId='+object.desc_id, '_blank', 'width=800, height=600');
        }
    }

    $scope.$on('clientPpi::savedPpi',function(){
        $window.open('/new-window/truesize/'+vm.bds.copy.bad_id+'?descId='+vm.bds.object.desc_id, '_blank', 'width=800, height=600');
    });

    $scope.$on('change::selectedObject',function(){
        imageManipulation.reset();
    });

    vm.rotate = function(){
        imageManipulation.rotate();
    }

    vm.zoom = function(){
        $rootScope.zoom = !$rootScope.zoom;
    }

    vm.toggleTranscription = function(){
        if($rootScope.view.scope == 'image') {
            $rootScope.view.scope = 'both';
        }
        else {
            $rootScope.view.scope = 'image';
        }
    }

    vm.toggleSupplemental = function(){
        $rootScope.supplemental = !$rootScope.supplemental;
    }
    
    //TODO: cleanup logging statements.
    vm.addToLightBox = function(){
    	console.log("adding: "+$routeParams.descId);
    	CartStorageService.insert($routeParams.descId);
    	$scope.$broadcast('copyCtrl::addToLightBox',CartStorageService.count());
    	console.log(CartStorageService.get());
    }
});