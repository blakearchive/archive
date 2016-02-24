/**
 * Created by lukeluke on 1/26/16.
 */

(function(){

    var controller = function($rootScope,$scope,$location,$routeParams,BlakeDataService){

        var objectMatchingMedium, workMatchingMedium;

        $rootScope.showSubMenu = 0;

        $scope.results = [];

        $scope.search = function () {
            BlakeDataService.query($scope.searchConfig).then(function (results) {
                $scope.results = results;
                console.log($scope.results);
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

        $scope.pagination = {
            'title': [],
            'text': [],
            'notes': [],
            'tag': [],
            'description': [],
            'worktitle': [],
            'workinfo': []
        };

        $scope.setPagination = function(resultType,count){
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
            console.log($scope.searchConfig);
            $scope.search();
        };

        if ($routeParams.search) {
            $scope.searchConfig.searchString = $routeParams.search;
            $scope.search();
        }

        $scope.populateWorkCopies = function (resultType, index) {
            var copyBads = [];
            var copyBadMap = {};

            if ($scope.selectedObjectSearchWork[resultType] != index) {
                $scope.results.object_results[resultType][index][2].forEach(function (copyResults) {
                    if (typeof copyResults[0] === "string") {
                        copyBads.push(copyResults[0]);
                        // We're storing a map from bad_id to its results container to simplify updating the results
                        // with retrieved copies.
                        copyBadMap[copyResults[0]] = copyResults;
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

                $scope.selectedObjectSearchWork[resultType] = index;
            } else {
                delete $scope.selectedObjectSearchWork[resultType];
            }
        };

        $scope.populateCopyObjects = function (resultType, workIndex, copyIndex) {
            var objectIds = [];
            var objectIdMap = {};

            if ($scope.selectedObjectSearchCopy[resultType][workIndex] != copyIndex) {

                $scope.results.object_results[resultType][workIndex][2][copyIndex][2].forEach(function (objResults) {
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

                $scope.selectedObjectSearchCopy[resultType][workIndex] = copyIndex;
            } else {
                delete $scope.selectedObjectSearchCopy[resultType][workIndex];
            }
        };

        $scope.selectedObjectSearchCopy = {};
        $scope.selectedObjectSearchWork = {};
        $scope.showWorks = true;
        $scope.showCopies = true;
        $scope.showObjects = true;
    };

    controller.$inject = ['$rootScope','$scope','$location','$routeParams','BlakeDataService'];

    angular.module('blake').controller('SearchController',controller);

}());
