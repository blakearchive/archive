(function(){

    var controller = function($scope,$sessionStorage,$modal){
        var vm = this;

        vm.$storage = $sessionStorage;

        vm.userestrictOpen = function(copy){
            var header = copy.header ? copy.header.userestrict['#text'] : copy.selectedObject.header.userestrict['#text'];
            var template = '<div class="modal-header">'
                +'<button type="button" class="close" ng-click="close()" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
                +'<h4 class="modal-title">Use Restriction</h4>'
                +'</div>'
                +'<div class="modal-body">'
                +'<div>'+header+'</div>'
                +'</div>';

            var useRestrictionModalInstance = $modal.open({
                template: template,
                controller: 'ModalController',
                size: 'lg'
            });
        }

        vm.getOvpTitle = function(){
            if(angular.isDefined(vm.copy)){
                if(vm.copy.virtual == true){
                    return vm.copy.selectedObject.title;
                } else {
                    var copyPhrase = vm.copy.archive_copy_id == null ? '' : ', Copy '+vm.copy.archive_copy_id;
                    return vm.copy.header.filedesc.titlestmt.title['@reg']+copyPhrase;
                }
            }
        }

        vm.getPreviousObject = function(){
            if(angular.isDefined(vm.copy.objectsInCopy)){
                for (var i = vm.copy.objectsInCopy.length; i--;) {
                    if (vm.copy.objectsInCopy[i].object_id == vm.copy.selectedObject.object_id) {
                        // Extra code here to make the list circular
                        if (i - 1 < 0) {
                            return vm.copy.objectsInCopy[vm.copy.objectsInCopy.length - 1];
                        } else {
                            return vm.copy.objectsInCopy[i - 1];
                        }
                    }
                }
            }
        }

        vm.getNextObject = function(){
            if(angular.isDefined(vm.copy.objectsInCopy)) {
                for (var i = vm.copy.objectsInCopy.length; i--;) {
                    if (vm.copy.objectsInCopy[i].object_id == vm.copy.selectedObject.object_id) {
                        // Extra code here to make the list circular
                        if (i + 1 >= vm.copy.objectsInCopy.length) {
                            return vm.copy.objectsInCopy[0];
                        } else {
                            return vm.copy.objectsInCopy[i + 1];
                        }
                    }
                }
            }
        };

    }

    controller.$inject = ['$scope', '$sessionStorage', '$modal'];

    var objectViewer = function(){
        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/object-viewer/objectViewer.html',
            controller: controller,
            scope: {
                copy: '=copy',
                work: '=work',
                changeObject: '&',
                resetCompare: '&'
            },
            controllerAs: 'viewer',
            bindToController: true
        };
    }

    angular.module('blake').directive("objectViewer", objectViewer);

}());