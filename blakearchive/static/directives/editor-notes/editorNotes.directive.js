(function(){

    var controller = function($routeParams){
        var vm = this;

        //vm.searchTerm = angular.isDefined($routeParams.searchTerm) ? $routeParams.searchTerm : '';
    }

    controller.$inject = ['$routeParams'];

    var editorNotes = function(){
        return {
            restrict: 'EA',
            templateUrl: '/blake/static/directives/editor-notes/editorNotes.html',
            controller: controller,
            scope: {
                object: '=object',
                highlight: '@highlight'
            },
            controllerAs: 'noteCtrl',
            bindToController: true
        };
    }

    angular.module('blake').directive('editorNotes', editorNotes);

}());