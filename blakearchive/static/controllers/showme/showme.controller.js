/**
 * Created by lukeluke on 1/25/16.
 */

(function () {

    var controller = function ($scope,BlakeDataService,$routeParams,WindowSize,$rootScope) {

        var vm = this;

        $rootScope.showmePage = true;

        vm.what = $routeParams.what;

        BlakeDataService.setSelectedCopy($routeParams.copyId,$routeParams.objectId).then(function() {
            vm.copy = BlakeDataService.selectedCopy;
            var copyBad = BlakeDataService.selectedCopy.bad_id,
                workBadMatch = copyBad.indexOf('.'),
                workBad = workBadMatch > 0 ? copyBad.substring(0,workBadMatch) : copyBad;
            if (angular.isUndefined(BlakeDataService.selectedWork)) {
                BlakeDataService.setWorkNoCopies(workBad).then(function(){
                    vm.init();
                });
            } else {
                vm.init();
            }
        });


        vm.init = function(){
            vm.work = BlakeDataService.selectedWork;
            vm.getPreviousNextObjects();
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

        vm.getOvpSubtitle = function(){
            if(angular.isDefined(vm.copy)){
                if(vm.copy.virtual == true){
                    return 'Object '+vm.copy.selectedObject.object_number + vm.copy.selectedObject.full_object_id.replace(/object [\d]+/g,'');
                } else {
                    return vm.copy.selectedObject.full_object_id;
                }
            }
        }

        vm.getPreviousNextObjects = function () {
            if (vm.copy.objectsInCopy && vm.copy.objectsInCopy.length) {
                for (var i = vm.copy.objectsInCopy.length; i--;) {
                    if (vm.copy.objectsInCopy[i].object_id == vm.copy.selectedObject.object_id) {
                        // Extra code here to make the list circular
                        if (i - 1 < 0) {
                            vm.previousObject = vm.copy.objectsInCopy[vm.copy.objectsInCopy.length - 1];
                        } else {
                            vm.previousObject = vm.copy.objectsInCopy[i - 1];
                        }
                        if (i + 1 >= vm.copy.objectsInCopy.length) {
                            vm.nextObject = vm.copy.objectsInCopy[0];
                        } else {
                            vm.nextObject = vm.copy.objectsInCopy[i + 1];
                        }
                        break;
                    }
                }
            }
        };

        vm.changeObject = function(object){
            vm.copy.selectedObject = object;
            vm.init();
        }

    };


    controller.$inject = ['$scope','BlakeDataService','$routeParams','WindowSize','$rootScope'];

    angular.module('blake').controller('ShowMe', controller);

}());