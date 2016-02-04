/**
 * Created by lukeluke on 1/25/16.
 */

(function () {

    var controller = function ($scope,UtilityServices,Fullscreen,BlakeDataService,$routeParams,WindowSize) {

        var vm = this;

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
                console.log(vm.obj.text);
                vm.getPreviousNextObjects();
            });
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

        // Set viewer height
        //vm.viewerHeight = UtilityServices.imageViewerHeight() + 'px';
        /*vm.imageHeight =  ( WindowSize.height - 270 );

        $scope.$on('resize::resize',function(event,window){
            vm.imageHeight =  ( WindowSize.height - 270 );
        });*/

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


    controller.$inject = ['$scope','UtilityServices','Fullscreen','BlakeDataService','$routeParams','WindowSize'];

    angular.module('blake').controller('CopyController', controller);

}());

/*angular.module('blake').controller("ObjectViewerController",{
 $rootScope.showSubMenu = 1;
 vm.BlakeDataService = bds;

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

 vm.getObjLines = function () {
 var objLines = [];
 if (vm.obj) {
 if (vm.obj.text && vm.obj.text.lg && vm.obj.text.lg.length) {
 objLines = UtilityServices.imageText(vm, objLines);
 }
 }
 return objLines;
 };

 // Just need a function reference here
 vm.toggleTray = UtilityServices.togglingTray;

 vm.openWindow = function(e) {
 var full_text = e.target.innerHTML;
 window.open('http://www.blakearchive.org/blake/')
 };

 // Open an info panel in fullscreen mode
 vm.goFullscreen = function(panel_id) {
 UtilityServices.fullScreen(Fullscreen, panel_id);
 };

 // Reset to previous panel dimensions, originally set by UtilityServices.trayHeight
 UtilityServices.resetPanelFromFullscreen(Fullscreen);

 // Set viewer height
 vm.viewerHeight = UtilityServices.imageViewerHeight() + 'px';
 vm.imageHeight = (vm.viewerHeight.split('px')[0] - 50)  + 'px';

 vm.copy = BlakeDataService.getSelectedCopy();
 vm.objects = BlakeDataService.getSelectedCopyObjects();
 vm.obj = BlakeDataService.getSelectedObject();
 if (vm.copy && !vm.work) {
 BlakeDataService.setSelectedWork(vm.copy.bad_id)
 } else {
 vm.work = BlakeDataService.getSelectedWork();
 }

 vm.getPreviousNextObjects();

 /*vm.$on("copySelectionChange", function () {
 vm.copy = BlakeDataService.getSelectedCopy();
 UtilityServices.getImageHeight(100, $timeout);
 });

 vm.$on("copySelectionObjectsChange", function () {
 vm.objects = BlakeDataService.getSelectedCopyObjects();
 UtilityServices.getImageHeight(100, $timeout);
 });

 vm.$on("objectSelectionChange", function () {
 vm.obj = BlakeDataService.getSelectedObject();
 vm.getPreviousNextObjects();
 UtilityServices.getImageHeight(100, $timeout);
 });

 vm.$on("workSelectionChange", function () {
 vm.work = BlakeDataService.getSelectedWork();
 });

 }]);*/