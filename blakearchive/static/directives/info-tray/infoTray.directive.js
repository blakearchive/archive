(function(){

    var controller = function($scope,BlakeDataService,WindowSize){
        var vm = this;

        /*function trayHeight() {
            var set_tray_height = $(window).height() - 86;
            var panel_count = $('.panel-group .panel-default').length;
            var set_tray_body_height = (set_tray_height - (panel_count * 47));

            $('.panel-group').css('min-height', set_tray_height + 'px');
            $('.panel-group .panel-body').css('max-height', set_tray_body_height + 'px');
        }

        if ( $('#object-detail-tray').length ) {
            trayHeight();
            $(window).resize(response_change.waitForIdle(function() {
                trayHeight();
            }, 100));
        }*/

        vm.trayPixels = ( WindowSize.height - 145 );
        if(WindowSize.width <= 992){
            vm.trayHeight = 0
        } else {
            vm.trayHeight = vm.trayPixels + 'px';
        }


        //panelCount is a fake number that should be replace by the actual number of panels i we get the actual number
        vm.panelCount = 5;
        vm.trayBodyHeight = (vm.trayPixels - (vm.panelCount * 53)) + 'px';

        /*vm.openWindow = function(e) {
            var full_text = e.target.innerHTML;
            window.open('http://www.blakearchive.org/blake/')
        };*/


        $scope.$on('resize::resize',function(event,window){
            vm.trayPixels = ( window.height - 145 );
            if(WindowSize.width <= 992){
                vm.trayHeight = 0
            } else {
                vm.trayHeight = vm.trayPixels + 'px';
            }
            vm.trayBodyHeight = (vm.trayPixels - (vm.panelCount * 53)) + 'px';
        });

    }

    controller.$inject = ['$scope','BlakeDataService','WindowSize'];

    var infoTray = function(){
        return {
            restrict: 'E',
            scope: {
                toggle: '&',
                copy: '=copy',
                obj: '=obj'

            },
            templateUrl: '/blake/static/directives/info-tray/infoTray.html',
            controller: controller,
            controllerAs: 'tray',
            bindToController: true
        };
    }

    angular.module('blake').directive("infoTray", infoTray);

}());