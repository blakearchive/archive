(function(){


    var controller = function ($scope, WindowSize, $timeout, $rootScope, $sessionStorage) {

        var vm = this;

        vm.$storage = $sessionStorage;

    }

    controller.$inject = ['$scope','WindowSize','$timeout','$rootScope','$sessionStorage'];

    var objectCompare = function(){
        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/object-compare/objectCompare.html',
            controller: controller,
            scope: {
                copy: '=copy',
                work: '=work',
                changeObject: '&'
            },
            controllerAs: 'compare',
            bindToController: true
        };
    }

    angular.module('blake').directive("objectCompare", objectCompare);

}());