/**
 * Created by nathan on 2/13/15.
 */

(function() {

    var controller = function ($scope,BlakeDataService,$routeParams,WindowSize,$timeout,$rootScope,$localStorage) {

        var vm = this;
        console.log($localStorage);

        vm.comparisonObjects = $localStorage.comparisonObjects;
        vm.obj = $localStorage.comparisonObjects[0];
        if(angular.isUndefined(BlakeDataService.selectedCopy)){
            BlakeDataService.setSelectedCopy(vm.obj.copy_bad_id).then(function(){
                vm.copy = BlakeDataService.selectedCopy;
                var copyBad = vm.copy.bad_id,
                    workBadMatch = copyBad.indexOf('.'),
                    workBad = workBadMatch > 0 ? copyBad.substring(0,workBadMatch) : copyBad;
                if (angular.isUndefined(BlakeDataService.selectedWork)) {
                    BlakeDataService.setWorkNoCopies(workBad).then(function(){
                        vm.init();
                    });
                } else {
                    vm.init();
                }
            })
        }

        vm.init = function(){
            vm.work = BlakeDataService.selectedWork;
        }

        $rootScope.showSubMenu = 1;

        /*vm.updateCopyInfo = function (copyId, objectId) {
         var copy_num = copyId.split('.')
         .slice(0, 2)
         .join('.');

         vm.copy = BlakeDataService.setSelectedCopy(copy_num, objectId);
         };*/


        vm.viewerHeight =  ( WindowSize.height - 220 );

        $scope.$on('resize::resize',function(event,window){
            vm.viewerHeight =  ( window.height - 220 );
        });


        vm.trayOpen = false;
        vm.showTools = true;

        vm.toggleTray = function(){
            vm.trayOpen = !vm.trayOpen;
        }
        vm.toggleTools = function(){
            vm.showTools = !vm.showTools;
            vm.viewerHeight = vm.showTools == true ? vm.viewerHeight - 112 : vm.viewerHeight + 112;
            $scope.$broadcast('compareCtrl::toggleTools',{tools:vm.showTools});
        }


        /*$scope.$on("update:object", function () {
            vm.obj = BlakeDataService.selectedObject;
        });*/

    }


    controller.$inject = ['$scope','BlakeDataService','$routeParams','WindowSize','$timeout','$rootScope','$localStorage'];

    angular.module('blake').controller("CompareController", controller);

})();
