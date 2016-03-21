(function(){

    var controller = function($window,$scope){
        var vm = this;

        vm.newWindow = function(object){
            $window.open('/blake/new-window/enlargement/'+object.copy_bad_id+'?objectId='+object.object_id, '_blank','width=800, height=600');
        }
        $scope.$on('copyCtrl::objectChanged',function(e,d){
            vm.object = d;
        });
        $scope.$on('compareCtrl::objectChanged',function(e,d){
            vm.object = d;
        });
    }

    controller.$inject = ['$window','$scope'];

    var objectTools = function(){
        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/object-tools/objectTools.html',
            controller: controller,
            scope: {
                toggle: '&'
            },
            controllerAs: 'objTools',
            bindToController: true
        };
    }

    angular.module('blake').directive("objectTools", objectTools);

}());