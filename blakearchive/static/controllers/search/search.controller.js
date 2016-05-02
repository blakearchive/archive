/**
 * Created by lukeluke on 1/26/16.
 */

(function(){

    var controller = function($rootScope,$scope,$location,$routeParams,BlakeDataService,$q){

        var objectMatchingMedium, workMatchingMedium, vm = this;

        $rootScope.showSubMenu = 0;
        $rootScope.worksNavState = false;

        $scope.objectResults = [];
        $scope.copyResults = [];
        $scope.workResults = [];

        $scope.search = function () {
            var objectSearch = BlakeDataService.queryObjects($scope.searchConfig),
                copySearch = BlakeDataService.queryCopies($scope.searchConfig),
                workSearch = BlakeDataService.queryWorks($scope.searchConfig);
            return $q.all([objectSearch,copySearch,workSearch]).then(function(results){
                $scope.objectResults = results[0];
                angular.forEach($scope.objectResults, function(works,type){
                    angular.forEach(works, function(work,index){
                        $scope.getFirstImage(type,index);
                        //$scope.populateWorkCopies(type,index);
                    });
                });
                console.log($scope.objectResults);
                $scope.copyResults = results[1];
                $scope.workResults = results[2];
                $rootScope.$broadcast('searchCtrl::newSearch');
                $location.search('search',encodeURIComponent($scope.searchConfig.searchString));
            });

        };

        $scope.loadSearchPage = function () {
            $location.url(directoryPrefix + "/search?search=" + encodeURIComponent($scope.searchText));
        };

        $scope.searchConfig = {
            useCompDate: true,
            searchTitle: true,
            searchText: true,
            searchWorkInformation: true,
            searchCopyInformation: true,
            searchImageKeywords: true,
            searchNotes: true,
            searchImageDescriptions: true,
            searchIlluminatedBooks: true,
            searchCommercialBookIllustrations: true,
            searchSeparatePrints: true,
            searchDrawingsPaintings: true,
            searchManuscripts: true,
            searchRelatedMaterials: true,
            minDate: 1772,
            maxDate: 1827
        };

        vm.types = {
            'object': {
                'title': {
                    'config': 'searchTitle',
                    'text': 'Objects with a matching title',
                    'showCopies': false,
                    'selectedWork': '-1',
                    'selectedCopy': '-1',
                    'selectedObject': '-1',
                    //'highlight': ''
                },
                'text': {
                    'config': 'searchText',
                    'text': 'Objects with matching text',
                    'showCopies': false,
                    'selectedWork': '-1',
                    'selectedCopy': '-1',
                    'selectedObject': '-1',
                    //'highlight': 'open=text'
                },
                'notes': {
                    'config': 'searchNotes',
                    'text': 'Objects with matching editors\' notes',
                    'showCopies': false,
                    'selectedWork': '-1',
                    'selectedCopy': '-1',
                    'selectedObject': '-1',
                    //'highlight': 'open=notes'
                },
                'tag': {
                    'config': 'searchImageKeywords',
                    'text': 'Objects with a matching image tag',
                    'showCopies': false,
                    'selectedWork': '-1',
                    'selectedCopy': '-1',
                    'selectedObject': '-1',
                    //'highlight': 'open=desc'
                },
                'description': {
                    'config': 'searchImageDescriptions',
                    'text': 'Objects with a matching illustration description',
                    'showCopies': false,
                    'selectedWork': '-1',
                    'selectedCopy': '-1',
                    'selectedObject': '-1',
                    //'highlight': 'open=desc'
                }
            },
            'copy':{
                'title':{
                    'config':'searchTitle',
                    'text': 'Copies with a matching title',
                    //'highlight': ''
                },
                'copy_information':{
                    'config':'searchCopyInformation',
                    'text': 'Copies with matching work information or notes',
                    //'highlight': 'tab=copy-info'
                }
            },
            'work':{
                'title':{
                    'config':'searchTitle',
                    'text': 'Works with a matching title'
                },
                'info':{
                    'config':'searchWorkInformation',
                    'text': 'Works with matching work information or notes'
                }
            }
        };

        /*$scope.setPagination = function(resultType,count){
            $scope.pagination[resultType] = [];
            var numPages = Math.ceil(count / 10), j;
            if(numPages > 1){
                for(j = 1; j <= numPages; j++){
                   $scope.pagination[resultType].push(j);
                }
            }
        };

        $scope.paginate = function (resultType,page){
            switch(resultType){
                case 'title':
                    $scope.searchConfig.objectTitleOffset = (page - 1)  * 10;
                    break;
                case 'text':
                    $scope.searchConfig.objectTextOffset = (page - 1)  * 10;
                    break;
                case 'tag':
                    $scope.searchConfig.objectKeywordsOffset = (page - 1)  * 10;
                    break;
                case 'notes':
                    $scope.searchConfig.objectNotesOffset = (page - 1)  * 10;
                    break;
                case 'description':
                    $scope.searchConfig.objectDescriptionOffset = (page - 1)  * 10;
                    break;
                case 'worktitle':
                    $scope.searchConfig.workTitleOffset = (page - 1)  * 10;
                    break;
                case 'workinfo':
                    $scope.searchConfig.workInformationOffset = (page - 1)  * 10;
                    break;
                default:
                    break;
            }
            $scope.search();
        };*/

        if ($routeParams.search) {
            $scope.searchConfig.searchString = $routeParams.search;
            $scope.search();
        }

        $scope.populateWorkCopies = function (resultType, index) {
            var copyBads = [],
                copyBadMap = {},
                objectIds = [],
                objectIdMap = {};

            if ($scope.selectedObjectSearchWork[resultType] != index) {
                $scope.objectResults[resultType][index][2].forEach(function (copyResults,copyKey) {
                    if (typeof copyResults[0] === "string") {
                        copyBads.push(copyResults[0]);
                        // We're storing a map from bad_id to its results container to simplify updating the results
                        // with retrieved copies.
                        copyBadMap[copyResults[0]] = copyResults;

                        $scope.objectResults[resultType][index][2][copyKey][2].forEach(function (objResults) {
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

                $scope.selectedObjectSearchWork[resultType] = index;
            } else {
                delete $scope.selectedObjectSearchWork[resultType];
            }
        };

        $scope.getFirstImage = function(resultType,workIndex){
            BlakeDataService.getObject($scope.objectResults[resultType][workIndex][2][0][2][0][0]).then(function (results) {
                $scope.objectResults[resultType][workIndex][2][0][2][0][0] = results;
            });
        }

        /*$scope.populateCopyObjects = function (resultType, workIndex, copyIndex) {
            var objectIds = [];
            var objectIdMap = {};

            if ($scope.selectedObjectSearchCopy[resultType] != workIndex) {

                $scope.objectResults[resultType][workIndex][2][copyIndex][2].forEach(function (objResults) {
                    if (typeof objResults[0] === "number") {
                        objectIds.push(objResults[0]);
                        // We're storing a map from bad_id to its results container to simplify updating the results
                        // with retrieved copies.
                        objectIdMap[objResults[0]] = objResults;
                    }
                });

                if (objectIds.length > 0) {
                    BlakeDataService.getObjects(objectIds).then(function (results) {
                        results.forEach(function (result) {
                            // Doing an in-place substitution of the bad_id with the relevant object
                            objectIdMap[result.object_id][0] = result;
                        });
                    });
                }

                $scope.selectedObjectSearchCopy[resultType] = workIndex;
            } else {
                delete $scope.selectedObjectSearchCopy[resultType];
            }
        };*/

        vm.showCopies = function(resultType,workIndex){
            $scope.populateWorkCopies(resultType,workIndex);
            vm.types.object[resultType].showCopies = true;
            vm.types.object[resultType].selectedWork = workIndex;
            if($scope.objectResults[resultType][workIndex][1] == 1){
                vm.types.object[resultType].selectedCopy = 0;
                if($scope.objectResults[resultType][workIndex][2][0][1] == 1){
                    vm.types.object[resultType].selectedObject = 0;
                }
            }
        }
        
        vm.showObjects = function(resultType,copyIndex){
            vm.types.object[resultType].selectedCopy = copyIndex;
            if($scope.objectResults[resultType][vm.types.object[resultType].selectedWork][2][copyIndex][1] == 1){
                vm.types.object[resultType].selectedObject = 0;
            }
        }
        
        vm.showHighlight = function(resultType,objectIndex){
            vm.types.object[resultType].selectedObject = objectIndex;
        }

        vm.closeCopies = function(resultType){
            vm.types.object[resultType].showCopies = false;
            vm.types.object[resultType].selectedWork = -1;
            vm.types.object[resultType].selectedCopy = -1;
            vm.types.object[resultType].selectedObject = -1;
        }
        
        $scope.$on('resize::resize',function(e,w){
            if(w.width > 992){
               vm.search_grid = {'width':(w.width - 80) / 3+'px'};
               vm.copy_container = {'height':(w.height - 100)+'px'};
               vm.copy_container_flex = {'height':(w.height - 250)+'px'};
               vm.object_image_container = {'height':(w.height - 400)+'px'};
            } 
        });

        $scope.selectedObjectSearchCopy = {};
        $scope.selectedObjectSearchWork = {};
        /*$scope.showWorks = true;
        $scope.showCopies = true;
        $scope.showObjects = true;*/

    };

    controller.$inject = ['$rootScope','$scope','$location','$routeParams','BlakeDataService','$q'];

    angular.module('blake').controller('SearchController',controller);

}());
