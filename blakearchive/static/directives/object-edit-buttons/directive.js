angular.module("blake").controller("ObjectEditButtonsController", function ($rootScope, $window, $cookies, $modal, BlakeDataService, CartStorageService,imageManipulation) {
    let vm = this;
    vm.bds = BlakeDataService;
    vm.rs = $rootScope;
    var cartItems = CartStorageService.cartItems;

    vm.trueSizeOpen = function(object){
        if(!angular.isDefined($cookies.getObject('clientPpi'))){
            $modal.open({
                template: '<client-ppi object="{{object}}"></client-ppi>',
                controller: 'ModalController',
                size: 'lg'
            });
        } else {
            $window.open('/new-window/truesize/'+vm.bds.copy.bad_id+'?descId='+object.desc_id, '_blank', 'width=800, height=600');
        }
    };

    vm.rotate = function(){
        imageManipulation.rotate();
    };

    vm.zoom = function(){
        $rootScope.zoom = !$rootScope.zoom;
    };

    vm.toggleTranscription = function(){
        if($rootScope.view.scope == 'image') {
            $rootScope.view.scope = 'both';
        }
        else {
            $rootScope.view.scope = 'image';
        }
    };

    vm.toggleSupplemental = function(){
        $rootScope.supplemental = !$rootScope.supplemental;
    };

    // add object to the cart... possible error if not an image!
    vm.addToLightBox = function(){
      // TODO: pass a map, with title and caption as well as the image url
      CartStorageService.insert(vm.bds.object.dbi+".300.jpg");
    	//$scope.$broadcast('copyCtrl::addToLightBox',CartStorageService.count());
    }
});

angular.module("blake").directive("objectEditButtons", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "ObjectEditButtonsController",
        bindToController: true,
        replace: true,
        controllerAs: "oeb"
    }
});
