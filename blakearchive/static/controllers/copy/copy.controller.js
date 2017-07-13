angular.module("blake").controller("CopyController", function ($scope,$routeParams,$rootScope,$window,$modal,$cookies,BlakeDataService,imageManipulation,CompareObjectsFactory) {
    let vm = this;

    $rootScope.worksNavState = false;
    $rootScope.showWorkTitle = 'copy';
    $rootScope.showOverlay = false;
    $rootScope.zoom = false;
    $rootScope.supplemental = false;
    $rootScope.help = 'copy';
    $rootScope.dpivalue = '100';
    vm.bds = BlakeDataService;
    vm.cof = CompareObjectsFactory;
    $rootScope.doneSettingCopy = false;

    if(!angular.isDefined($rootScope.persistentmode)){
        $rootScope.persistentmode = 'gallery';
    }

    BlakeDataService.setSelectedCopy($routeParams.copyId, $routeParams.descId).then(function(){
        vm.cof.resetComparisonObjects();
        $rootScope.view.mode = 'object';
        $rootScope.view.scope = 'image';
        $rootScope.doneSettingCopy = true;
    });

    /*
     * Toolbar manipulation
     */
    vm.showTools = true;

    vm.toggleTray = function(){
        $rootScope.worksNavState = false;
        vm.trayOpen = !vm.trayOpen;
    };

    vm.toggleTools = function(){
        vm.showTools = !vm.showTools;
        $scope.$broadcast('copyCtrl::toggleTools',vm.showTools);
    };

    /*
     * OVP Toolbar
     */
    vm.getObjectToTransform = function(){

        let object = {};

        if($rootScope.view.mode == 'object'){
            object =  vm.bds.object;
        }
        if($rootScope.view.mode == 'compare'){
            object = vm.cof.main;
        }

        return object;
    };

    $scope.$on('clientPpi::savedPpi',function(){
        if($rootScope.persistentmode != 'reading') {
            $window.open('/new-window/truesize/'+vm.bds.copy.bad_id+'?descId='+vm.bds.object.desc_id, '_blank', 'width=800, height=600');
        }
    });

    $scope.$on('change::selectedObject',function(){
        imageManipulation.reset();
    });
});