angular.module("blake").controller("BlakeMenuController", ['$scope','$rootScope','CartStorageService', function($scope,$rootScope,CartStorageService){
    let vm = this;
    vm.rs = $rootScope;
    // tie cartItems to the rootScope rather than scope?
    // pros versus cons... TODO: analyze this! understand it!
    // I suspect that this needs to be outside of the directive in the containing page's
    // controller or on its own dedicated controller...
    $rootScope.cartItems = CartStorageService.cartItems;
}]);

angular.module("blake").directive('blakeMenu', function(){
    return {
        restrict: 'E',
        template: require('html-loader!./template.html'),
        controller: "BlakeMenuController",
        controllerAs: "bm"
    }
});