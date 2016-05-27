/**
 * Created by lukeluke on 1/25/16.
 */

(function () {

    /** @ngInject */
    var controller = function ($scope,$routeParams,$rootScope,$location,$window,$modal,$cookies,BlakeDataService,imageManipulation,CompareObjectsFactory,WindowSize) {

        var vm = this;

        $rootScope.showSubMenu = 1;
        $rootScope.worksNavState = false;
        vm.bds = BlakeDataService;
        vm.cof = CompareObjectsFactory;

        BlakeDataService.setSelectedCopy($routeParams.copyId, $routeParams.descId).then(function(){
            vm.cof.clearComparisonObjects();
            $rootScope.view.mode = 'object';
            $rootScope.view.scope = 'image';
        })

        /*
         * Object and Copy selection
         */
        /*vm.changeCopy = function(copy_bad_id,desc_id,reset){
            BlakeDataService.setSelectedCopy(copy_bad_id,desc_id).then(function() {
                vm.copy = BlakeDataService.selectedCopy;

                if(copy_bad_id != $routeParams.copyId){
                    var newpath = '/blake/copy/'+copy_bad_id;
                    $location.path(newpath, false);
                    $routeParams.copyId = copy_bad_id;
                    $location.search('descId',desc_id);
                }

                if(!desc_id){
                    desc_id = vm.copy.selectedObject.desc_id;
                }

                vm.setObject(desc_id);

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

        vm.changeCopy($routeParams.copyId,$routeParams.descId,true);


        vm.resetComparisonObjects = function(newObject){
            var selectedObject = angular.isDefined(newObject) ? newObject : vm.copy.selectedObject;
            selectedObject.isActive = true;
            vm.$storage.comparisonObjects = [];
            vm.$storage.comparisonObjects.push(selectedObject);
        }

        vm.setSimilarObjects = function(desc_id){
            BlakeDataService.getObjectsFromSameMatrix(desc_id).then(function(data){
                vm.copy.selectedObject.matrix = data;
            });

            BlakeDataService.getObjectsWithSameMotif(desc_id).then(function(data){
                vm.copy.selectedObject.motif = data;
            });

            BlakeDataService.getObjectsFromSameProductionSequence(desc_id).then(function(data){
                vm.copy.selectedObject.sequence = data;
            })
        }

        vm.changeObject = function(object){
            $location.search('descId',object.desc_id);
        };

        vm.setObject = function(desc_id){
            angular.forEach(vm.copy.objectsInCopy,function(v){
                if(desc_id == v.desc_id){
                    vm.copy.selectedObject  = v;
                    vm.setSimilarObjects(v.desc_id);
                    imageManipulation.reset();
                    return;
                }
            });
            $rootScope.$broadcast('copyCtrl::objectChanged',vm.copy.selectedObject);
            $rootScope.worksNavState = false;
        }

        $scope.$on('$routeUpdate',function(e,v) {
            vm.setObject(v.params.descId);
        });*/

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
        /*vm.newWindow = function(object){
            $window.open('/blake/new-window/enlargement/'+object.copy_bad_id+'?descId='+object.desc_id, '_blank','width=800, height=600');
        }*/

        vm.trueSizeOpen = function(object){
            if(!angular.isDefined($cookies.getObject('clientPpi'))){
                var clientDpiModalInstance = $modal.open({
                    template: '<client-ppi object="{{object}}"></client-ppi>',
                    controller: 'ModalController',
                    size: 'lg'
                });
            } else {
                $window.open('/blake/new-window/truesize/'+object.copy_bad_id+'?descId='+object.desc_id, '_blank', 'width=800, height=600');
            }
        }

        $scope.$on('clientPpi::savedPpi',function(){
            console.log('cppiherd');
            $window.open('/blake/new-window/truesize/'+vm.copy.selectedObject.copy_bad_id+'?descId='+vm.copy.selectedObject.desc_id, '_blank', 'width=800, height=600');
        });


        vm.rotate = function(){
            imageManipulation.rotate();
        }

    };

    angular.module('blake').controller('CopyController', controller);

}());