angular.module("blake").controller("ObjectsFromSameController", function($rootScope,BlakeDataService,CompareObjectsFactory){
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
            
            if(vm.type=='textmatch') {
                vm.getFragmentMatch = function(desc_id){
                BlakeDataService.getFragmentPair(vm.bds.object.desc_id,obj.desc_id).then(function(resultingFragmentPair) {
                    vm.fragment = resultingFragmentPair.fragment;     
                });
                console.log(vm.bds.object.desc_id);
                //console.log("blah");
                console.log(vm.fragment);
            }
        
        }
    };


    vm.activateCompare = function(){
        $rootScope.worksNavState = false;
        $rootScope.view.mode = 'compare';
        $rootScope.view.scope = 'image';
    }


});

angular.module('blake').directive('objectsFromSame', function () {
    let link = function(scope,ele,attr,vm){
        let type = function(){ return vm.cof.comparisonType };
        scope.$watch(type,function(newVal,oldVal){
            if(oldVal && newVal != vm.type){
                vm.compareText = "Select All Objects";
                vm.selectedAll = false;
            }
        },true);
    };

    return {
        restrict: 'E',
        template: require("html-loader!./objectsFromSame.html"),
        controller: "ObjectsFromSameController",
        controllerAs: 'fromSame',
        scope: {
            type: '@type'
        },
        bindToController: true,
        link: link
    }
});