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
                        //$scope.populateWorkCopies(type,index);
                        BlakeDataService.getObject($scope.objectResults[type][index][2][0][2][0][0]).then(function (results) {
                            $scope.objectResults[type][index][2][0][2][0][0] = results;
                        });
                    });
                });
                $scope.copyResults = results[1];
                angular.forEach($scope.copyResults, function(works,type){
                    angular.forEach(works, function(work,index){
                        //$scope.populateWorkCopies(type,index);
                        BlakeDataService.getCopy($scope.copyResults[type][index][2][0][0]).then(function (results) {
                            $scope.copyResults[type][index][2][0][0] = results;
                        });
                    });
                });
                $scope.workResults = results[2];
                angular.forEach($scope.workResults, function(results,type){
                    var arrayedResults = [];
                    angular.forEach(results.results,function(work){
                        var array = [work,1];
                        arrayedResults.push(array);
                    });
                    $scope.workResults[type] = arrayedResults;
                });
                console.log($scope.objectResults);
                console.log($scope.workResults);
                $rootScope.$broadcast('searchCtrl::newSearch');
                //$location.search('search',encodeURIComponent($scope.searchConfig.searchString));
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

    }

    controller.$inject = ['$rootScope','$scope','$location','$routeParams','BlakeDataService','$q'];

    angular.module('blake').controller('SearchController',controller);

}());
