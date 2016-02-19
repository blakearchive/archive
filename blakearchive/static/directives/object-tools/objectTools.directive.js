(function(){

    var controller = function($window){
        var vm = this;

        vm.newWindow = function(copy){
            $window.open('/blake/enlargement/'+copy.bad_id+'/'+copy.selectedObject.object_id+'/object-tab', '_blank','width=500, height=400');
        }
    }

    controller.$inject = ['$window'];

    var objectTools = function(){
        return {
            restrict: 'E',
            scope: {
                toggle: '&',
            },
            templateUrl: '/blake/static/directives/object-tools/objectTools.html',
            controller: controller,
            scope: {
                copy: '=copy'
            },
            controllerAs: 'objTools',
            bindToController: true
        };
    }

    angular.module('blake').directive("objectTools", objectTools);

}());