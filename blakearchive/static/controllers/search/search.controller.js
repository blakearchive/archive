angular.module('blake').controller('SearchController', function($rootScope, $routeParams, SearchService){
    let vm = this;

    vm.s = SearchService;

    $rootScope.worksNavState = false;
    $rootScope.showWorkTitle = false;

    if ($routeParams.search) {
        vm.s.searchConfig.searchString = $routeParams.search;

        vm.s.removeStopWords();

        $routeParams.search = vm.s.searchConfig.searchString;

        if(vm.s.searchConfig.searchString == "") {
            vm.s.noresults = true;
        }
        else {
            vm.s.noresults = false;
            vm.s.search();
        }
    }
});