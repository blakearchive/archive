/**
 * Created by lukeluke on 1/26/16.
 */

(function(){

    var controller = function($rootScope,$scope,$location,$routeParams,BlakeDataService){

        var objectMatchingMedium, workMatchingMedium;

        $rootScope.showSubMenu = 0;

        $scope.search = function () {
            BlakeDataService.queryObjects($scope.searchConfig).then(function (results) {
                $scope.results = results;
            });
        };

        $scope.loadSearchPage = function () {
            $location.url(directoryPrefix + "/search?search=" + encodeURIComponent($scope.searchText));
        };

        $scope.searchConfig = {
            useCompDate: true,
            searchTitle: true,
            searchIlluminatedBooks: true,
            searchCommercialBookIllustrations: true,
            searchSeparatePrints: true,
            searchDrawingsPaintings: true,
            searchManuscripts: true,
            searchRelatedMaterials: true,
            minDate: 1772,
            maxDate: 1827
        };

        objectMatchingMedium = function (result) {
            if ($scope.searchConfig.searchIlluminatedBooks && result.work_medium == "illbk") return true;
            if ($scope.searchConfig.searchCommercialBookIllustrations &&
                (result.work_medium == "comb" || result.work_medium == "comdes" || result.work_medium == "comeng")) return true;
            if ($scope.searchConfig.searchSeparatePrints &&
                (result.work_medium == "spb" || result.work_medium == "spdes" || result.work_medium == "speng")) return true;
            if ($scope.searchConfig.searchCommercialBookIllustrations &&
                (result.work_medium == "comb" || result.work_medium == "comdes" || result.work_medium == "comeng")) return true;
            if ($scope.searchConfig.searchDrawingsPaintings &&
                (result.work_medium == "cprint" || result.work_medium == "penc" || result.work_medium == "penink" ||
                result.work_medium == "mono" || result.work_medium == "wc" || result.work_medium == "paint")) return true;
            if ($scope.searchConfig.searchManuscripts &&
                (result.work_medium == "ms" || result.work_medium == "ltr" || result.work_medium == "te")) return true;
            if ($scope.searchConfig.searchRelatedMaterials &&
                (result.work_medium == "rmb" || result.work_medium == "rmoth")) return true;
            return false;
        };

        workMatchingMedium = function (result) {
            if ($scope.searchConfig.searchIlluminatedBooks && result.medium == "illbk") return true;
            if ($scope.searchConfig.searchCommercialBookIllustrations &&
                (result.medium == "comb" || result.medium == "comdes" || result.medium == "comeng")) return true;
            if ($scope.searchConfig.searchSeparatePrints &&
                (result.medium == "spb" || result.medium == "spdes" || result.medium == "speng")) return true;
            if ($scope.searchConfig.searchCommercialBookIllustrations &&
                (result.medium == "comb" || result.medium == "comdes" || result.medium == "comeng")) return true;
            if ($scope.searchConfig.searchDrawingsPaintings &&
                (result.medium == "cprint" || result.medium == "penc" || result.medium == "penink" ||
                result.medium == "mono" || result.medium == "wc" || result.medium == "paint")) return true;
            if ($scope.searchConfig.searchManuscripts &&
                (result.medium == "ms" || result.medium == "ltr" || result.medium == "te")) return true;
            if ($scope.searchConfig.searchRelatedMaterials &&
                (result.medium == "rmb" || result.medium == "rmoth")) return true;
            return false;
        };

        $scope.objectResultsMatchingFilter = function (resultType) {
            var i, inRange = [], results;
            if ($scope.results) {
                results = $scope.results.object_results[resultType].results;
                for (i = 0; i < results.length; i++) {
                    if (results[i].copy_composition_date >= $scope.searchConfig.minDate &&
                        results[i].copy_composition_date <= $scope.searchConfig.maxDate &&
                        objectMatchingMedium(results[i])) {
                        inRange.push(results[i]);
                    }
                }
            }
            return inRange;
        };

        $scope.workResultsMatchingFilter = function (resultType) {
            var i, inRange = [], results;
            if ($scope.results) {
                results = $scope.results.work_results[resultType].results;
                for (i = 0; i < results.length; i++) {
                    if (results[i].composition_date >= $scope.searchConfig.minDate &&
                        results[i].composition_date <= $scope.searchConfig.maxDate &&
                        workMatchingMedium(results[i])) {
                        inRange.push(results[i]);
                    }
                }
            }
            return inRange;
        };

        if ($routeParams.search) {
            $scope.searchConfig.searchString = $routeParams.search;
            $scope.search();
        }

        $scope.showWorks = true;
        $scope.showCopies = true;
        $scope.showObjects = true;
    }

    controller.$inject = ['$rootScope','$scope','$location','$routeParams','BlakeDataService'];

    angular.module('blake').controller('SearchController',controller);

}());
