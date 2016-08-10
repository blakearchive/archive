/**
 * Created by nathan on 2/3/15.
 */

(function(){

    /** @ngInject */
    var controller = function($rootScope,BlakeDataService,CompareObjectsFactory){

        var vm = this;
        vm.bds = BlakeDataService;
        vm.cof = CompareObjectsFactory;
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
            vm.cof.checkCompareType(vm.type);
            if(vm.cof.isComparisonObject(obj)) {
                vm.cof.removeComparisonObject(obj);
            } else {
                vm.cof.addComparisonObject(obj);
            }
        };


        vm.activateCompare = function(){
            $rootScope.worksNavState = false;
            $rootScope.view.mode = 'compare';
            $rootScope.view.scope = 'image';
        }

    }

    var link = function(scope,ele,attr,vm){
        var type = function(){ return vm.cof.comparisonType };
        scope.$watch(type,function(newVal,oldVal){
            if(oldVal && newVal != vm.type){
                vm.compareText = "Select All Objects";
                vm.selectedAll = false;
            }
        },true);
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
            bindToController: true,
            link: link
        }
    }

    angular.module('blake').directive('objectsFromSame',objectsFromSame);

}());