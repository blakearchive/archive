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

            if(angular.isArray(vm.resultTree[index][2])){

                vm.resultTree[index][2].forEach(function (copyResults,copyKey) {
                    if (typeof copyResults[0] === "string") {
                        copyBads.push(copyResults[0]);
                        // We're storing a map from bad_id to its results container to simplify updating the results
                        // with retrieved copies.
                        copyBadMap[copyResults[0]] = copyResults;

                        if(angular.isArray(vm.resultTree[index][2][copyKey][2])){

                            vm.resultTree[index][2][copyKey][2].forEach(function (objResults) {
                                objectIds.push(objResults[0]);
                                // We're storing a map from bad_id to its results container to simplify updating the results
                                // with retrieved copies.
                                objectIdMap[objResults[0]] = objResults;
                            });

                        }
                    }
                });

            }

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
                        objectIdMap[result.desc_id][0] = result;
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

        vm.nextResult = function(){
            if(vm.selectedWork + 1 < vm.resultTree.length){
                vm.selectedWork += 1;
                vm.selectedCopy = 0;
                vm.selectedObject = 0;
                vm.populateTree(vm.selectedWork);
                $rootScope.$broadcast('searchCtrl::changeResult',{type:vm.type,objectIndex:vm.selectedWork})
            }
        }
        vm.previousResult = function(){
            if(vm.selectedWork > 0){
                vm.selectedWork -= 1;
                vm.selectedCopy = 0;
                vm.selectedObject = 0;
                vm.populateTree(vm.selectedWork);
                $rootScope.$broadcast('searchCtrl::changeResult',{type:vm.type,objectIndex:vm.selectedWork})
            }
        }
        
        vm.showHighlight = function(objectIndex){
            vm.selectedObject = objectIndex;
            if(vm.tree == 'copy'){
                vm.selectedCopy = objectIndex;
            }
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

        //TODO: Directive has become too large with too many ng-ifs because of the variations between work,copy,object
        //Need to bust these out into more directives or figure out a better way to handle them

        vm.getHandprintDescription = function(workIndex){
            switch(vm.tree){
                case 'work':
                    return;
                default:
                    var string = '<strong>'+vm.resultTree[workIndex][0].title+'</strong><br>',
                        endstring = '';
                    if(vm.resultTree[workIndex][1] > 1){
                        string += '('+vm.resultTree[workIndex][1] + ' results';
                        endstring = ')';
                    }
                    if(vm.resultTree[workIndex][2].length > 1){
                        string += ' in '+vm.resultTree[workIndex][2].length+ ' copies';
                    }
                    string += endstring;
                    return string;
            }
        }
        vm.getPreviewHref = function(){
            if(vm.selectedWork == -1){
                return;
            }
            switch(vm.tree){
                case 'object':
                    var copyBad = vm.resultTree[vm.selectedWork][2][vm.selectedCopy][0].bad_id,
                        descId = vm.resultTree[vm.selectedWork][2][vm.selectedCopy][2][vm.selectedObject][0].desc_id;
                    return copyBad+'?descId='+descId;
                case 'copy':
                    return vm.resultTree[vm.selectedWork][2][vm.selectedCopy][0].bad_id;
                case 'work':
                    return
            }
        }

        vm.getPreviewImage = function(){
            if(vm.selectedWork == -1){
                return;
            }
            switch(vm.tree){
                case 'object':
                    return vm.resultTree[vm.selectedWork][2][vm.selectedCopy][2][vm.selectedObject][0].dbi
                case 'copy':
                    return vm.resultTree[vm.selectedWork][2][vm.selectedCopy][0].image;
                case 'work':
                    return
            }
        }

        vm.getWorkImage = function(workIndex){
            switch(vm.tree){
                case 'object':
                    return vm.resultTree[workIndex][2][0][2][0][0].dbi;
                case 'copy':
                    return vm.resultTree[workIndex][2][0][0].image;
                case 'work':
                    return '';
            }
        }

        vm.getPreviewLabel = function(){
            if(vm.selectedWork == -1){
                return;
            }
            switch(vm.tree){
                case 'object':
                    return vm.resultTree[vm.selectedWork][2][vm.selectedCopy][2][vm.selectedObject][0].full_object_id
                case 'copy':
                    return 'Copy '+vm.resultTree[vm.selectedWork][2][vm.selectedCopy][0].archive_copy_id;
                case 'work':
                    return
            }
        }


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
                type: '@type',
                tree: '@tree'
            },
            controllerAs: 'esr',
            bindToController: true
        };
    }


    angular.module('blake').directive('searchResults', searchResults);

}());