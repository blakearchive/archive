(function(){

    var controller = function($scope,BlakeDataService,WindowSize,$window){
        var vm = this;

        vm.firstLine = 1;

        vm.trayPixels = ( WindowSize.height - 186 );
        if(WindowSize.width <= 992){
            vm.trayHeight = 0
        } else {
            vm.trayHeight = vm.trayPixels + 'px';
        }


        //panelCount is a fake number that should be replace by the actual number of panels i we get the actual number
        vm.panelCount = 5;
        vm.trayBodyHeight = (vm.trayPixels - (vm.panelCount * 53)) + 'px';

        vm.newWindow = function(object,type){
            $window.open('/blake/new-window/'+type+'/'+object.copy_bad_id+'?objectId='+object.object_id, '_blank','width=800, height=600');
        }

        $scope.$on('resize::resize',function(event,window){
            vm.trayPixels = ( window.height - 186 );
            if(WindowSize.width <= 992){
                vm.trayHeight = 0
            } else {
                vm.trayHeight = vm.trayPixels + 'px';
            }
            vm.trayBodyHeight = (vm.trayPixels - (vm.panelCount * 53)) + 'px';
        });

        $scope.$on('copyCtrl::objectChanged',function(e,d){
            vm.object = d;
        });


    }

    controller.$inject = ['$scope','BlakeDataService','WindowSize','$window'];

    var infoTray = function(){
        return {
            restrict: 'E',
            scope: {
                toggle: '&',
            },
            templateUrl: '/blake/static/directives/info-tray/infoTray.html',
            controller: controller,
            controllerAs: 'tray',
            bindToController: true
        };
    }

    angular.module('blake').directive("infoTray", infoTray);

}());