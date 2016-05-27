/**
 * Created by nathan on 2/3/15.
 */

(function(){

    /** @ngInject */
    var controller = function($scope,$rootScope,$sessionStorage,BlakeDataService,CompareObjectsFactory){

        var vm = this;
        vm.bds = BlakeDataService;
        vm.cof = CompareObjectsFactory;
        vm.$storage = $sessionStorage;
        vm.compareText = "Select All Objects";
        vm.selectedAll = false;

        vm.selectAll = function () {
            vm.cof.checkCompareType(vm.type);
            if(!vm.selectedAll) {
                vm.compareText = "Clear All Objects";
                vm.selectedAll = true;
                vm.cof.selectAll(vm.bds.object[vm.type]);

            } else {
                vm.compareText = "Select All Objects";
                vm.selectedAll = false;
                vm.cof.clearComparisonObjects();
            }
        };

        // Add/remove single object for comparison
        vm.selectOne = function(obj) {
            if(vm.cof.isComparisonObject(obj)) {
                vm.cof.removeComparisonObject(obj);
            } else {
                vm.cof.checkCompareType(vm.type);
                vm.cof.addComparisonObject(obj);
            }
        };


        vm.activateCompare = function(){
            $rootScope.worksNavState = false;
            $sessionStorage.view = {
                mode: 'compare',
                scope: 'image'
            }
        }

        /*$scope.$on('copyCtrl::objectChanged',function(){
            vm.compareText = "Select All Objects";
            vm.selectedAll = false;
            //vm.checkSelected();
        })

        $scope.$watch(function(){return $sessionStorage.comparisonType},function(newVal){
            if(newVal != vm.type){
                vm.compareText = "Select All Objects";
                vm.selectedAll = false;
            }
        })*/

    }

    var objectsFromSame = function(){
        return {
            restrict: 'E',
            templateUrl: "/blake/static/directives/objects-from-same/objectsFromSame.html",
            controller: controller,
            controllerAs: 'fromSame',
            scope: {
                type: '@type'
            },
            bindToController: true
        }
    }

    angular.module('blake').directive('objectsFromSame',objectsFromSame);

}());