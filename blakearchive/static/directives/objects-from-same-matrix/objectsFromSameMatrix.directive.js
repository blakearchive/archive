/**
 * Created by nathan on 2/3/15.
 */

(function(){

    var controller = function($scope,$localStorage){

        var vm = this;

        vm.addComparisonObject = function (obj) {
            var i, objInList = false;
            // Don't add an object to the list twice
            for (i = $localStorage.comparisonObjects.length; i--;) {
                if ($localStorage.comparisonObjects[i].object_id == obj.object_id) {
                    objInList = true;
                    break;
                }
            }
            if (!objInList) {
                $localStorage.comparisonObjects.push(obj);
            }
        };

        vm.removeComparisonObject = function (obj) {
            var i;
            for (i = $localStorage.comparisonObjects.length; i--;) {
                if ($localStorage.comparisonObjects[i].object_id == obj.object_id) {
                    $localStorage.comparisonObjects.splice(i, 1);
                    break;
                }
            }
        };

        vm.clearComparisonObjects = function () {
            $localStorage.comparisonObjects = [];
        };

        vm.isComparisonObject = function (obj) {
            for (var i = $localStorage.comparisonObjects.length; i--;) {
                if ($localStorage.comparisonObjects[i].object_id == obj.object_id) {
                    return true;
                }
            }
            return false;
        };


        vm.selectAll = function () {
            var obj_size = vm.objects.length;
            vm.clearComparisonObjects(); // Clear out old comparisons

            if(!vm.selectedAll) {
                vm.compareText = "Clear All Objects";
                vm.selectedAll = true;

                // Add main viewer img
                vm.addComparisonObject(vm.item);

                // Add imgs to compare main viewer img too.
                for (var i = obj_size; i--;) {
                    vm.objects[i].Selected = true;
                    vm.addComparisonObject(vm.objects[i]);
                }
            } else {
                vm.compareText = "Select All Objects";
                vm.selectedAll = false;

                for (var j = obj_size; j--;) {
                    vm.objects[j].Selected = false;
                }

                vm.clearComparisonObjects();
            }
        };

        // Add/remove single object for comparison
        vm.selectOne = function(obj) {
            var key = vm.objects.indexOf(obj);
            if(!vm.objects[key].Selected) {
                vm.objects[key].Selected = true;
                //obj.Selected = false;
                vm.addComparisonObject(obj);
            } else {
                vm.objects[key].Selected = false;
                vm.removeComparisonObject(obj);
            }

            // Add main viewer img
            if(vm.getComparisonObjects) {
                vm.addComparisonObject(vm.item);
            }
        };

        vm.compareText = "Select All Objects";
        vm.selectedAll = false;

        $scope.$on('copyCtrl::changeObject',function(){
            vm.compareText = "Select All Objects";
            vm.selectedAll = false;
            vm.clearComparisonObjects();
        })

    }

    controller.$inject = ['$scope','$localStorage'];

    var objectsFromSameMatrix = function(){
        return {
            restrict: 'E',
            templateUrl: "/blake/static/directives/objects-from-same-matrix/objectsFromSameMatrix.html",
            controller: controller,
            controllerAs: 'matrix',
            scope: {
                objects: '=objects',
                item: '=item',
                copy: '=copy',
                work: '=work',
            },
            bindToController: true
        }
    }

    angular.module('blake').directive('objectsFromSameMatrix',objectsFromSameMatrix);

}());