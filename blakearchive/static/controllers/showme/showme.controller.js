/**
 * Created by lukeluke on 1/25/16.
 */

(function () {

    var controller = function ($scope,BlakeDataService,$routeParams,WindowSize,$rootScope,$location,$sessionStorage,$modal,$cookies) {

        var vm = this;
        vm.$storage = $sessionStorage;

        $rootScope.showmePage = true;

        vm.what = $routeParams.what;

        BlakeDataService.setSelectedCopy($routeParams.copyId,$routeParams.descId).then(function() {
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
            if(vm.copy.objectsInCopy.length > 1){
                vm.getPreviousNextObjects();
            }
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
            $location.search('descId',object.object_id);
            vm.init();
        }

        vm.trueSize = function(){
            if(angular.isDefined($cookies.getObject('clientPpi')) && angular.isDefined((vm.copy))){
                var size = vm.copy.selectedObject.physical_description.objsize['#text'].split(' '),
                    clientPpi = $cookies.getObject('clientPpi'),
                    x = size[2],
                    y = size[0],
                    unit = size[3],
                    width = x / 2.54 * clientPpi.ppi,
                    height = y / 2.54 * clientPpi.ppi;
                //console.log('x='+x+'  y='+y+'  unit='+unit+'  ppi='+clientPpi.ppi);
                if(unit == 'mm.'){
                    width = width * 10;
                    height = height * 10;
                }

                 return {'height':height+'px','width':width+'px'}

            }
        }

        vm.clientPpiOpen = function(){
            var clientDpiModalInstance = $modal.open({
                template: '<client-ppi></client-ppi>',
                controller: 'ModalController',
                size: 'lg'
            });
        }

    };


    controller.$inject = ['$scope','BlakeDataService','$routeParams','WindowSize','$rootScope','$location','$sessionStorage','$modal','$cookies'];

    angular.module('blake').controller('ShowMeController', controller);

}());