(function(){

    var controller = function($routeParams, $modal){
        var vm = this;

        //vm.searchTerm = angular.isDefined($routeParams.searchTerm) ? $routeParams.searchTerm : vm.searchTerm;

        vm.colorKeyOpen = function(size){
            var colorKeyModalInstance = $modal.open({
                templateUrl: '/blake/static/controllers/modal/colorKeyModal.html',
                controller: 'ModalController',
                size: size
            });
        }

        vm.getNumber = function(num){
            return new Array(parseInt(num));
        }
    }

    controller.$inject = ['$routeParams','$modal'];

    var textTranscription = function(){
        return {
            restrict: 'EA',
            templateUrl: '/blake/static/directives/text-transcription/textTranscription.html',
            controller: controller,
            scope: {
                object: '=object',
                highlight: '@highlight'
            },
            controllerAs: 'textCtrl',
            bindToController: true
        };
    }

    angular.module('blake').directive('textTranscription', textTranscription);

}());