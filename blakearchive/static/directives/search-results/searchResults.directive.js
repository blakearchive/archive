(function(){

    var controller = function($scope,$rootScope,BlakeDataService){
        var vm = this;
        
        vm.selectedWork = -1;
        vm.selectedCopy = 0;
        vm.selectedObject = 0;
        
        vm.populateTree = function (index) {
            var copyBads = [],
                copyBadMap = {},
                objectIds = [],
                objectIdMap = {};

            vm.resultTree[index][2].forEach(function (copyResults,copyKey) {
                if (typeof copyResults[0] === "string") {
                    copyBads.push(copyResults[0]);
                    // We're storing a map from bad_id to its results container to simplify updating the results
                    // with retrieved copies.
                    copyBadMap[copyResults[0]] = copyResults;

                    vm.resultTree[index][2][copyKey][2].forEach(function (objResults) {
                        if (typeof objResults[0] === "number") {
                            objectIds.push(objResults[0]);
                            // We're storing a map from bad_id to its results container to simplify updating the results
                            // with retrieved copies.
                            objectIdMap[objResults[0]] = objResults;
                        }
                    });
                }
            });

            if (copyBads.length > 0) {
                BlakeDataService.getCopies(copyBads).then(function (results) {
                    results.forEach(function (result) {
                        // Doing an in-place substitution of the bad_id with the relevant object
                        copyBadMap[result.bad_id][0] = result;
                    });
                });
            }

            if (objectIds.length > 0) {
                BlakeDataService.getObjects(objectIds).then(function (results) {
                    results.forEach(function (result) {
                        // Doing an in-place substitution of the bad_id with the relevant object
                        objectIdMap[result.object_id][0] = result;
                    });
                });
            }

        };

        vm.showCopies = function(workIndex){
            vm.selectedCopy = 0;
            vm.selectedObject = 0;
            vm.populateTree(workIndex);
            vm.selectedWork = workIndex;
            $rootScope.$broadcast('searchResultDirective::showCopies',{type:vm.type});
            /*if(vm.resultTree[workIndex][2].length == 1){
                vm.selectedCopy = 0;
                if(vm.resultTree[workIndex][2][0][2].length == 1){
                    vm.selectedObject = 0;
                }
            }*/
        }
        
        vm.showObjects = function(copyIndex){
            vm.selectedCopy = copyIndex;
            /*if(vm.resultTree[vm.selectedWork][2][copyIndex][2].length == 1){
                vm.selectedObject = 0;
            }*/
        }
        
        vm.showHighlight = function(objectIndex){
            vm.selectedObject = objectIndex;
        }

        vm.closeCopies = function(resultType){
            vm.types.object[resultType].showCopies = false;
            vm.types.object[resultType].selectedWork = -1;
            vm.types.object[resultType].selectedCopy = -1;
            vm.types.object[resultType].selectedObject = -1;
        }
        
        $scope.$on('resize::resize',function(e,w){
            if(w.width > 992){
               //vm.search_grid = {'width':(w.width - 80) / 3+'px'};
               //vm.copy_container = {'height':(w.height - 100)+'px'};
               //vm.copy_container_flex = {'height':(w.height - 250)+'px'};
               vm.object_image_container = {'height':(w.height - 400)+'px'};
            } 
        });

        $scope.$on('searchResultDirective::showCopies',function(e,d){
            if(d.type !== vm.type){
                vm.selectedWork = -1;
            }
        })


    }

    controller.$inject = ['$scope','$rootScope','BlakeDataService'];

    var searchResults = function(){
        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/search-results/searchResults.html',
            controller: controller,
            scope: {
                resultTree: '=results',
                highlight: '@highlight',
                label: '@label',
                type: '@type'
            },
            controllerAs: 'esr',
            bindToController: true
        };
    }


    angular.module('blake').directive('searchResults', searchResults);

}());