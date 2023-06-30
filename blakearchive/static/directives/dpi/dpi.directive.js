angular.module('blake').controller("DpiController", function ($rootScope) {
    var vm = this;

    if(!angular.isDefined($rootScope.dpivalue)){
        $rootScope.dpivalue = '300';
    }

    vm.reloadWith100or300 = function(dpiValue) {
        $rootScope.dpivalue = dpiValue;
    }
});

angular.module("blake").directive("dpi", function () {
    return {
        restrict: 'E',
        scope: true,
        template: require('html-loader!./dpi.html'),
        controller: "DpiController",
        controllerAs: 'dpi',
        bindToController: true
    };
});
