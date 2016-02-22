(function(){

    var controller = function($scope,BlakeDataService,WindowSize,$window){
        var vm = this;

        vm.firstLine = 1;

        vm.trayPixels = ( WindowSize.height - 136 );
        if(WindowSize.width <= 992){
            vm.trayHeight = 0
        } else {
            vm.trayHeight = vm.trayPixels + 'px';
        }


        //panelCount is a fake number that should be replace by the actual number of panels i we get the actual number
        vm.panelCount = 5;
        vm.trayBodyHeight = (vm.trayPixels - (vm.panelCount * 53)) + 'px';

        vm.newWindow = function(copy,type){
            $window.open('/blake/'+type+'/'+copy.bad_id+'/'+copy.selectedObject.object_id, '_blank','width=800, height=600');
        }

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

    controller.$inject = ['$scope','BlakeDataService','WindowSize','$window'];

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