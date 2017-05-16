angular.module('blake').controller('SearchController', function($rootScope, $routeParams, SearchService){
    let vm = this;

    vm.s = SearchService;
    vm.rp = $routeParams;

    $rootScope.worksNavState = false;
    $rootScope.showWorkTitle = false;

    var isSafari = navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0;

    $rootScope.$on("$routeChangeSuccess", function () {
        if (vm.rp.search) {
            vm.s.searchConfig.searchString = vm.rp.search;

            vm.s.removeStopWords();

            vm.rp.search = vm.s.searchConfig.searchString;

            vm.s.search();
        }
    });


});