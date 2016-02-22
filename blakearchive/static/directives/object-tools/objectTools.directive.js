(function(){

    var controller = function($window){
        var vm = this;

        vm.newWindow = function(copy){
            $window.open('/blake/new-window/enlargement/'+copy.bad_id+'?objectId='+copy.selectedObject.object_id, '_blank','width=800, height=600');
        }
    }

    controller.$inject = ['$window'];

    var objectTools = function(){
        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/object-tools/objectTools.html',
            controller: controller,
            scope: {
                copy: '=copy',
                toggle: '&'
            },
            controllerAs: 'objTools',
            bindToController: true
        };
    }

    angular.module('blake').directive("objectTools", objectTools);

}());