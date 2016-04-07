(function(){

    var controller = function($scope,BlakeDataService,WindowSize,$window, $routeParams){
        var vm = this;

        vm.firstLine = 1;
        vm.adjust = 150;
        vm.panelAdjust = 60;
        vm.scrollBarHeight = 7;

        vm.open = {
            'text':false,
            'desc': false,
            'notes':false,
            'meta':false,
            'tei':false
        };

        if(angular.isDefined($routeParams.open)){
            vm.open[$routeParams.open] = true;
        }

        vm.trayPixels = ( WindowSize.height - vm.adjust );
        if(WindowSize.width <= 992){
            vm.trayHeight = 0
        } else {
            vm.trayHeight = vm.trayPixels + 'px';
        }


        //panelCount is a fake number that should be replace by the actual number of panels i we get the actual number
        vm.panelCount = 3;
        vm.trayBodyHeight = (vm.trayPixels - vm.scrollBarHeight - (vm.panelCount * vm.panelAdjust)) + 'px';

        vm.newWindow = function(object,type){
            $window.open('/blake/new-window/'+type+'/'+object.copy_bad_id+'?objectId='+object.object_id, '_blank','width=800, height=600');
        }

        $scope.$on('resize::resize',function(event,window){
            vm.trayPixels = ( window.height - vm.adjust );
            if(WindowSize.width <= 992){
                vm.trayHeight = 0
            } else {
                vm.trayHeight = vm.trayPixels + 'px';
            }
            vm.trayBodyHeight = (vm.trayPixels - vm.scrollBarHeight - (vm.panelCount * vm.panelAdjust)) + 'px';
        });

        $scope.$on('copyCtrl::objectChanged',function(e,d){
            vm.object = d;
        });


    }

    controller.$inject = ['$scope','BlakeDataService','WindowSize','$window', '$routeParams'];

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