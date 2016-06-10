/**
 * Created by lukeluke on 1/26/16.
 */

(function(){

    /** @ngInject */
    var controller = function($rootScope,$scope,$location,$routeParams,BlakeDataService,$q){

        vm = this;

        vm.bds = BlakeDataService;
        vm.queryString = '';

        $rootScope.showSubMenu = 0;
        $rootScope.worksNavState = false;


        $scope.objectResults = [];
        $scope.copyResults = [];
        $scope.workResults = [];

        $scope.search = function () {
            var objectSearch = vm.bds.queryObjects($scope.searchConfig),
                copySearch = vm.bds.queryCopies($scope.searchConfig),
                workSearch = vm.bds.queryWorks($scope.searchConfig);
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
                console.log($scope.copyResults);
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
            $location.url(directoryPrefix + "/search?search=" + encodeURIComponent($scope.searchConfig.searchString));
        };

        $scope.searchConfig = {
            useCompDate: true,
            searchAllFields: true,
            searchTitle: false,
            searchText: false,
            searchNotes: false,
            searchImageDescriptions: false,
            searchImageKeywords: false,
            searchWorks: false,
            searchCopies: false,
            searchAllTypes: true,
            searchIlluminatedBooks: false,
            searchCommercialBookIllustrations: false,
            searchSeparatePrints: false,
            searchDrawingsPaintings: false,
            searchManuscripts: false,
            searchRelatedMaterials: false,
            minDate: 1772,
            maxDate: 1827
        };

        vm.changeType = function(){
            var check = 0;
            var types = ['searchIlluminatedBooks','searchCommercialBookIllustrations','searchSeparatePrints','searchDrawingsPaintings','searchManuscripts','searchRelatedMaterials'];
            angular.forEach(types, function(type){
                if($scope.searchConfig[type]){
                    check++;
                }
            });
            $scope.searchConfig.searchAllTypes = check > 0 ? false : true;
            $scope.search();
        }

        vm.allTypes = function(){
            var types = ['searchIlluminatedBooks','searchCommercialBookIllustrations','searchSeparatePrints','searchDrawingsPaintings','searchManuscripts','searchRelatedMaterials'];
            if($scope.searchConfig.searchAllTypes){
                angular.forEach(types, function(type){
                    $scope.searchConfig[type] = false;
                });
            }
            $scope.search();
        }

        vm.changeField = function(){
            var check = 0;
            var fields = ['searchTitle','searchText','searchNotes','searchImageDescriptions','searchImageKeywords','searchWorks','searchCopies'];
            angular.forEach(fields, function(field){
                if($scope.searchConfig[field]){
                    check++;
                }
            });
            $scope.searchConfig.searchAllFields = check > 0 ? false : true;
        }

        vm.allFields = function(){
            var fields = ['searchTitle','searchText','searchNotes','searchImageDescriptions','searchImageKeywords','searchWorks','searchCopies'];
            if($scope.searchConfig.searchAllFields){
                angular.forEach(fields, function(field){
                    $scope.searchConfig[field] = false;
                });
            }
        }

        if ($routeParams.search) {
            //console.log($scope.searchConfig);
            //console.log($scope.searchConfig.searchString)
            $scope.searchConfig.searchString = $routeParams.search;
            $scope.search();
        }

    }

    angular.module('blake').controller('SearchController',controller);

}());
