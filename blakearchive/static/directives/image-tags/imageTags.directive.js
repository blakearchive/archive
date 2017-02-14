angular.module("blake").controller("ImageTagsController", function($rootScope, $modal, $templateCache, BlakeDataService){
    var vm = this;

    vm.bds = BlakeDataService;

    vm.imageTagsOpen = function(){
        var imageTagsModalInstance = $modal.open({
            templateUrl: '/static/html/newsearch.html',
            controller: 'ModalController',
            size: 'lg'
        });
    }
});

angular.module('blake').directive("imageTags", function(){
    return {
        restrict: 'E',
        template: require('html-loader!./imageTags.html'),
        controller: "ImageTagsController",
        controllerAs: 'imagetags',
        bindToController: true
    };
});
