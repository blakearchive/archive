(function(){

    var controller = function(){
        var vm = this;
    }

    var editorNotes = function(){
        return {
            restrict: 'EA',
            templateUrl: '/blake/static/directives/editor-notes/editorNotes.html',
            controller: controller,
            scope: {
                object: '=object',
            },
            controllerAs: 'noteCtrl',
            bindToController: true
        };
    }

    angular.module('blake').directive('editorNotes', editorNotes);

}());