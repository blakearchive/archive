(function(){

    var controller = function($routeParams){
        var vm = this;

        vm.objectNotes = function(){
            if(angular.isDefined(vm.object) && angular.isDefined(vm.object.notes)){
                return vm.object.notes.filter(function(o){ return o.type == "desc"}).length > 0
            }
        }
        vm.textNotes = function(){
            if(angular.isDefined(vm.object) && angular.isDefined(vm.object.notes)){
                return vm.object.notes.filter(function(o){ return o.type == "text"}).length > 0
            }
        }
    }

    controller.$inject = ['$routeParams'];

    var editorNotes = function(){
        return {
            restrict: 'EA',
            templateUrl: '/static/directives/editor-notes/editorNotes.html',
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