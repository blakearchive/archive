angular.module("blake").controller("SearchResultsController", function($scope,$rootScope,SearchService){
    const vm = this;
    vm.s = SearchService;

    $rootScope.help = 'search';

    $scope.$on('resize::resize',function(e,w){
        if(w.width > 992){
           vm.object_image_container = {'height':(w.height - 400)+'px'};
        }
    });

    $scope.$on('searchResultDirective::showCopies', vm.s.showCopiesHandler);
    
});

angular.module('blake').directive('searchResults', function(){
    return {
        restrict: 'E',
        template: require('html-loader!./searchResults.html'),
        controller: "SearchResultsController",
        scope: {
            results: '=results',
            label: '@label',
            type: '@type',
            tree: '@tree'
        },
        controllerAs: 'esr',
        bindToController: true
    };
});