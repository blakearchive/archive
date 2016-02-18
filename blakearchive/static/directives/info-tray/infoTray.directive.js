(function(){

    var controller = function($scope,BlakeDataService,WindowSize){
        var vm = this;


        vm.trayPixels = ( WindowSize.height - 136 );
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
            vm.trayPixels = ( window.height - 136 );
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
                copy: '=copy'
            },
            templateUrl: '/blake/static/directives/info-tray/infoTray.html',
            controller: controller,
            controllerAs: 'tray',
            bindToController: true
        };
    }

    angular.module('blake').directive("infoTray", infoTray);

}());