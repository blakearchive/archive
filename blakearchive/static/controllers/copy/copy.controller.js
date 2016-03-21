/**
 * Created by lukeluke on 1/25/16.
 */

(function () {

    var controller = function ($scope,BlakeDataService,$routeParams,WindowSize,$rootScope,$location,$sessionStorage) {

        var vm = this;

        $rootScope.showSubMenu = 1;

        vm.changeCopy = function(copy_bad_id,object_id){
            console.log(copy_bad_id);
            console.log(object_id);
            BlakeDataService.setSelectedCopy(copy_bad_id,object_id).then(function() {
                vm.copy = BlakeDataService.selectedCopy;
                if(!angular.isDefined($routeParams.objectId)){
                    $location.search('objectId',vm.copy.selectedObject.object_id);
                }
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
        }

        vm.changeCopy($routeParams.copyId,$routeParams.objectId);

        vm.$storage = $sessionStorage;

        /*BlakeDataService.setSelectedCopy($routeParams.copyId,$routeParams.objectId).then(function() {
                vm.copy = BlakeDataService.selectedCopy;
                if(!angular.isDefined($routeParams.objectId)){
                    $location.search('objectId',vm.copy.selectedObject.object_id);
                }
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
        });*/

        vm.init = function(){
            vm.work = BlakeDataService.selectedWork;
            vm.setSimilarObjects(vm.copy.selectedObject.object_id);
            if(angular.isDefined(vm.$storage.comparisonObjects)){
                if(vm.$storage.comparisonObjects[0].object_id != vm.copy.selectedObject.object_id){
                    vm.$storage.comparisonObjects = [];
                    vm.$storage.comparisonObjects.push(vm.copy.selectedObject);
                }
            } else {
                vm.$storage.comparisonObjects = [];
                vm.$storage.comparisonObjects.push(vm.copy.selectedObject);
            }
            /*if(vm.copy.objectsInCopy.length > 1){
                vm.getPreviousNextObjects();
            }*/
            console.log(vm.$storage.comparisonObjects);
            $rootScope.$broadcast('copyCtrl::objectChanged',vm.copy.selectedObject);
        }

        vm.setSimilarObjects = function(object_id){
            BlakeDataService.getObjectsFromSameMatrix(object_id).then(function(data){
                vm.copy.selectedObject.matrix = data;
            });

            BlakeDataService.getObjectsWithSameMotif(object_id).then(function(data){
                vm.copy.selectedObject.motif = data;
            });

            BlakeDataService.getObjectsFromSameProductionSequence(object_id).then(function(data){
                vm.copy.selectedObject.sequence = data;
            })
        }

        vm.changeObject = function(object){
            vm.copy.selectedObject = object;
            $location.search('objectId',object.object_id);
            vm.init();
        };

        vm.trayOpen = false;
        vm.showTools = true;

        vm.toggleTray = function(){
            vm.trayOpen = !vm.trayOpen;
        }

        vm.toggleTools = function(){
            vm.showTools = !vm.showTools;
            $scope.$broadcast('copyCtrl::toggleTools',{tools:vm.showTools});
        }

    };


    controller.$inject = ['$scope','BlakeDataService','$routeParams','WindowSize','$rootScope','$location','$sessionStorage'];

    angular.module('blake').controller('CopyController', controller);

}());