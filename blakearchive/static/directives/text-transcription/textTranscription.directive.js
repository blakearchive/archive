(function(){

    var controller = function($routeParams){
        var vm = this;

        vm.searchTerm = angular.isDefined($routeParams.searchTerm) ? $routeParams.searchTerm : '';

        vm.getNumber = function(num){
            return new Array(parseInt(num));
        }
    }

    controller.$inject = ['$routeParams'];

    var textTranscription = function(){
        return {
            restrict: 'EA',
            templateUrl: '/blake/static/directives/text-transcription/textTranscription.html',
            controller: controller,
            scope: {
                object: '=object',
            },
            controllerAs: 'textCtrl',
            bindToController: true
        };
    }

    angular.module('blake').directive('textTranscription', textTranscription);

}());