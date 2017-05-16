angular.module('blake').controller('SearchController', function($rootScope, $routeParams, SearchService){
    let vm = this;

    vm.s = SearchService;
    vm.rp = $routeParams;

    $rootScope.worksNavState = false;
    $rootScope.showWorkTitle = false;

    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);


    $rootScope.$on("$routeChangeSuccess", function () {
        if (vm.rp.search) {
            vm.s.searchConfig.searchString = vm.rp.search;

            vm.s.removeStopWords();

            vm.rp.search = vm.s.searchConfig.searchString;

            vm.s.search();
        }
    });


});