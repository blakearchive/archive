angular.module("blake").controller("BlakeMenuController", function($rootScope){
    let vm = this;
    vm.rs = $rootScope;
});

angular.module("blake").directive('blakeMenu', function(){
    return {
        restrict: 'E',
        template: require('html-loader!./template.html'),
        controller: "BlakeMenuController",
        controllerAs: "bm"
    }
});