/**
 * Created by nathan on 2/13/15.
 */

(function() {

    var controller = function ($scope,UtilityServices,Fullscreen,BlakeDataService,$routeParams,WindowSize,$timeout) {

        var vm = this;

        /*vm.updateCopyInfo = function (copyId, objectId) {
            var copy_num = copyId.split('.')
                .slice(0, 2)
                .join('.');

            vm.copy = BlakeDataService.setSelectedCopy(copy_num, objectId);
        };*/


        vm.viewerHeight =  ( WindowSize.height - 270 );
        vm.imageHeight = vm.viewerHeight - 100;

        $scope.$on('resize::resize',function(event,window){
            vm.viewerHeight =  ( window.height - 270 );
            vm.imageHeight = vm.viewerHeight - 100;
        });

        /*var compare_object_width = 0;
        $('#object-view #compare .item').each(function() {
            compare_object_width += Number( $(this).width() );
        });

        $('#object-view #compare .compare-inner').css('width', (compare_object_width + 10) + 'px');
    }

    if ( $('#object-view #compare').length ) {
        setObjectCompare();
        $(window).on('resize', response_change.waitForIdle(function() {
            setObjectCompare();
        }, 100));*/

        vm.trayOpen = false;
        vm.showTools = true;

        vm.toggleTray = function(){
            vm.trayOpen = !vm.trayOpen;
        }
        vm.toggleTools = function(){
            vm.showTools = !vm.showTools;

            vm.imageHeight = vm.showTools == true ? (vm.imageHeight - 50) : (vm.imageHeight + 50);
            console.log(vm.imageHeight);
        }


        // Open an info panel in fullscreen mode
        vm.goFullscreen = function (panel_id) {
            UtilityServices.fullScreen(Fullscreen, panel_id);
        };
        // Reset to previous panel dimensions, set by UtilityServices.trayHeight
        UtilityServices.resetPanelFromFullscreen(Fullscreen);

        vm.comparisonObjects = BlakeDataService.comparisonObjects;
        vm.obj = BlakeDataService.selectedObject;

        /*$scope.$on("update:comparison", function () {
            vm.comparisonObjects = BlakeDataService.comparisonObjects;
            console.log(vm.comparisonObjects)
        });*/

        $scope.$on("update:object", function () {
            vm.obj = BlakeDataService.selectedObject;
            vm.setViewWidth();
        });

        // Horizontal Scroll with fixed height/width images
        //var response_change = UtilityServices.responseChange();

        /*function setObjectCompare() {
            var compare_object_width = 0;
            $('#object-view #compare .item').each(function () {
                compare_object_width += Number($(this).width());
            });

            $('#object-view #compare .compare-inner').css('width', (compare_object_width + 10) + 'px');
        }

        function objectCompareHeight() {
            var set_object_compare_height = $(window).height() - 370;
            $('#object-view #compare .featured-object img').css('height', set_object_compare_height + 'px');
        }*/

        /*angular.element(document).ready(function () {
            $timeout(function () {
                setObjectCompare();
                objectCompareHeight();

                var object_view = $("div.compare-inner");

                // Set the max-height for the detail tray in object view.
                if ($('#object-detail-tray').length) {
                    //UtilityServices.trayHeight(object_view);

                    object_view.resize(response_change.waitForIdle(function () {
                        //UtilityServices.trayHeight(object_view);
                    }, 10));
                }
            }, 0);
        });*/

        /*$(window).on('resize', response_change.waitForIdle(function () {
            setObjectCompare();
            objectCompareHeight();
        }, 100));*/
    }


    controller.$inject = ['$scope','UtilityServices','Fullscreen','BlakeDataService','$routeParams','WindowSize','$timeout'];

    angular.module('blake').controller("CompareController", controller);

})();