(function(){

    var controller = function(){
        var vm = this;
        
        //vm.searchTerm = angular.isDefined($routeParams.searchTerm) ? $routeParams.searchTerm : '';

    }

    //controller.$inject = ['$routeParams'];

    var expandedSearchResults = function(){
        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/expanded-search-results/expandedSearchResults.html',
            controller: controller,
            scope: {
                resultTree: '=results',
                searchTerm: '@searchTerm',
            },
            controllerAs: 'esr',
            bindToController: true
        };
    }


    angular.module('blake').directive('expandedSearchResults', expandedSearchResults);

}());