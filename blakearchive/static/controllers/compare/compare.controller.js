/**
 * Created by nathan on 2/13/15.
 */

(function() {

    var controller = function ($scope,UtilityServices,Fullscreen,BlakeDataService,$routeParams,WindowSize,$timeout,$rootScope) {

        var vm = this;

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


        // Open an info panel in fullscreen mode
        vm.goFullscreen = function (panel_id) {
            UtilityServices.fullScreen(Fullscreen, panel_id);
        };
        // Reset to previous panel dimensions, set by UtilityServices.trayHeight
        UtilityServices.resetPanelFromFullscreen(Fullscreen);

        vm.comparisonObjects = BlakeDataService.comparisonObjects;
        console.log(vm.comparisonObjects);
        vm.obj = BlakeDataService.selectedObject;


        $scope.$on("update:object", function () {
            vm.obj = BlakeDataService.selectedObject;
        });

    }


    controller.$inject = ['$scope','UtilityServices','Fullscreen','BlakeDataService','$routeParams','WindowSize','$timeout','$rootScope'];

    angular.module('blake').controller("CompareController", controller);

})();
