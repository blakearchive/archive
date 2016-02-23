/**
 * Created by nathan on 2/3/15.
 */

(function(){

    var controller = function($scope,$sessionStorage){

        var vm = this;

        vm.addComparisonObject = function (obj) {
            var i, objInList = false;
            // Don't add an object to the list twice
            for (i = $sessionStorage.comparisonObjects.length; i--;) {
                if ($sessionStorage.comparisonObjects[i].object_id == obj.object_id) {
                    objInList = true;
                    break;
                }
            }
            if (!objInList) {
                $sessionStorage.comparisonObjects.push(obj);
            }
        };

        vm.removeComparisonObject = function (obj) {
            var i;
            for (i = $sessionStorage.comparisonObjects.length; i--;) {
                if ($sessionStorage.comparisonObjects[i].object_id == obj.object_id) {
                    $sessionStorage.comparisonObjects.splice(i, 1);
                    break;
                }
            }
        };

        vm.clearComparisonObjects = function () {
            $sessionStorage.comparisonObjects = [];
            $sessionStorage.comparisonObjects.unshift(vm.copy.selectedObject);
        };

        vm.isComparisonObject = function (obj) {
            for (var i = $sessionStorage.comparisonObjects.length; i--;) {
                if ($sessionStorage.comparisonObjects[i].object_id == obj.object_id) {
                    return true;
                }
            }
            return false;
        };

        vm.selectAll = function () {
            if(angular.isDefined(vm.copy.selectedObject.matrix)){
                var obj_size = vm.copy.selectedObject.matrix.length;
                vm.clearComparisonObjects(); // Clear out old comparisons

                if(!vm.selectedAll) {
                    vm.compareText = "Clear All Objects";
                    vm.selectedAll = true;

                    // Add imgs to compare main viewer img too.
                    for (var i = obj_size; i--;) {
                        vm.copy.selectedObject.matrix[i].Selected = true;
                        vm.addComparisonObject(vm.copy.selectedObject.matrix[i]);
                    }

                } else {
                    vm.compareText = "Select All Objects";
                    vm.selectedAll = false;

                    for (var j = obj_size; j--;) {
                        vm.copy.selectedObject.matrix[j].Selected = false;
                    }

                    vm.clearComparisonObjects();
                }
            }
        };

        // Add/remove single object for comparison
        vm.selectOne = function(obj) {
            var key = vm.copy.selectedObject.matrix.indexOf(obj);

            if(!vm.copy.selectedObject.matrix[key].Selected) {

                vm.copy.selectedObject.matrix[key].Selected = true;
                vm.addComparisonObject(obj);

            } else {

                vm.copy.selectedObject.matrix[key].Selected = false;
                vm.removeComparisonObject(obj);

            }
        };

        vm.activateCompare = function(){
            $sessionStorage.view = {
                mode: 'compare',
                scope: 'image'
            }
        }

        vm.compareText = "Select All Objects";
        vm.selectedAll = false;

        $scope.$on('copyCtrl::objectChanged',function(){
            vm.compareText = "Select All Objects";
            vm.selectedAll = false;
            vm.clearComparisonObjects();
        })

    }

    controller.$inject = ['$scope','$sessionStorage'];

    var objectsFromSameMatrix = function(){
        return {
            restrict: 'E',
            templateUrl: "/blake/static/directives/objects-from-same-matrix/objectsFromSameMatrix.html",
            controller: controller,
            controllerAs: 'matrix',
            scope: {
                copy: '=copy'
            },
            bindToController: true
        }
    }

    angular.module('blake').directive('objectsFromSameMatrix',objectsFromSameMatrix);

}());