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
            if(angular.isDefined(vm.objects)){
                var obj_size = vm.objects.length;
                vm.clearComparisonObjects(); // Clear out old comparisons

                if(!vm.selectedAll) {
                    vm.compareText = "Clear All Objects";
                    vm.selectedAll = true;

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
            }
        };

        // Add/remove single object for comparison
        vm.selectOne = function(obj) {
            /*if($sessionStorage.comparisonType != vm.type){
                vm.clearComparisonObjects();
            }*/
            var key = vm.objects.indexOf(obj);

            if(!vm.objects[key].Selected) {

                vm.objects[key].Selected = true;
                vm.addComparisonObject(obj);

            } else {

                vm.objects[key].Selected = false;
                vm.removeComparisonObject(obj);

            }
        };

        vm.activateCompare = function(){
            $sessionStorage.comparisonObjects[0].isActive = true;
            $sessionStorage.view = {
                mode: 'compare',
                scope: 'image'
            }
        }

        vm.compareText = "Select All Objects";
        vm.selectedAll = false;
        //vm.checkSelected();

        $scope.$on('copyCtrl::objectChanged',function(){
            vm.compareText = "Select All Objects";
            vm.selectedAll = false;
            //vm.checkSelected();
        })

        $scope.$on('copyTabs::changeTab',function(){
            var count = 0;
            angular.forEach($sessionStorage.comparisonObjects,function(comparisonObj){
               angular.forEach(vm.objects, function(obj){
                   if(comparisonObj.object_id == obj.object_id){
                       obj.Selected = true;
                       count++;
                   } else {
                       obj.Selected = false;
                   }
               })
           })
           if(count == 0){
               vm.compareText = "Select All Objects";
               vm.selectedAll = false;
           }
        });

    }

    controller.$inject = ['$scope','$sessionStorage'];


    var objectsFromSame = function(){
        return {
            restrict: 'E',
            templateUrl: "/blake/static/directives/objects-from-same/objectsFromSame.html",
            controller: controller,
            controllerAs: 'fromSame',
            scope: {
                copy: '=copy',
                objects: '=objects',
                type: '@type'
            },
            bindToController: true
        }
    }

    angular.module('blake').directive('objectsFromSame',objectsFromSame);

}());