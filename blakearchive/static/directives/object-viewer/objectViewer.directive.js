(function(){

    /** @ngInject */
    var controller = function($rootScope,$modal,BlakeDataService){
        var vm = this;

        vm.bds = BlakeDataService;

        $rootScope.onWorkPage = false;

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

            var list = {};

            if(vm.bds.work.bad_id == 'letters'){
                list = vm.bds.copy.objectGroups[vm.bds.object.object_group];
            } else {
                list = vm.bds.copyObjects;
            }

            if(list){
                for (var i = list.length; i--;) {
                    if (list[i].object_id == vm.bds.object.object_id) {
                        // Extra code here to make the list circular
                        if (i - 1 < 0) {
                            return list[list.length - 1];
                        } else {
                            return list[i - 1];
                        }
                    }
                }
            }
        }

        vm.getNextObject = function(){

            var list = {};

            if(vm.bds.work.bad_id == 'letters'){
                list = vm.bds.copy.objectGroups[vm.bds.object.object_group];
            } else {
                list = vm.bds.copyObjects;
            }

            if(list){
                for (var i = list.length; i--;) {
                    if (list[i].object_id == vm.bds.object.object_id) {
                        // Extra code here to make the list circular
                        if (i + 1 >= list.length) {
                            return list[0];
                        } else {
                            return list[i + 1];
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