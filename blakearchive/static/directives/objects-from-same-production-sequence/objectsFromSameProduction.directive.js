/**
 * Created by nathan on 2/3/15.
 */

(function(){

    var controller = function($scope,BlakeDataService){


        var vm = this;

        vm.init = function(){
            var obj = BlakeDataService.selectedObject;
            if (obj) {
                vm.item = obj;
                vm.objects = BlakeDataService.sameSequence;
            }
        }

        vm.init();

        $scope.$on("update:object", function () {

            vm.init();

        });
    }

    controller.$inject = ['$scope','BlakeDataService'];

    var objectsFromSameProduction = function(){
        return {
            restrict: 'E',
            templateUrl: "/blake/static/directives/objects-from-same-production-sequence/objectsFromSameProduction.html",
            controller: controller,
            controllerAs: 'sequence',
            bindToController: true,
        }
    }

    angular.module('blake').directive("objectsFromSameProductionSequence", objectsFromSameProduction);

})();


