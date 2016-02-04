(function(){

    var controller = function(){
        var vm = this;
    }

    var objectTools = function(){
        return {
            restrict: 'E',
            scope: {
                toggle: '&',
            },
            templateUrl: '/blake/static/directives/object-tools/objectTools.html',
            controller: controller,
            controllerAs: 'objTools',
            bindToController: true
        };
    }

    angular.module('blake').directive("objectTools", objectTools);

}());