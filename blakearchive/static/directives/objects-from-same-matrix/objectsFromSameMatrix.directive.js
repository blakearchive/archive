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
                vm.objects = BlakeDataService.sameMatrix;
            }

            // Add/remove all objects for comparison
            vm.compareText = "Select All Objects";
            vm.selectedAll = false;
            BlakeDataService.clearComparisonObjects();
        }

        vm.init();

        $scope.$on("update:object", function () {
            vm.init();
        });

        vm.selectAll = function () {
            var obj_size = vm.objects.length;
            BlakeDataService.clearComparisonObjects(); // Clear out old comparisons

            if(!vm.selectedAll) {
                vm.compareText = "Clear All Objects";
                vm.selectedAll = true;

                // Add main viewer img
                BlakeDataService.addComparisonObject(vm.item);

                // Add imgs to compare main viewer img too.
                for (var i = obj_size; i--;) {
                    vm.objects[i].Selected = true;
                    BlakeDataService.addComparisonObject(vm.objects[i]);
                    console.log(BlakeDataService.comparisonObjects);
                }
            } else {
                vm.compareText = "Select All Objects";
                vm.selectedAll = false;

                for (var j = obj_size; j--;) {
                    vm.objects[j].Selected = false;
                }

                BlakeDataService.clearComparisonObjects();
            }
        };

        // Add/remove single object for comparison
        vm.selectOne = function(obj) {
            if(!obj.Selected) {
                obj.Selected = false;
                BlakeDataService.removeComparisonObject(obj);
            } else {
                obj.Selected = true;
                BlakeDataService.addComparisonObject(obj);
            }

            // Add main viewer img
            if(BlakeDataService.getComparisonObjects) {
                BlakeDataService.addComparisonObject(vm.item);
            }
        };
    }

    controller.$inject = ['$scope','BlakeDataService'];

    var objectsFromSameMatrix = function(){
        return {
            restrict: 'E',
            templateUrl: "/blake/static/directives/objects-from-same-matrix/objectsFromSameMatrix.html",
            controller: controller,
            controllerAs: 'matrix',
            bindToController: true
        }
    }

    angular.module('blake').directive('objectsFromSameMatrix',objectsFromSameMatrix);

}());