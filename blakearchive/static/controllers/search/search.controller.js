/**
 * Created by lukeluke on 1/26/16.
 */

(function(){

    /** @ngInject */
    var controller = function($rootScope,$scope,$location,$routeParams,BlakeDataService,$q){

        vm = this;

        vm.bds = BlakeDataService;
        vm.queryString = '';
        $scope.noresults = false;

        $rootScope.worksNavState = false;
        $rootScope.showWorkTitle = false;


        $scope.objectResults = [];
        $scope.copyResults = [];
        $scope.workResults = [];

        $scope.stop_words = ["a",
            "about",
            "above",
            "after",
            "again",
            "against",
            "all",
            "am",
            "an",
            "and",
            "any",
            "are",
            "aren't",
            "as",
            "at",
            "be",
            "because",
            "been",
            "before",
            "being",
            "below",
            "between",
            "both",
            "but",
            "by",
            "can't",
            "cannot",
            "could",
            "couldn't",
            "did",
            "didn't",
            "do",
            "does",
            "doesn't",
            "doing",
            "don't",
            "down",
            "during",
            "each",
            "few",
            "for",
            "from",
            "further",
            "had",
            "hadn't",
            "has",
            "hasn't",
            "have",
            "haven't",
            "having",
            "he",
            "he'd",
            "he'll",
            "he's",
            "her",
            "here",
            "here's",
            "hers",
            "herself",
            "him",
            "himself",
            "his",
            "how",
            "how's",
            "i",
            "i'd",
            "i'll",
            "i'm",
            "i've",
            "if",
            "in",
            "into",
            "is",
            "isn't",
            "it",
            "it's",
            "its",
            "itself",
            "let's",
            "me",
            "more",
            "most",
            "mustn't",
            "my",
            "myself",
            "no",
            "nor",
            "not",
            "of",
            "off",
            "on",
            "once",
            "only",
            "or",
            "other",
            "ought",
            "our",
            "ours   ",
            "ourselves",
            "out",
            "over",
            "own",
            "same",
            "shan't",
            "she",
            "she'd",
            "she'll",
            "she's",
            "should",
            "shouldn't",
            "so",
            "some",
            "such",
            "than",
            "that",
            "that's",
            "the",
            "their",
            "theirs",
            "them",
            "themselves",
            "then",
            "there",
            "there's",
            "these",
            "they",
            "they'd",
            "they'll",
            "they're",
            "they've",
            "this",
            "those",
            "through",
            "to",
            "too",
            "under",
            "until",
            "up",
            "very",
            "was",
            "wasn't",
            "we",
            "we'd",
            "we'll",
            "we're",
            "we've",
            "were",
            "weren't",
            "what",
            "what's",
            "when",
            "when's",
            "where",
            "where's",
            "which",
            "while",
            "who",
            "who's",
            "whom",
            "why",
            "why's",
            "with",
            "won't",
            "would",
            "wouldn't",
            "you",
            "you'd",
            "you'll",
            "you're",
            "you've",
            "your",
            "yours",
            "yourself",
            "yourselves"];

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
                //console.log($scope.copyResults);
                //console.log($scope.objectResults);
                //console.log($scope.workResults);
                $rootScope.$broadcast('searchCtrl::newSearch');
                //$location.search('search',encodeURIComponent($scope.searchConfig.searchString));
            });

        };

        $scope.loadSearchPage = function () {
            if($scope.searchConfig.searchString != null) {
                $location.url(directoryPrefix + "/search?search=" + encodeURIComponent($scope.searchConfig.searchString));
            }
        };

        $scope.searchConfig = {
            useCompDate: true,
            usePrintDate: false,
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
            //console.log($scope.stop_words);
            //console.log($scope.searchConfig);
            //console.log($scope.searchConfig.searchString)
            //console.log($routeParams.search);
            $scope.searchConfig.searchString = $routeParams.search;

            if(!$scope.searchConfig.searchString.match(/\".*\"/g)) {
                 
                for(x=0; x < $scope.stop_words.length; x++) {
                    var re1 = new RegExp('\\s' + $scope.stop_words[x] + '\\s',"g");
                    var re2 = new RegExp('^' + $scope.stop_words[x] + '\\s',"g");
                    var re3 = new RegExp('\\s' + $scope.stop_words[x] + '$',"g");
                    var re4 = new RegExp('^' + $scope.stop_words[x] + '$',"g");
                    $scope.searchConfig.searchString = $scope.searchConfig.searchString.replace(re1," ");
                    $scope.searchConfig.searchString = $scope.searchConfig.searchString.replace(re2,"");
                    $scope.searchConfig.searchString = $scope.searchConfig.searchString.replace(re3,"");
                    $scope.searchConfig.searchString = $scope.searchConfig.searchString.replace(re4,"");
                }
            
            
                $scope.searchConfig.searchString = $scope.searchConfig.searchString.replace(/\s\s*/g," ");
            }

            $routeParams.search = $scope.searchConfig.searchString;

            //console.log($scope.searchConfig.searchString);
            //console.log($routeParams.search);
            if($scope.searchConfig.searchString == "") {
                $scope.noresults = true;
            }
            else {
                $scope.noresults = false;
                $scope.search();
            }
            console.log($scope.noresults);
        }





    }

    angular.module('blake').controller('SearchController',
        ['$rootScope', '$scope', '$location', '$routeParams', 'BlakeDataService', '$q', controller]);

}());
