(function() {

    /** @ngInject */
    var controller = function ($rootScope,$routeParams,$modal,$route) {

        var vm = this;

        if(!angular.isDefined($rootScope.dpivalue)){
            $rootScope.dpivalue = '100';
        }

        vm.reloadWith100or300 = function(dpiValue) {
            //console.log($rootScope.threehundredmode);
            $rootScope.dpivalue = dpiValue;
            
        }

    }


    var dpi = function () {

        return {
            restrict: 'E',
            scope: true,
            templateUrl: '/static/directives/dpi/dpi.html',
            controller: controller,
            controllerAs: 'dpi',
            bindToController: true
        };
    }

    angular.module('blake').directive("dpi", dpi);


}());