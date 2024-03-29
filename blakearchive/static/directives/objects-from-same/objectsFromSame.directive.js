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
              BlakeDataService.getFragmentPair(vm.bds.object.desc_id,obj.desc_id).then(function(resultingFragmentPair) {
                  console.log(resultingFragmentPair);
                    if (resultingFragmentPair.fragment.includes("<br>")) {
                      for(i=0; i< vm.bds.fragment_pairs.length;i++){
                        if (vm.bds.fragment_pairs[i] == resultingFragmentPair.fragment){
                          console.log("removed it! --> "+vm.bds.fragment_pairs[i]);
                          delete vm.bds.fragment_pairs[i];
                        }
                      }
                    }
                    else {
                       BlakeDataService.getFragmentPair(obj.desc_id,vm.bds.object.desc_id).then(function(resultingFragmentPair2) {
                            for(i=0; i< vm.bds.fragment_pairs.length;i++){
                                if (vm.bds.fragment_pairs[i] == resultingFragmentPair2.fragment){
                                    console.log("removed it! --> "+vm.bds.fragment_pairs[i]);
                                    delete vm.bds.fragment_pairs[i];
                                }
                            }
                        }); 
                    }
              });
            }
        } else {
            vm.cof.addComparisonObject(obj);

            if(vm.type=='textmatch') {

               BlakeDataService.getFragmentPair(vm.bds.object.desc_id,obj.desc_id).then(function(resultingFragmentPair) {
                    console.log(vm.bds.object.desc_id);
                    console.log(obj.desc_id);
                    if (resultingFragmentPair.fragment.includes("<br>")) {
                        vm.bds.fragment_pairs.push(resultingFragmentPair.fragment);
                        console.log(vm.bds.fragment_pairs);
                        console.log(resultingFragmentPair.fragment);
                        console.log("true");
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
        if(vm.type=='textmatch') {
            $rootScope.view.scope = 'both'
        }
        else {
            $rootScope.view.scope = 'image';
        }
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
