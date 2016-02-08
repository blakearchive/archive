/**
 * Created by lukeluke on 1/25/16.
 */

(function () {

    var controller = function ($scope,UtilityServices,Fullscreen,BlakeDataService,$routeParams,WindowSize,$rootScope) {

        var vm = this;

        $rootScope.showSubMenu = 1;

        BlakeDataService.setSelectedCopy($routeParams.copyId,$routeParams.objectId).then(function() {
            BlakeDataService.setSelectedWork(BlakeDataService.selectedCopy.bad_id).then(function(){
                vm.init();
            });

            // alternate solution to works not loading, need to investigate
            //var copyBad = BlakeDataService.getSelectedCopy().bad_id,
              //  workBadMatch = /(.*)\.\w*/.exec(copyBad),
                //workBad = workBadMatch ? workBadMatch[0] : null;
            //if (workBad) {
              //  BlakeDataService.setSelectedWork(workBad);
            //}

        });

        vm.init = function(){
            vm.copy = BlakeDataService.selectedCopy;
            vm.objects = BlakeDataService.selectedCopyObjects;
            vm.obj = BlakeDataService.selectedObject;
            vm.work = BlakeDataService.selectedWork;
            vm.setObjectTitle();
            vm.getPreviousNextObjects();
        }



        $scope.$on('update:copy',function(){
            vm.init();
        });

        $scope.$on('update:work',function(){
            vm.init();
        });

        vm.changeObject = function(object){
            BlakeDataService.setSelectedObject(object.object_id).then(function(){
                vm.obj = BlakeDataService.selectedObject;
                vm.getPreviousNextObjects();
                vm.setObjectTitle();
            });
        }

        vm.setObjectTitle = function(){
            if(angular.isObject(vm.obj.header)){
                vm.objectTitle = vm.obj.header.filedesc.titlestmt.title.main['#text'];
            } else if (angular.isObject(vm.copy.header)){
                vm.objectTitle = vm.copy.header.filedesc.titlestmt.title.main['#text'] + ', Copy ' + vm.copy.archive_copy_id;
            } else {
                vm.objectTitle = vm.work.title;
            }
        }


        vm.getPreviousNextObjects = function () {
            if (vm.objects && vm.objects.length) {
                for (var i = vm.objects.length; i--;) {
                    if (vm.objects[i].object_id == vm.obj.object_id) {
                        // Extra code here to make the list circular
                        if (i - 1 < 0) {
                            vm.previousObject = vm.objects[vm.objects.length - 1];
                        } else {
                            vm.previousObject = vm.objects[i - 1];
                        }
                        if (i + 1 >= vm.objects.length) {
                            vm.nextObject = vm.objects[0];
                        } else {
                            vm.nextObject = vm.objects[i + 1];
                        }
                        break;
                    }
                }
            }
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


    controller.$inject = ['$scope','UtilityServices','Fullscreen','BlakeDataService','$routeParams','WindowSize','$rootScope'];

    angular.module('blake').controller('CopyController', controller);

}());