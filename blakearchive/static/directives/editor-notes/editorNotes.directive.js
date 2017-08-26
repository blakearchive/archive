angular.module('blake').controller("EditorNotesController", function($routeParams) {
    var vm = this;
    //console.log(vm.object.object_note_images);
    vm.objectNotes = function () {
        if (angular.isDefined(vm.object) && angular.isDefined(vm.object.notes)) {
            return vm.object.notes.filter(function (o) {
                    return o.type == "desc"
                }).length > 0
        }
    }
    vm.objectNoteImages = function () {
        if (angular.isDefined(vm.object) && angular.isDefined(vm.object.object_note_images) && $rootScope.doneSettingCopy) {
            return vm.object.object_note_images.filter(function (o) {
                    return o.type == "text"
                }).length > 0
        }
    }
    vm.textNotes = function () {
        if (angular.isDefined(vm.object) && angular.isDefined(vm.object.notes)) {
            return vm.object.notes.filter(function (o) {
                    return o.type == "text"
                }).length > 0
        }
    }
});

angular.module('blake').directive('editorNotes', function(){
    return {
        restrict: 'EA',
        template: require('html-loader!./editorNotes.html'),
        controller: "EditorNotesController",
        scope: {
            object: '=object',
            highlight: '@highlight'
        },
        controllerAs: 'noteCtrl',
        bindToController: true
    };
});


