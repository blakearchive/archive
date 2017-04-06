angular.module("blake").controller('ClientPPIController', function ($http,$rootScope,$cookies) {

        var vm = this;

        vm.common = {
            'resolutions':[
                {'x':1920,'y':1080},
                {'x':1680,'y':1050},
                {'x':1440,'y':900},
                {'x':1366,'y':768},
                {'x':1280,'y':800},
                {'x':1386,'y':768},
                {'x':1024,'y':768},
                {'x':800,'y':600}
            ],
            'diagonals':[7,11.6,13.3,14,15.6,17.3,21,27]
        };

        vm.screens = [];

        vm.calculatePpi = function() {
            var x = vm.config.x,
                y = vm.config.y,
                d = vm.config.d;
            // Calculate PPI/DPI
            var dpi = Math.sqrt(x*x + y*y) / d;
            return dpi>0 ? Math.round(dpi) : 0;

        };

        if(angular.isDefined($cookies.getObject('clientPpi'))){
            vm.config = $cookies.getObject('clientPpi');
        } else {
            vm.config = {
                'x': 1680,
                'y': 1050,
                'd': 13.3,
                'ppi': 0
            }
        }


        vm.testLine = {
            'background-color':'red',
            'height': '5px',
            'width': vm.calculatePpi()+'px'
        };

        vm.updateConfig = function(x,y,d) {
            vm.config.x = x > 0 ? x : vm.config.x;
            vm.config.y = y > 0 ? y : vm.config.y;
            vm.config.d = d > 0 ? d : vm.config.d;
            vm.testLine.width = vm.calculatePpi() + 'px';
        };

        vm.savePpi = function(){
            vm.config.ppi = vm.calculatePpi();
            $cookies.putObject('clientPpi',vm.config);
            $rootScope.$broadcast('clientPpi::savedPpi');
        };

        $http.get('/static/directives/client-ppi/screens.json').then(function(response){
           vm.screens = response.data;
        });

        vm.screenQuery = '';



    })
.directive('clientPpi', function() {
        return {
            restrict: 'EA',
            template: require('html-loader!./clientPpi.html'),
            controller: "ClientPPIController",
            controllerAs: 'ppi',
            bindToController: true
        }
    });



