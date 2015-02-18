angular.module('blake').directive('copiesWorks', function() {
    function link(scope, element, attrs) {
        scope.$watch('copies', function (data) {
            if (!data) { return; }

            data.sort(function(a, b) { return a.source.comp_date["@value"] - b.source.comp_date["@value"]; });

            var copies = [];
            data.forEach(function(d) {
               copies.push(d);
            });

            scope.copies = copies;
        });
    }

    return {
        restrict: 'C',
        link: link,
        scope: {
            copies: '='
        },
        templateUrl: '/blake/static/directives/copies-of-works/template.html'
    };
});

angular.module('blake').controller('copyworksController', ['$scope', '$routeParams', 'BlakeDataService', function($scope, $routeParams, BlakeDataService) {
     BlakeDataService.getCopiesForWork($routeParams.work_id).then(function (results) {
        $scope.copies = results;
    });
}]);
