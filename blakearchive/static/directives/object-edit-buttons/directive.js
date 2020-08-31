angular.module("blake").controller("ObjectEditButtonsController", function ($rootScope, $window, $cookies, $modal, worktitleService, BlakeDataService, lightbox_service,imageManipulation) {
    let vm = this;
    vm.bds = BlakeDataService;
    vm.wts = worktitleService;
    vm.rs = $rootScope;
    //var cartItems = CartStorageService.cartItems;
    console.log(vm.bds.object);
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
    // the cart is an array in local storage.  each item in the array will...
    // todo: be a map s.t. {imgUrl:url,title:title, caption:caption}
    vm.addToLightBox = function(){
      //console.log("===> adding: "+JSON.stringify(vm.bds.object));
      var item = {};
      item.url = "/images/"+vm.bds.object.dbi+".300.jpg";
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
