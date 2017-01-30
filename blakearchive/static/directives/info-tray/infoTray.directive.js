(function(){

    /** @ngInject */
    var controller = function($rootScope,$scope,BlakeDataService,WindowSize,$window){
        var vm = this;
        vm.bds = BlakeDataService;
        vm.view = $rootScope.view;

        vm.firstLine = 1;
        vm.panelAdjust = 55;
        vm.scrollBarHeight = 15;
        vm.adjustHeight = 136;

        vm.open = {
            'text':false,
            'desc': false,
            'notes':false,
            'meta':false,
            'tei':false
        };

        /*if(angular.isDefined($routeParams.open)){
            vm.open[$routeParams.open] = true;
        }*/

        vm.resize = function(adjust){
            var adjust = angular.isDefined(adjust) ? vm.adjustHeight - adjust : vm.adjustHeight;
            vm.trayPixels = ( WindowSize.height - adjust );
            if(WindowSize.width <= 992){
                vm.trayHeight = 0
            } else {
                vm.trayHeight = vm.trayPixels + 'px';
            }
            vm.panelCount = 3;
            vm.trayBodyHeight = (vm.trayPixels - vm.scrollBarHeight - (vm.panelCount * vm.panelAdjust)) + 'px';

        }

        vm.resize();

        vm.newWindow = function(object,type){
            $window.open('/new-window/'+type+'/'+object.copy_bad_id+'?descId='+object.desc_id, '_blank','width=800, height=600');
        }

        $scope.$on('resize::resize',function(event,window){
            vm.resize();
        });

        $scope.$on('copyCtrl::toggleTools',function(e,tools){
            if(tools){
                vm.resize();
            } else {
                vm.resize(-47);
            }
        })

        /*$scope.$on('copyCtrl::objectChanged',function(e,d){
            vm.object = d;
        });*/

    }

    var link = function(scope,ele,attr,vm){
        var mode = function(){ return vm.view.mode };
        scope.$watch(mode,function(){
            var adjust = vm.view.mode == 'object' ? 0 : 50;
            vm.resize(adjust);
        })
    }

    var infoTray = function(){
        return {
            restrict: 'E',
            scope: {
                toggle: '&',
            },
            templateUrl: '/static/directives/info-tray/infoTray.html',
            controller: controller,
            controllerAs: 'tray',
            bindToController: true,
            link:link
        };
    }

    angular.module('blake').directive("infoTray", ['$rootScope','$scope','BlakeDataService','WindowSize','$window',infoTray]);

}());