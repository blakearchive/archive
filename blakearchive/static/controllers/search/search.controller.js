angular.module('blake').controller('SearchController', function($rootScope,$scope,$location,$routeParams,BlakeDataService, SearchService, $q, directoryPrefix){
    let vm = this;

    vm.bds = BlakeDataService;
    vm.s = SearchService;

    $rootScope.worksNavState = false;
    $rootScope.showWorkTitle = false;

    vm.changeType = function(){
        let check = 0;
        let types = ['searchIlluminatedBooks','searchCommercialBookIllustrations','searchSeparatePrints','searchDrawingsPaintings','searchManuscripts','searchRelatedMaterials'];
        angular.forEach(types, function(type){
            if(vm.s.searchConfig[type]){
                check++;
            }
        });
        vm.s.searchConfig.searchAllTypes = check > 0 ? false : true;
        $scope.search();
    }

    vm.allTypes = function(){
        let types = ['searchIlluminatedBooks','searchCommercialBookIllustrations','searchSeparatePrints','searchDrawingsPaintings','searchManuscripts','searchRelatedMaterials'];
        if(vm.s.searchConfig.searchAllTypes){
            angular.forEach(types, function(type){
                vm.s.searchConfig[type] = false;
            });
        }
        $scope.search();
    }

    vm.changeField = function(){
        let check = 0;
        let fields = ['searchTitle','searchText','searchNotes','searchImageDescriptions','searchImageKeywords','searchWorks','searchCopies'];
        angular.forEach(fields, function(field){
            if(vm.s.searchConfig[field]){
                check++;
            }
        });
        vm.s.searchConfig.searchAllFields = check > 0 ? false : true;
    }

    vm.allFields = function(){
        let fields = ['searchTitle','searchText','searchNotes','searchImageDescriptions','searchImageKeywords','searchWorks','searchCopies'];
        if(vm.s.searchConfig.searchAllFields){
            angular.forEach(fields, function(field){
                vm.s.searchConfig[field] = false;
            });
        }
    }

    if ($routeParams.search) {
        vm.s.searchConfig.searchString = $routeParams.search;

        if(!vm.s.searchConfig.searchString.match(/\".*\"/g)) {

            for(x=0; x < $scope.stop_words.length; x++) {
                let re1 = new RegExp('\\s' + $scope.stop_words[x] + '\\s',"g");
                let re2 = new RegExp('^' + $scope.stop_words[x] + '\\s',"g");
                let re3 = new RegExp('\\s' + $scope.stop_words[x] + '$',"g");
                let re4 = new RegExp('^' + $scope.stop_words[x] + '$',"g");
                vm.s.searchConfig.searchString = vm.s.searchConfig.searchString.replace(re1," ");
                vm.s.searchConfig.searchString = vm.s.searchConfig.searchString.replace(re2,"");
                vm.s.searchConfig.searchString = vm.s.searchConfig.searchString.replace(re3,"");
                vm.s.searchConfig.searchString = vm.s.searchConfig.searchString.replace(re4,"");
            }


            vm.s.searchConfig.searchString = vm.s.searchConfig.searchString.replace(/\s\s*/g," ");
        }

        $routeParams.search = vm.s.searchConfig.searchString;

        if(vm.s.searchConfig.searchString == "") {
            $scope.noresults = true;
        }
        else {
            $scope.noresults = false;
            $scope.search();
        }
        console.log($scope.noresults);
    }
});