(function(){

    /** @ngInject */
    var controller = function($rootScope,$modal,$templateCache,BlakeDataService){
        var vm = this;

        vm.bds = BlakeDataService;

        vm.imageTagsOpen = function(){

            var imageTagsModalInstance = $modal.open({
                templateUrl: '/static/html/newsearch.html',
                controller: 'ModalController',
                size: 'lg'
            });
        }

    }

    var imageTags = function(){
        return {
            restrict: 'E',
            templateUrl: '/static/directives/image-tags/imageTags.html',
            controller: controller,
            controllerAs: 'imagetags',
            bindToController: true
        };
    }

    angular.module('blake').directive("imageTags", imageTags);

}());