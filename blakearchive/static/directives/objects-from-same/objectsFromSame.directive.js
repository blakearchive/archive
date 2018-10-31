angular.module("blake").controller("ObjectsFromSameController", function($rootScope,BlakeDataService,CompareObjectsFactory){
    var vm = this;
    vm.bds = BlakeDataService;
    vm.cof = CompareObjectsFactory;
    vm.compareText = "Select All Objects";
    vm.selectedAll = false;
    vm.fragment = '';

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

            if(vm.type=='textmatch') {
                var thisFragmentPair;
              BlakeDataService.getFragmentPair(vm.bds.object.desc_id,obj.desc_id).then(function(resultingFragmentPair) {

                    if (resultingFragmentPair.fragment.indexOf("br") == false) {
                        thisFragmentPair = resultingFragmentPair.fragment;
                    }
                    else {
                        BlakeDataService.getFragmentPair(obj.desc_id,vm.bds.object.desc_id).then(function(resultingFragmentPair2) {
                            thisFragmentPair = resultingFragmentPair2;
                        });
                    }


                  for(i=0; i< vm.bds.fragment_pairs.length;i++){
                    if (vm.bds.fragment_pairs[i] == thisFragmentPair.fragment){
                      console.log("removed it! --> "+vm.bds.fragment_pairs[i]);
                      delete vm.bds.fragment_pairs[i];
                    }
                  }
              });
            }
        } else {
            vm.cof.addComparisonObject(obj);

            if(vm.type=='textmatch') {

               BlakeDataService.getFragmentPair(vm.bds.object.desc_id,obj.desc_id).then(function(resultingFragmentPair) {
                    if (resultingFragmentPair.fragment.indexOf("br") == false) {
                        vm.bds.fragment_pairs.push(resultingFragmentPair.fragment);
                    }
                    else {
                        BlakeDataService.getFragmentPair(obj.desc_id,vm.bds.object.desc_id).then(function(resultingFragmentPair2) {
                            vm.bds.fragment_pairs.push(resultingFragmentPair2.fragment);
                        });
                    }
               });
            }

        }
    };


    vm.activateCompare = function(){
        $rootScope.worksNavState = false;
        $rootScope.view.mode = 'compare';
        $rootScope.view.scope = 'image';
        //console.log("selected tab is: "+$rootScope.selectedTab)
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
