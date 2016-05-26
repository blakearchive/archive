(function(){

    /** @ngInject */
    var controller = function($scope,$sessionStorage,$modal,BlakeDataService){
        var vm = this;

        vm.$storage = $sessionStorage;
        vm.bds = BlakeDataService;

        vm.userestrictOpen = function(copy,object){
            var header = copy.header ? copy.header.userestrict['#text'] : object.header.userestrict['#text'];
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
            if(angular.isDefined(vm.bds.copy)){

                var copyPhrase = vm.bds.copy.archive_copy_id == null ? '' : ', Copy '+vm.bds.copy.archive_copy_id;

                if(vm.bds.copy.header){
                    copyPhrase = vm.bds.copy.header.filedesc.titlestmt.title['@reg']+copyPhrase
                }

                return copyPhrase;
            }
        }

        vm.getPreviousObject = function(){

            if(vm.bds.work.bad_id == 'letters'){
                if(angular.isDefined(vm.bds.object.objectsInGroup)){
                    for (var i = vm.bds.object.objectsInGroup.length; i--;) {
                        if (vm.bds.object.objectsInGroup[i].object_id == vm.bds.object.object_id) {
                            // Extra code here to make the list circular
                            if (i - 1 < 0) {
                                return vm.bds.object.objectsInGroup[vm.bds.object.objectsInGroup.length - 1];
                            } else {
                                return vm.bds.object.objectsInGroup[i - 1];
                            }
                        }
                    }
                }
            } else {
                if(angular.isDefined(vm.bds.copyObjects)){
                    for (var i = vm.bds.copyObjects.length; i--;) {
                        if (vm.bds.copyObjects[i].object_id == vm.bds.object.object_id) {
                            // Extra code here to make the list circular
                            if (i - 1 < 0) {
                                return vm.bds.copyObjects[vm.bds.copyObjects.length - 1];
                            } else {
                                return vm.bds.copyObjects[i - 1];
                            }
                        }
                    }
                }
            }
        }

        vm.getNextObject = function(){

            if(vm.bds.work.bad_id == 'letters'){
                if(angular.isDefined(vm.bds.object.objectsInGroup)){
                    for (var i = vm.bds.object.objectsInGroup.length; i--;) {
                        if (vm.bds.object.objectsInGroup[i].object_id == vm.bds.object.object_id) {
                            // Extra code here to make the list circular
                            if (i + 1 >= vm.bds.object.objectsInGroup.length) {
                                return vm.bds.object.objectsInGroup[0];
                            } else {
                                return vm.bds.object.objectsInGroup[i + 1];
                            }
                        }
                    }
                }
            } else {
                if (angular.isDefined(vm.bds.copyObjects)) {
                    for (var i = vm.bds.copyObjects.length; i--;) {
                        if (vm.bds.copyObjects[i].object_id == vm.bds.object.object_id) {
                            // Extra code here to make the list circular
                            if (i + 1 >= vm.bds.copyObjects.length) {
                                return vm.bds.copyObjects[0];
                            } else {
                                return vm.bds.copyObjects[i + 1];
                            }
                        }
                    }
                }
            }
        };

        vm.changeObject = function(object){
            vm.bds.changeObject(object);
        }

    }

    var objectViewer = function(){
        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/object-viewer/objectViewer.html',
            controller: controller,
            controllerAs: 'viewer',
            bindToController: true
        };
    }

    angular.module('blake').directive("objectViewer", objectViewer);

}());