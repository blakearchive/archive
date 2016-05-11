/**
 * Created by lukeluke on 1/25/16.
 */

(function () {

    var controller = function ($scope,BlakeDataService,$routeParams,WindowSize,$rootScope,$location,$sessionStorage,$window,$modal,imageManipulation) {

        var vm = this;

        $rootScope.showSubMenu = 1;
        $rootScope.worksNavState = false;
        vm.$storage = $sessionStorage;

        /*
         * Object and Copy selection
         */
        vm.changeCopy = function(copy_bad_id,object_id,reset){
            BlakeDataService.setSelectedCopy(copy_bad_id,object_id).then(function() {
                vm.copy = BlakeDataService.selectedCopy;

                if(copy_bad_id != $routeParams.copyId){
                    var newpath = '/blake/copy/'+copy_bad_id;
                    $location.path(newpath, false);
                    $routeParams.copyId = copy_bad_id;
                    $location.search('objectId',object_id);
                }

                if(!object_id){
                    object_id = vm.copy.selectedObject.object_id;
                }

                vm.setObject(object_id);

                if(reset){
                    vm.resetView();
                }

                var copyBad = BlakeDataService.selectedCopy.bad_id,
                    workBadMatch = copyBad.indexOf('.'),
                    workBad = workBadMatch > 0 ? copyBad.substring(0,workBadMatch) : copyBad;

                if (angular.isUndefined(BlakeDataService.selectedWork)) {
                    BlakeDataService.setWorkNoCopies(workBad).then(function(){
                        vm.work = BlakeDataService.selectedWork;
                    });
                } else {
                    vm.work = BlakeDataService.selectedWork;
                }

            });
        }

        vm.changeCopy($routeParams.copyId,$routeParams.objectId,true);


        vm.resetComparisonObjects = function(newObject){
            var selectedObject = angular.isDefined(newObject) ? newObject : vm.copy.selectedObject;
            selectedObject.isActive = true;
            vm.$storage.comparisonObjects = [];
            vm.$storage.comparisonObjects.push(selectedObject);
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
            $location.search('objectId',object.object_id);
        };

        vm.setObject = function(object_id){
            angular.forEach(vm.copy.objectsInCopy,function(v){
                if(object_id == v.object_id){
                    vm.copy.selectedObject  = v;
                    vm.setSimilarObjects(v.object_id);
                    imageManipulation.reset();
                    return;
                }
            });
            $rootScope.$broadcast('copyCtrl::objectChanged',vm.copy.selectedObject);
            $rootScope.worksNavState = false;
        }

        $scope.$on('$routeUpdate',function(e,v) {
            vm.setObject(v.params.objectId);
        });

        /*
         * Toolbar manipulation
         */
        //vm.trayOpen = angular.isDefined($routeParams.open) ? true : false;
        vm.showTools = true;

        vm.toggleTray = function(){
            $rootScope.worksNavState = false;
            vm.trayOpen = !vm.trayOpen;
        }

        vm.toggleTools = function(){
            vm.showTools = !vm.showTools;
            $scope.$broadcast('copyCtrl::toggleTools',vm.showTools);
        }


        vm.newWindow = function(object){
            $window.open('/blake/new-window/enlargement/'+object.copy_bad_id+'?objectId='+object.object_id, '_blank','width=800, height=600');
        }

        /*
         * View Manipulation
         */
        vm.resetView = function(){
            if(angular.isDefined(vm.$storage.view)){
                vm.$storage.view.mode = 'object';
                vm.$storage.view.scope = 'image';
            }
            vm.resetComparisonObjects();
        }

        /*
         * OVP Toolbar
         */
        vm.getObjectToTransform = function(){

            var object = {};

            if(vm.$storage.view.mode == 'object'){
                object =  vm.copy.selectedObject;
            }
            if(vm.$storage.view.mode == 'compare'){
                angular.forEach(vm.$storage.comparisonObjects, function(obj){
                    if(obj.isActive){
                        object = obj;
                    }
                });
            }

            return object;
        }
        vm.newWindow = function(object){
            $window.open('/blake/new-window/enlargement/'+object.copy_bad_id+'?objectId='+object.object_id, '_blank','width=800, height=600');
        }

        vm.trueSizeOpen = function(object){
            if(!angular.isDefined(vm.$storage.clientPpi)){
                var clientDpiModalInstance = $modal.open({
                    template: '<client-ppi></client-ppi>',
                    controller: 'ModalController',
                    size: 'lg'
                });
            } else {
                $window.open('/blake/new-window/truesize/'+object.copy_bad_id+'?objectId='+object.object_id, '_blank', 'width=800, height=600');
            }
        }


        vm.rotate = function(){
            imageManipulation.rotate();
        }

    };


    controller.$inject = ['$scope','BlakeDataService','$routeParams','WindowSize','$rootScope','$location','$sessionStorage','$window','$modal','imageManipulation'];

    angular.module('blake').controller('CopyController', controller);

}());